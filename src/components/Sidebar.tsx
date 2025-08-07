import React, { useState } from "react";
import {
  Search,
  MoreVertical,
  MessageCircle,
  Moon,
  Sun,
  User,
  Download,
  LogOut,
  X,
  Loader2,
} from "lucide-react";
import { Chat, User as UserType } from "../types";
import ChatItem from "./ChatItem";
import AddContactModal from "./AddContactModal";

interface SidebarProps {
  currentUser: UserType | null;
  chatList: Chat[];
  isLoadingChats: boolean;
  selectedChatId: string | null;
  onChatSelect: (chatId: string) => void;
  isDarkMode: boolean;
  onThemeToggle: () => void;
  onShowProfile: () => void;
  onLogout: () => void;
  onAddNewContact: (newContact: UserType) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  currentUser,
  chatList,
  isLoadingChats,
  selectedChatId,
  onChatSelect,
  isDarkMode,
  onThemeToggle,
  onShowProfile,
  onLogout,
  onAddNewContact,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "unread" | "groups">(
    "all"
  );
  const [showDropdown, setShowDropdown] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedForExport, setSelectedForExport] = useState<string[]>([]);
  const [isAddContactModalOpen, setIsAddContactModalOpen] = useState(false);

  const filteredChats = chatList.filter((chat) => {
    const matchesSearch = chat.user.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    if (activeFilter === "unread") {
      return matchesSearch && chat.unreadCount > 0;
    } else if (activeFilter === "groups") {
      // For demo purposes, we'll consider chats with certain names as groups
      return (
        matchesSearch &&
        (chat.user.name.includes("Group") || chat.user.name.includes("Team"))
      );
    }

    return matchesSearch;
  });

  const handleAccountDetails = () => {
    onShowProfile();
    setShowDropdown(false);
  };

  const handleExportChats = () => {
    setIsExporting(true);
    setShowDropdown(false);
  };

  const handleCancelExport = () => {
    setIsExporting(false);
    setSelectedForExport([]);
  };

  const handleToggleExportSelection = (chatId: string) => {
    setSelectedForExport((prev) =>
      prev.includes(chatId)
        ? prev.filter((id) => id !== chatId)
        : [...prev, chatId]
    );
  };

  const handleFinalizeExport = () => {
    const chatsToExport = chatList.filter((chat) =>
      selectedForExport.includes(chat.id)
    );
    // In a real app, you might want to fetch full chat histories here
    const dataStr = JSON.stringify(
      {
        exportedOn: new Date().toISOString(),
        chats: chatsToExport,
      },
      null,
      2
    );
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

    const exportFileDefaultName = "whatsapp_chats.json";

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    document.body.appendChild(linkElement); // Required for Firefox
    linkElement.click();
    document.body.removeChild(linkElement);

    handleCancelExport();
  };

  const triggerLogout = () => {
    onLogout();
    setShowDropdown(false);
  };

  return (
    <div className="w-full md:w-[400px] bg-white dark:bg-wa-bg-dark border-r border-gray-200 dark:border-wa-border-dark flex flex-col h-full">
      <AddContactModal
        isOpen={isAddContactModalOpen}
        onClose={() => setIsAddContactModalOpen(false)}
        onContactAdded={onAddNewContact}
      />
      {/* Header */}
      {isExporting ? (
        <div
          className="bg-gray-50 dark:bg-wa-panel-bg-dark px-4 py-3 flex items-center justify-between border-b border-gray-200 dark:border-wa-border-dark"
          style={{ minHeight: "67px" }}
        >
          <button
            onClick={handleCancelExport}
            className="text-gray-600 dark:text-wa-panel-header-icon-dark p-2 rounded-full hover:bg-gray-200 dark:hover:bg-wa-hover-dark"
          >
            <X size={24} />
          </button>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-wa-text-dark">
            Export Chats ({selectedForExport.length})
          </h2>
          <div className="w-10" /> {/* Spacer */}
        </div>
      ) : (
        <div className="bg-gray-50 dark:bg-wa-panel-bg-dark px-4 py-3.5 flex items-center justify-between border-b border-gray-200 dark:border-wa-border-dark">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <img
                src={currentUser?.profilePhoto}
                alt={currentUser?.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-wa-panel-bg-dark rounded-full"></div>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-gray-600 dark:text-wa-panel-header-icon-dark">
            <button
              onClick={() => setIsAddContactModalOpen(true)}
              className="p-2 hover:bg-gray-200 dark:hover:bg-wa-hover-dark rounded-full transition-colors"
            >
              <MessageCircle size={20} />
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
                  <div className="absolute right-0 top-12 w-56 bg-white dark:bg-wa-panel-bg-dark rounded-lg shadow-lg border border-gray-200 dark:border-wa-border-dark py-2 z-20">
                    <button
                      onClick={onThemeToggle}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-wa-hover-dark flex items-center space-x-3 text-gray-700 dark:text-wa-text-dark"
                    >
                      {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                      <span>
                        Switch to {isDarkMode ? "light" : "dark"} mode
                      </span>
                    </button>
                    <button
                      onClick={handleAccountDetails}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-wa-hover-dark flex items-center space-x-3 text-gray-700 dark:text-wa-text-dark"
                    >
                      <User size={18} />
                      <span>Account details</span>
                    </button>
                    <button
                      onClick={handleExportChats}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-wa-hover-dark flex items-center space-x-3 text-gray-700 dark:text-wa-text-dark"
                    >
                      <Download size={18} />
                      <span>Export chats</span>
                    </button>
                    <div className="border-t border-gray-200 dark:border-wa-border-dark my-1" />
                    <button
                      onClick={triggerLogout}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-wa-hover-dark flex items-center space-x-3 text-red-600"
                    >
                      <LogOut size={18} />
                      <span>Log out</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {!isExporting && (
        <>
          {/* Search */}
          <div className="p-3 border-b border-gray-200 dark:border-wa-border-dark bg-white dark:bg-wa-bg-dark">
            <div className="relative">
              <Search
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-wa-text-secondary-dark"
                size={20}
              />
              <input
                type="text"
                placeholder="Search or start new chat"
                className="w-full pl-12 pr-4 py-2 bg-gray-100 dark:bg-wa-panel-bg-dark border-transparent text-gray-900 dark:text-wa-text-dark rounded-lg focus:outline-none focus:border-green-500 dark:focus:border-wa-green focus:bg-white dark:focus:bg-wa-panel-bg-dark transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Filter tabs */}
          <div className="flex border-b border-gray-200 dark:border-wa-border-dark bg-white dark:bg-wa-bg-dark">
            <button
              onClick={() => setActiveFilter("all")}
              className={`flex-1 px-4 py-3 font-medium transition-colors ${
                activeFilter === "all"
                  ? "text-green-600 dark:text-wa-green border-b-2 border-green-600 dark:border-wa-green"
                  : "text-gray-600 dark:text-wa-text-secondary-dark hover:bg-gray-50 dark:hover:bg-wa-hover-dark"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveFilter("unread")}
              className={`flex-1 px-4 py-3 font-medium transition-colors ${
                activeFilter === "unread"
                  ? "text-green-600 dark:text-wa-green border-b-2 border-green-600 dark:border-wa-green"
                  : "text-gray-600 dark:text-wa-text-secondary-dark hover:bg-gray-50 dark:hover:bg-wa-hover-dark"
              }`}
            >
              Unread
            </button>
            <button
              onClick={() => setActiveFilter("groups")}
              className={`flex-1 px-4 py-3 font-medium transition-colors ${
                activeFilter === "groups"
                  ? "text-green-600 dark:text-wa-green border-b-2 border-green-600 dark:border-wa-green"
                  : "text-gray-600 dark:text-wa-text-secondary-dark hover:bg-gray-50 dark:hover:bg-wa-hover-dark"
              }`}
            >
              Groups
            </button>
          </div>
        </>
      )}

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {isLoadingChats ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="animate-spin text-wa-green" size={32} />
          </div>
        ) : filteredChats.length === 0 && !isExporting ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-wa-text-secondary-dark">
            <MessageCircle size={48} className="mb-4 opacity-50" />
            <p className="text-center">
              No contacts found.
              <br />
              Add a new contact to start chatting.
            </p>
          </div>
        ) : (
          <>
            {filteredChats.map((chat) => (
              <ChatItem
                key={chat.id}
                chat={chat}
                currentUser={currentUser}
                isSelected={!isExporting && selectedChatId === chat.id}
                onClick={() => !isExporting && onChatSelect(chat.id)}
                isExporting={isExporting}
                isSelectedForExport={selectedForExport.includes(chat.id)}
                onToggleExport={() => handleToggleExportSelection(chat.id)}
              />
            ))}
          </>
        )}
      </div>
      {isExporting && (
        <div className="p-4 bg-white dark:bg-wa-bg-dark border-t border-gray-200 dark:border-wa-border-dark">
          <button
            onClick={handleFinalizeExport}
            disabled={selectedForExport.length === 0}
            className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed dark:bg-wa-green dark:hover:bg-wa-green-dark dark:disabled:bg-gray-600"
          >
            Export
          </button>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
