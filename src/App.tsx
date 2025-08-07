import React, { useState, useEffect, useCallback } from "react";
import Sidebar from "./components/Sidebar";
import ChatArea from "./components/ChatArea";
import ProfileSidebar from "./components/ProfileSidebar";
import LoginPage from "./components/LoginPage";
import { User, Chat, Message } from "./types";
import { SocketProvider, useSocket } from "./context/SocketContext";
import api from "./services/api";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [chatList, setChatList] = useState<Chat[]>([]);
  const [isLoadingChats, setIsLoadingChats] = useState(false);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const selectedChat =
    chatList.find((chat) => chat.id === selectedChatId) || null;

  const handleLogin = () => {
    const userJson = localStorage.getItem("user");
    if (userJson) {
      setCurrentUser(JSON.parse(userJson));
    }
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
    setCurrentUser(null);
    setChatList([]);
    setSelectedChatId(null);
    setShowProfile(false);
  };

  const handleUserUpdate = (updatedUser: User) => {
    setCurrentUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  const handleNewMessageUpdate = useCallback(
    (chatId: string, message: Message, isNewUnreadMessage: boolean) => {
      setChatList((prevChatList) => {
        const chatIndex = prevChatList.findIndex((chat) => chat.id === chatId);
        if (chatIndex === -1) {
          return prevChatList;
        }

        const chatToUpdate = prevChatList[chatIndex];

        const updatedChat: Chat = {
          ...chatToUpdate,
          lastMessage: message,
          unreadCount: isNewUnreadMessage
            ? (chatToUpdate.unreadCount || 0) + 1
            : chatToUpdate.unreadCount,
        };

        const filteredList = prevChatList.filter((chat) => chat.id !== chatId);
        return [updatedChat, ...filteredList];
      });
    },
    []
  );

  const handleAddNewContact = useCallback(
    (newContact: User, selectChat: boolean = true) => {
      setChatList((prevChatList) => {
        const chatExists = prevChatList.some(
          (chat) => chat.user._id === newContact._id
        );

        if (!chatExists) {
          const newChat: Chat = {
            id: newContact._id,
            user: { ...newContact, isOnline: true },
            unreadCount: 0,
            isPinned: false,
            isArchived: false,
          };
          if (selectChat) {
            setSelectedChatId(newChat.id);
          }
          return [newChat, ...prevChatList];
        }

        if (selectChat) {
          setSelectedChatId(newContact._id);
        }
        return prevChatList;
      });
    },
    []
  );

  const handleChatSelect = (chatId: string) => {
    setSelectedChatId(chatId);
    // Reset unread count for the selected chat
    setChatList((prev) =>
      prev.map((chat) =>
        chat.id === chatId ? { ...chat, unreadCount: 0 } : chat
      )
    );
    // On mobile, we'll show the chat area
    if (window.innerWidth < 768) {
      setIsMobile(true);
    }
  };

  const handleBackToChats = () => {
    setSelectedChatId(null);
    setIsMobile(false);
  };

  const handleThemeToggle = () => {
    setIsDarkMode((prev) => !prev);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userJson = localStorage.getItem("user");
    if (token && userJson) {
      setCurrentUser(JSON.parse(userJson));
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    const fetchContacts = async () => {
      if (!isAuthenticated) return;

      setIsLoadingChats(true);
      try {
        const response = await api.get<User[]>("/users/contacts");
        const contacts = response.data;

        const newChatList: Chat[] = contacts.map((contact) => ({
          id: contact._id,
          user: { ...contact, isOnline: true }, // Assuming online status for demo
          unreadCount: 0,
          isPinned: false,
          isArchived: false,
        }));

        setChatList(newChatList);
      } catch (error) {
        console.error("Error fetching contacts:", error);
      } finally {
        setIsLoadingChats(false);
      }
    };

    fetchContacts();
  }, [isAuthenticated]);

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [isDarkMode]);

  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobile(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <SocketProvider>
      <AuthenticatedApp
        currentUser={currentUser}
        chatList={chatList}
        isLoadingChats={isLoadingChats}
        selectedChatId={selectedChatId}
        isMobile={isMobile}
        isDarkMode={isDarkMode}
        showProfile={showProfile}
        selectedChat={selectedChat}
        handleChatSelect={handleChatSelect}
        handleBackToChats={handleBackToChats}
        handleThemeToggle={handleThemeToggle}
        setShowProfile={setShowProfile}
        handleUserUpdate={handleUserUpdate}
        handleLogout={handleLogout}
        handleAddNewContact={handleAddNewContact}
        handleNewMessageUpdate={handleNewMessageUpdate}
        setChatList={setChatList}
      />
    </SocketProvider>
  );
}

