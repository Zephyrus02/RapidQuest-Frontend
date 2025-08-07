import React from "react";
import { Check, CheckCheck, Volume2 } from "lucide-react";
import { Chat } from "../types";

interface ChatItemProps {
  chat: Chat;
  isSelected: boolean;
  onClick: () => void;
  isExporting: boolean;
  isSelectedForExport: boolean;
  onToggleExport: () => void;
}

const ChatItem: React.FC<ChatItemProps> = ({
  chat,
  isSelected,
  onClick,
  isExporting,
  isSelectedForExport,
  onToggleExport,
}) => {
  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 1) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (hours < 24) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  };

  const truncateMessage = (text: string, maxLength: number = 30) => {
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  return (
    <div
      onClick={isExporting ? onToggleExport : onClick}
      className={`flex items-center px-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-wa-hover-dark transition-colors border-b border-gray-100 dark:border-transparent ${
        isSelected ? "bg-gray-100 dark:bg-wa-hover-dark" : ""
      }`}
    >
      {isExporting && (
        <div className="mr-4">
          <input
            type="checkbox"
            checked={isSelectedForExport}
            onChange={onToggleExport}
            className="w-5 h-5 rounded text-green-500 focus:ring-green-500 dark:bg-wa-panel-bg-dark dark:border-wa-text-secondary-dark"
            onClick={(e) => e.stopPropagation()} // Prevent the div's onClick from firing
          />
        </div>
      )}
      <div className="relative mr-3">
        <img
          src={chat.user.profilePhoto}
          alt={chat.user.name}
          className="w-12 h-12 rounded-full object-cover"
        />
        {chat.user.isOnline && (
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-wa-bg-dark rounded-full"></div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-semibold text-gray-900 dark:text-wa-text-dark truncate">
            {chat.user.name}
          </h3>
          <div className="flex items-center space-x-1">
            {chat.lastMessage && (
              <span
                className={`text-xs ${
                  isSelected
                    ? "text-gray-600 dark:text-wa-text-dark"
                    : "text-gray-500 dark:text-wa-text-secondary-dark"
                }`}
              >
                {formatTime(chat.lastMessage.timestamp)}
              </span>
            )}
            {chat.isPinned && (
              <div className="w-1 h-4 bg-gray-400 rounded-full ml-1"></div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1 flex-1 min-w-0">
            {chat.lastMessage?.senderId === "current-user" && (
              <div className="flex-shrink-0">
                {chat.lastMessage.status === "read" ? (
                  <CheckCheck
                    size={16}
                    className="text-blue-500 dark:text-wa-read-receipt-dark"
                  />
                ) : chat.lastMessage.status === "delivered" ? (
                  <CheckCheck
                    size={16}
                    className="text-gray-500 dark:text-wa-text-secondary-dark"
                  />
                ) : (
                  <Check
                    size={16}
                    className="text-gray-500 dark:text-wa-text-secondary-dark"
                  />
                )}
              </div>
            )}
            <span className="text-sm text-gray-600 dark:text-wa-text-secondary-dark truncate">
              {chat.lastMessage
                ? truncateMessage(chat.lastMessage.text)
                : "No messages yet"}
            </span>
          </div>

          <div className="flex items-center space-x-2 ml-2">
            {chat.unreadCount > 0 && (
              <span className="bg-green-500 dark:bg-wa-green text-white dark:text-wa-bg-dark text-xs font-semibold rounded-full px-2 py-1 min-w-[20px] text-center">
                {chat.unreadCount > 99 ? "99+" : chat.unreadCount}
              </span>
            )}
            <Volume2 size={16} className="text-gray-400 opacity-0" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatItem;
