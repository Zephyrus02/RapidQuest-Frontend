import React, { useRef, useEffect } from "react";
import {
  Check,
  CheckCheck,
  FileText,
  Download,
  Clock,
  AlertCircle,
} from "lucide-react";
import { Message, User } from "../types";

interface MessageBubbleProps {
  message: Message;
  currentUser: User | null;
  isLast: boolean;
  searchQuery?: string;
  isHighlighted?: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  currentUser,
  isLast,
  searchQuery,
  isHighlighted,
}) => {
  const isSentByMe = currentUser ? message.senderId === currentUser._id : false;
  const bubbleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isHighlighted) {
      bubbleRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [isHighlighted]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const getHighlightedText = (text: string, highlight: string) => {
    if (!highlight.trim()) {
      return <span>{text}</span>;
    }
    const parts = text.split(new RegExp(`(${highlight})`, "gi"));
    return (
      <span>
        {parts.map((part, i) =>
          part.toLowerCase() === highlight.toLowerCase() ? (
            <mark
              key={i}
              className="bg-yellow-300 dark:bg-yellow-500 text-black rounded px-0.5"
            >
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  const renderMessageContent = () => {
    switch (message.type) {
      case "image":
        return (
          <div className="relative">
            <img
              src={message.fileUrl}
              alt={message.fileName}
              className="rounded-lg max-w-xs max-h-80 object-cover"
            />
            <div className="absolute bottom-1 right-1 flex items-center space-x-1 bg-black bg-opacity-50 px-1.5 py-0.5 rounded-full">
              <span
                className={`text-xs ${
                  isSentByMe ? "text-green-100" : "text-gray-300"
                }`}
              >
                {formatTime(message.timestamp)}
              </span>
              {isSentByMe && (
                <div className="flex-shrink-0">
                  {message.status === "read" ? (
                    <CheckCheck size={14} className="text-blue-500" />
                  ) : message.status === "delivered" ? (
                    <CheckCheck size={14} className="text-white opacity-90" />
                  ) : message.status === "sent" ? (
                    <Check size={14} className="text-white opacity-90" />
                  ) : message.status === "sending" ? (
                    <Clock
                      size={14}
                      className="text-white opacity-75 animate-pulse"
                    />
                  ) : message.status === "failed" ? (
                    <div title="Failed to send">
                      <AlertCircle size={14} className="text-red-400" />
                    </div>
                  ) : (
                    <Check size={14} className="text-white opacity-90" />
                  )}
                </div>
              )}
            </div>
          </div>
        );
      case "document":
        return (
          <div className="flex items-center">
            <div className="bg-gray-200 dark:bg-wa-panel-bg-dark p-3 rounded-full mr-3">
              <FileText
                size={24}
                className="text-gray-600 dark:text-wa-text-secondary-dark"
              />
            </div>
            <div className="flex-1">
              <p className="text-sm leading-relaxed truncate">
                {message.fileName}
              </p>
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-wa-text-secondary-dark mt-1">
                <span>{message.fileSize}</span>
                <div className="flex items-center space-x-1">
                  <span>{formatTime(message.timestamp)}</span>
                  {isSentByMe && (
                    <div className="flex-shrink-0">
                      {message.status === "read" ? (
                        <CheckCheck
                          size={14}
                          className="text-blue-500 dark:text-wa-read-receipt-dark"
                        />
                      ) : message.status === "delivered" ? (
                        <CheckCheck
                          size={14}
                          className="text-gray-500 dark:text-wa-text-secondary-dark"
                        />
                      ) : message.status === "sent" ? (
                        <Check
                          size={14}
                          className="text-gray-500 dark:text-wa-text-secondary-dark"
                        />
                      ) : message.status === "sending" ? (
                        <Clock
                          size={14}
                          className="text-gray-500 dark:text-wa-text-secondary-dark opacity-75 animate-pulse"
                        />
                      ) : message.status === "failed" ? (
                        <div title="Failed to send">
                          <AlertCircle size={14} className="text-red-400" />
                        </div>
                      ) : (
                        <Check
                          size={14}
                          className="text-gray-500 dark:text-wa-text-secondary-dark"
                        />
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <a
              href={message.fileUrl}
              download={message.fileName}
              className="p-2 ml-2 text-gray-500 dark:text-wa-text-secondary-dark hover:bg-gray-200 dark:hover:bg-wa-panel-bg-dark rounded-full"
            >
              <Download size={20} />
            </a>
          </div>
        );
      case "text":
      default:
        return (
          <div>
            <div className="text-sm leading-relaxed break-words">
              {getHighlightedText(message.text, searchQuery || "")}
            </div>
            <div className="flex justify-end items-center mt-1">
              <div className="flex items-center space-x-1">
                <span
                  className={`text-xs ${
                    isSentByMe
                      ? "text-green-100 dark:text-wa-text-secondary-dark opacity-75"
                      : "text-gray-500 dark:text-wa-text-secondary-dark"
                  }`}
                >
                  {formatTime(message.timestamp)}
                </span>
                {isSentByMe && (
                  <div className="flex-shrink-0">
                    {message.status === "read" ? (
                      <CheckCheck
                        size={16}
                        className="text-blue-500 dark:text-wa-read-receipt-dark"
                      />
                    ) : message.status === "delivered" ? (
                      <CheckCheck
                        size={16}
                        className="text-white opacity-75 dark:text-wa-text-secondary-dark"
                      />
                    ) : message.status === "sent" ? (
                      <Check
                        size={16}
                        className="text-white opacity-75 dark:text-wa-text-secondary-dark"
                      />
                    ) : message.status === "sending" ? (
                      <Clock
                        size={16}
                        className="text-white opacity-60 animate-pulse"
                      />
                    ) : message.status === "failed" ? (
                      <div title="Failed to send">
                        <AlertCircle size={16} className="text-red-400" />
                      </div>
                    ) : (
                      <Check
                        size={16}
                        className="text-white opacity-75 dark:text-wa-text-secondary-dark"
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
    }
  };

  const bubbleClass =
    message.type === "text"
      ? isSentByMe
        ? "bg-green-500 dark:bg-wa-green-dark text-white rounded-br-sm"
        : "bg-white dark:bg-wa-message-bg-dark text-gray-900 dark:text-wa-text-dark shadow-sm border border-gray-200 dark:border-transparent rounded-bl-sm"
      : "bg-white dark:bg-wa-message-bg-dark text-gray-900 dark:text-wa-text-dark shadow-sm border border-gray-200 dark:border-transparent";

  return (
    <div
      ref={bubbleRef}
      className={`flex mb-2 transition-transform duration-300 ease-in-out ${
        isSentByMe ? "justify-end" : "justify-start"
      } ${isHighlighted ? "scale-105" : ""}`}
    >
      <div
        className={`max-w-[70%] md:max-w-md rounded-lg relative ${
          message.type === "text" ? "px-4 py-2" : "p-2"
        } ${bubbleClass}`}
      >
        {renderMessageContent()}
      </div>
    </div>
  );
};

export default MessageBubble;