// Wrapper component to use socket context
const AuthenticatedApp = (props: any) => {
  const {
    currentUser,
    selectedChatId,
    handleNewMessageUpdate,
    handleAddNewContact,
    setChatList,
  } = props;
  const { socket, userStatusUpdates, removeUserStatusListener } = useSocket();

  useEffect(() => {
    if (!socket || !currentUser) return;

    try {
      // Handles incoming messages for chats that are NOT currently open
      const handleGlobalNewMessage = (message: any) => {
        try {
          const senderId = message.senderId;
          // Only update if the message is from another user and not for the currently active chat
          if (
            senderId &&
            senderId !== currentUser._id &&
            senderId !== selectedChatId
          ) {
            const newMessage: Message = {
              id: message._id,
              senderId: message.senderId,
              text: message.text,
              timestamp: new Date(message.timestamp),
              status: message.status,
              type: message.type,
            };
            // The senderId is the same as the chatId in our structure
            handleNewMessageUpdate(senderId, newMessage, true);
          }
        } catch (error) {
          console.error("Error handling global new message:", error);
        }
      };

      const handleNewContact = (newContact: User) => {
        try {
          handleAddNewContact(newContact, false);
          alert(`${newContact.name} added you as a contact!`);
        } catch (error) {
          console.error("Error handling new contact:", error);
        }
      };

      // Set up user status update listener
      const handleUserStatusUpdate = (data: {
        userId: string;
        isOnline: boolean;
        lastSeen: Date;
      }) => {
        console.log("User status update received:", data);
        setChatList((prevChatList: Chat[]) =>
          prevChatList.map((chat) => {
            const userId = chat.user._id;
            return userId === data.userId
              ? {
                  ...chat,
                  user: {
                    ...chat.user,
                    isOnline: data.isOnline,
                    lastSeen: data.isOnline
                      ? undefined
                      : new Date(data.lastSeen).toLocaleString(),
                  },
                }
              : chat;
          })
        );
      };

      socket.on("newMessage", handleGlobalNewMessage);
      socket.on("newContact", handleNewContact);
      userStatusUpdates(handleUserStatusUpdate);

      return () => {
        socket.off("newMessage", handleGlobalNewMessage);
        socket.off("newContact", handleNewContact);
        removeUserStatusListener();
      };
    } catch (error) {
      console.error("Error setting up socket listeners:", error);
    }
  }, [
    socket,
    currentUser,
    selectedChatId,
    handleNewMessageUpdate,
    handleAddNewContact,
    setChatList,
    userStatusUpdates,
    removeUserStatusListener,
  ]);

  return (
    <div className="h-screen bg-gray-100 dark:bg-wa-chat-bg-dark flex overflow-hidden">
      <div className="flex h-full w-full max-w-none">
        <div
          className={`md:flex ${
            props.isMobile && props.selectedChatId ? "hidden" : "flex"
          } md:w-auto w-full`}
        >
          {props.showProfile ? (
            <ProfileSidebar
              currentUser={props.currentUser}
              onBack={() => props.setShowProfile(false)}
              onUpdateUser={props.handleUserUpdate}
            />
          ) : (
            <Sidebar
              currentUser={props.currentUser}
              chatList={props.chatList}
              isLoadingChats={props.isLoadingChats}
              selectedChatId={props.selectedChatId}
              onChatSelect={props.handleChatSelect}
              isDarkMode={props.isDarkMode}
              onThemeToggle={props.handleThemeToggle}
              onShowProfile={() => props.setShowProfile(true)}
              onLogout={props.handleLogout}
              onAddNewContact={props.handleAddNewContact}
            />
          )}
        </div>
        <div
          className={`flex-1 ${
            !props.selectedChatId && window.innerWidth < 768
              ? "hidden md:flex"
              : "flex"
          }`}
        >
          <ChatArea
            currentUser={props.currentUser}
            selectedChat={props.selectedChat}
            onBackToChats={props.handleBackToChats}
            isMobile={props.isMobile}
            isDarkMode={props.isDarkMode}
            onNewMessageUpdate={props.handleNewMessageUpdate}
          />
        </div>
      </div>
    </div>
  );
};

export default App;
