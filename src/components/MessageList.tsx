import React, { useEffect, useRef } from "react";
import { Message, User } from "../types";
import MessageBubble from "./MessageBubble";
import { Loader2 } from "lucide-react";

interface MessageListProps {
  messages: Message[];
  currentUser: User | null;
  isLoading: boolean;
  searchQuery?: string;
  highlightedMessageId?: string;
}

const MessageList: React.FC<MessageListProps> = ({
  messages,
  currentUser,
  isLoading,
  searchQuery,
  highlightedMessageId,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { [key: string]: Message[] } = {};

    messages.forEach((message) => {
      const dateKey = message.timestamp.toDateString();
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(message);
    });

    return groups;
  };

  const formatDateHeader = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString([], {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
  };

  const messageGroups = groupMessagesByDate(messages);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center h-full">
        <Loader2 className="animate-spin text-wa-green" size={48} />
      </div>
    );
  }

  return (
    <div className="px-4 md:px-6 py-4">
      {Object.entries(messageGroups).map(([dateString, dateMessages]) => (
        <div key={dateString}>
          {/* Date header */}
          <div className="flex justify-center mb-4">
            <div className="bg-white dark:bg-wa-panel-bg-dark px-3 py-1 rounded-lg shadow-sm border border-gray-200 dark:border-transparent text-xs text-gray-600 dark:text-wa-text-secondary-dark">
              {formatDateHeader(dateString)}
            </div>
          </div>

          {/* Messages for this date */}
          {dateMessages.map((message, index) => (
            <MessageBubble
              key={message.id}
              message={message}
              currentUser={currentUser}
              isLast={index === dateMessages.length - 1}
              searchQuery={searchQuery}
              isHighlighted={message.id === highlightedMessageId}
            />
          ))}
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
