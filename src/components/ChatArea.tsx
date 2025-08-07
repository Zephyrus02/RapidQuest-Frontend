import React, { useState, useEffect } from "react";
import {
  Search,
  MoreVertical,
  ArrowLeft,
  MessageCircle,
  Archive,
  Delete,
  Blocks as Block,
  Import as Report,
  ChevronUp,
  ChevronDown,
  X,
  Loader2,
} from "lucide-react";
import { Chat, Message, User } from "../types";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import { useSocket } from "../context/SocketContext";
import api from "../services/api";

interface ChatAreaProps {
  currentUser: User | null;
  selectedChat: Chat | null;
  onBackToChats?: () => void;
  isMobile?: boolean;
  isDarkMode?: boolean;
  onNewMessageUpdate: (
    chatId: string,
    message: Message,
    isNewUnreadMessage: boolean
  ) => void;
}

const ChatArea: React.FC<ChatAreaProps> = ({
  currentUser,
  selectedChat,
  onBackToChats,
  isMobile,
  isDarkMode,
  onNewMessageUpdate,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [currentResultIndex, setCurrentResultIndex] = useState(-1);
  const { socket, sendMessage: socketSendMessage, isConnected } = useSocket();

  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedChat || !selectedChat.user.email || !currentUser) {
        setMessages([]);
        return;
      }

      setIsLoadingMessages(true);
      try {
        const response = await api.get(`/messages/${selectedChat.user.email}`);
        const loadedMessages: Message[] = response.data.map((msg: any) => ({
          id: msg._id,
          text: msg.text,
          timestamp: new Date(msg.timestamp),
          senderId:
            msg.from === currentUser.phone
              ? currentUser._id
              : selectedChat.user._id,
          status: msg.status,
          type: msg.type,
        }));
        setMessages(loadedMessages);

        if (socket) {
          socket.emit("markMessagesAsRead", {
            chatPartnerId: selectedChat.user._id,
          });
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
        setMessages([]);
      } finally {
        setIsLoadingMessages(false);
      }
    };

    fetchMessages();
  }, [selectedChat, currentUser, socket]);

  useEffect(() => {
    if (!socket || !selectedChat || !currentUser) return;

    const handleNewMessage = (message: any) => {
      const newMessage: Message = {
        id: message._id,
        senderId: message.senderId,
        text: message.text,
        timestamp: new Date(message.timestamp),
        status: message.status,
        type: message.type,
      };

      if (newMessage.senderId === selectedChat.user._id) {
        setMessages((prev) => [...prev, newMessage]);
        onNewMessageUpdate(selectedChat.id, newMessage, false);
        socket.emit("messageDeliveredAck", { messageId: newMessage.id });
        socket.emit("markMessagesAsRead", {
          chatPartnerId: selectedChat.user._id,
        });
      }
    };

    const handleMessageStatusUpdate = ({
      messageId,
      status,
    }: {
      messageId: string;
      status: "delivered" | "read";
    }) => {
      setMessages((prev) =>
        prev.map((msg) => (msg.id === messageId ? { ...msg, status } : msg))
      );
    };

    const handleMessagesRead = ({
      chatPartnerId,
    }: {
      chatPartnerId: string;
    }) => {
      if (selectedChat.user._id === chatPartnerId) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.senderId === currentUser._id ? { ...msg, status: "read" } : msg
          )
        );
      }
    };

    socket.on("newMessage", handleNewMessage);
    socket.on("messageStatusUpdate", handleMessageStatusUpdate);
    socket.on("messagesRead", handleMessagesRead);

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("messageStatusUpdate", handleMessageStatusUpdate);
      socket.off("messagesRead", handleMessagesRead);
    };
  }, [socket, selectedChat, currentUser, onNewMessageUpdate]);

  const handleSendMessage = async (
    textOrMessage: string | Partial<Message>
  ) => {
    if (!selectedChat || !currentUser) return;

    if (typeof textOrMessage === "string") {
      const body = textOrMessage;
      const receiverEmail = selectedChat.user.email;

      if (!receiverEmail) {
        console.error("Receiver email not found for the selected chat.");
        return;
      }

      // Create optimistic message (temporary message that appears immediately)
      const tempId = `temp_${Date.now()}_${Math.random()}`;
      const optimisticMessage: Message = {
        id: tempId,
        text: body,
        timestamp: new Date(),
        senderId: currentUser._id,
        status: "sending",
        type: "text",
      };

      // Add optimistic message immediately
      setMessages((prev) => [...prev, optimisticMessage]);
      onNewMessageUpdate(selectedChat.id, optimisticMessage, false);

      try {
        // Use Socket.IO if connected, fallback to API
        if (isConnected && socketSendMessage) {
          // Listen for the actual message confirmation
          const handleMessageSent = (data: { tempId: string; message: any }) => {
            if (data.tempId === tempId) {
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === tempId
                    ? {
                        id: data.message.id,
                        text: data.message.text,
                        timestamp: new Date(data.message.timestamp),
                        senderId: data.message.senderId,
                        status: data.message.status,
                        type: data.message.type,
                      }
                    : msg
                )
              );
              socket?.off("messageSent", handleMessageSent);
            }
          };

          const handleMessageError = (data: { tempId: string; error: string }) => {
            if (data.tempId === tempId) {
              // Update message status to failed
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === tempId ? { ...msg, status: "failed" } : msg
                )
              );
              console.error("Message failed:", data.error);
              socket?.off("messageSent", handleMessageSent);
              socket?.off("messageError", handleMessageError);
            }
          };

          socket?.on("messageSent", handleMessageSent);
          socket?.on("messageError", handleMessageError);

          await socketSendMessage(receiverEmail, body);
        } else {
          // Fallback to REST API
          const response = await api.post("/messages/", {
            receiverEmail,
            body,
          });

          const sentMessage: Message = {
            id: response.data.id,
            text: response.data.text,
            timestamp: new Date(response.data.timestamp),
            senderId: response.data.senderId,
            status: response.data.status,
            type: response.data.type,
          };

          // Replace optimistic message with real message
          setMessages((prev) =>
            prev.map((msg) => (msg.id === tempId ? sentMessage : msg))
          );
        }
      } catch (error) {
        console.error("Error sending message:", error);
        // Update optimistic message status to failed
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === tempId ? { ...msg, status: "failed" } : msg
          )
        );
      }
    } else {
      // Handle file messages locally as before
      const newMessage: Message = {
        id: Date.now().toString(),
        text: textOrMessage.text || "",
        timestamp: new Date(),
        senderId: currentUser._id,
        status: "sent",
        type: "text",
        ...(textOrMessage as Partial<Message>),
      };
      setMessages((prev) => [...prev, newMessage]);
      onNewMessageUpdate(selectedChat.id, newMessage, false);
    }
  };

  const handleCloseSearch = () => {
    setIsSearching(false);
    setSearchQuery("");
  };

  const handleNextResult = () => {
    if (searchResults.length > 0) {
      setCurrentResultIndex((prev) => (prev + 1) % searchResults.length);
    }
  };

  const handlePrevResult = () => {
    if (searchResults.length > 0) {
      setCurrentResultIndex(
        (prev) => (prev - 1 + searchResults.length) % searchResults.length
      );
    }
  };

  const handleArchiveChat = () => {
    console.log("Archiving chat...");
    setShowDropdown(false);
  };

  const handleDeleteChat = () => {
    console.log("Deleting chat...");
    setShowDropdown(false);
  };

  const handleBlockUser = () => {
    console.log("Blocking user...");
    setShowDropdown(false);
  };

  const handleReportUser = () => {
    console.log("Reporting user...");
    setShowDropdown(false);
  };

  if (!selectedChat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-wa-panel-bg-dark relative overflow-hidden border-l border-gray-200 dark:border-wa-border-dark">
        {/* Background pattern */}
        <div
          className="absolute inset-0 hidden dark:block"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3e%3cpath d='M 0 15 C 10 0, 20 0, 30 15 S 50 30, 60 15' stroke='%232a3942' stroke-width='1' fill='none'/%3e%3cpath d='M 0 45 C 10 30, 20 30, 30 45 S 50 60, 60 45' stroke='%232a3942' stroke-width='1' fill='none'/%3e%3c/svg%3e")`,
          }}
        />
        <div
          className="absolute inset-0 dark:hidden"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3e%3cpath d='M 0 15 C 10 0, 20 0, 30 15 S 50 30, 60 15' stroke='%23e5e7eb' stroke-width='1' fill='none'/%3e%3cpath d='M 0 45 C 10 30, 20 30, 30 45 S 50 60, 60 45' stroke='%23e5e7eb' stroke-width='1' fill='none'/%3e%3c/svg%3e")`,
          }}
        />

        <div className="text-center z-10">
          <div className="w-80 h-80 mx-auto mb-8 flex items-center justify-center">
            <div className="w-64 h-64 bg-gray-200 dark:bg-wa-hover-dark rounded-full flex items-center justify-center shadow-lg">
              <MessageCircle
                size={120}
                className="text-gray-400 dark:text-wa-text-secondary-dark"
              />
            </div>
          </div>
          <h2 className="text-3xl font-light text-gray-800 dark:text-wa-text-dark mb-4">
            WhatsApp Web
          </h2>
          <p className="text-gray-600 dark:text-wa-text-secondary-dark mb-6 max-w-md mx-auto leading-relaxed">
            Send and receive messages without keeping your phone online.
          </p>
          <p className="text-gray-500 dark:text-wa-text-secondary-dark text-sm max-w-lg mx-auto leading-relaxed">
            Use WhatsApp on up to 4 linked devices and 1 phone at the same time.
          </p>

          {/* Bottom text with encryption info */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center text-gray-500 dark:text-wa-text-secondary-dark text-sm">
            <div className="w-4 h-4 mr-2 flex items-center justify-center">
              <div className="w-3 h-3 border border-gray-400 dark:border-wa-text-secondary-dark rounded-sm flex items-center justify-center">
                <div className="w-1 h-1 bg-gray-400 dark:bg-wa-text-secondary-dark rounded-full"></div>
              </div>
            </div>
            <span>
              Your personal messages are{" "}
              <span className="text-green-600 dark:text-wa-green">
                end-to-end encrypted
              </span>
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-50 dark:bg-wa-chat-bg-dark">
      {/* Chat Header */}
      {isSearching ? (
        <div className="bg-gray-50 dark:bg-wa-panel-bg-dark border-b border-gray-200 dark:border-wa-border-dark px-4 md:px-6 py-3 flex items-center justify-between">
          <div className="flex-1 flex items-center">
            <Search
              size={20}
              className="text-gray-500 dark:text-wa-text-secondary-dark"
            />
            <input
              type="text"
              placeholder="Search..."
              className="w-full ml-4 bg-transparent focus:outline-none text-gray-900 dark:text-wa-text-dark"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
          </div>
          <div className="flex items-center space-x-2 text-gray-600 dark:text-wa-panel-header-icon-dark">
            {searchResults.length > 0 ? (
              <span className="text-sm text-gray-500 dark:text-wa-text-secondary-dark">
                {currentResultIndex + 1} of {searchResults.length}
              </span>
            ) : (
              searchQuery && (
                <span className="text-sm text-gray-500 dark:text-wa-text-secondary-dark">
                  No results
                </span>
              )
            )}
            <button
              onClick={handlePrevResult}
              disabled={searchResults.length === 0}
              className="p-2 hover:bg-gray-200 dark:hover:bg-wa-hover-dark rounded-full transition-colors disabled:opacity-50"
            >
              <ChevronUp size={20} />
            </button>
            <button
              onClick={handleNextResult}
              disabled={searchResults.length === 0}
              className="p-2 hover:bg-gray-200 dark:hover:bg-wa-hover-dark rounded-full transition-colors disabled:opacity-50"
            >
              <ChevronDown size={20} />
            </button>
            <button
              onClick={handleCloseSearch}
              className="p-2 hover:bg-gray-200 dark:hover:bg-wa-hover-dark rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 dark:bg-wa-panel-bg-dark border-b border-gray-200 dark:border-wa-border-dark px-4 md:px-6 py-3 flex items-center justify-between">
          {/* Mobile back button */}
          {isMobile && (
            <button
              onClick={onBackToChats}
              className="p-2 text-gray-600 dark:text-wa-panel-header-icon-dark hover:bg-gray-200 dark:hover:bg-wa-hover-dark rounded-full transition-colors mr-2 md:hidden"
            >
              <ArrowLeft size={20} />
            </button>
          )}

          <div className="flex items-center space-x-3">
            <div className="relative">
              <img
                src={selectedChat.user.profilePhoto}
                alt={selectedChat.user.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              {selectedChat.user.isOnline && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-wa-panel-bg-dark rounded-full"></div>
              )}
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-wa-text-dark">
                {selectedChat.user.name}
              </h2>
              <p className="text-sm text-gray-600 dark:text-wa-text-secondary-dark">
                {selectedChat.user.isOnline
                  ? "online"
                  : selectedChat.user.lastSeen}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-gray-600 dark:text-wa-panel-header-icon-dark">
            <button
              onClick={() => setIsSearching(true)}
              className="p-2 hover:bg-gray-200 dark:hover:bg-wa-hover-dark rounded-full transition-colors"
            >
              <Search size={20} />
            </button>
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="p-2 hover:bg-gray-200 dark:hover:bg-wa-hover-dark rounded-full transition-colors"
              >
                <MoreVertical size={20} />
              </button>

              {showDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowDropdown(false)}
                  />
                  <div className="absolute right-0 top-12 w-48 bg-white dark:bg-wa-panel-bg-dark rounded-lg shadow-lg border border-gray-200 dark:border-wa-border-dark py-2 z-20">
                    <button
                      onClick={handleArchiveChat}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-wa-hover-dark flex items-center space-x-3 text-gray-700 dark:text-wa-text-dark"
                    >
                      <Archive size={18} />
                      <span>Archive chat</span>
                    </button>
                    <button
                      onClick={handleDeleteChat}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-wa-hover-dark flex items-center space-x-3 text-gray-700 dark:text-wa-text-dark"
                    >
                      <Delete size={18} />
                      <span>Delete chat</span>
                    </button>
                    <div className="border-t border-gray-200 dark:border-wa-border-dark my-1" />
                    <button
                      onClick={handleBlockUser}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-wa-hover-dark flex items-center space-x-3 text-red-600"
                    >
                      <Block size={18} />
                      <span>Block user</span>
                    </button>
                    <button
                      onClick={handleReportUser}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-wa-hover-dark flex items-center space-x-3 text-red-600"
                    >
                      <Report size={18} />
                      <span>Report user</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden relative">
        {/* Background pattern */}
        <div
          className="absolute inset-0 hidden dark:block"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3e%3cpath d='M 0 15 C 10 0, 20 0, 30 15 S 50 30, 60 15' stroke='%232a3942' stroke-width='1' fill='none'/%3e%3cpath d='M 0 45 C 10 30, 20 30, 30 45 S 50 60, 60 45' stroke='%232a3942' stroke-width='1' fill='none'/%3e%3c/svg%3e")`,
          }}
        ></div>
        <div
          className="absolute inset-0 dark:hidden"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3e%3cpath d='M 0 15 C 10 0, 20 0, 30 15 S 50 30, 60 15' stroke='%23e5e7eb' stroke-width='1' fill='none'/%3e%3cpath d='M 0 45 C 10 30, 20 30, 30 45 S 50 60, 60 45' stroke='%23e5e7eb' stroke-width='1' fill='none'/%3e%3c/svg%3e")`,
          }}
        ></div>
        <div className="relative z-10 h-full">
          <MessageList
            currentUser={currentUser}
            messages={messages}
            isLoading={isLoadingMessages}
            searchQuery={searchQuery}
            highlightedMessageId={
              searchResults.length > 0
                ? searchResults[currentResultIndex]
                : undefined
            }
          />
        </div>
      </div>

      {/* Message Input */}
      <MessageInput onSendMessage={handleSendMessage} isDarkMode={isDarkMode} />
    </div>
  );
};

export default ChatArea;
