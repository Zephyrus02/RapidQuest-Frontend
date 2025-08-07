import React, { useState, useEffect } from "react";
import { ArrowLeft, Check, Pencil, X, Loader2 } from "lucide-react";
import { User } from "../types";
import api from "../services/api";

interface ProfileSidebarProps {
  currentUser: User | null;
  onBack: () => void;
  onUpdateUser: (user: User) => void;
}

const ProfileSidebar: React.FC<ProfileSidebarProps> = ({
  currentUser,
  onBack,
  onUpdateUser,
}) => {
  const [user, setUser] = useState<User | null>(currentUser);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingAbout, setIsEditingAbout] = useState(false);

  const [tempName, setTempName] = useState(user?.name || "");
  const [tempAbout, setTempAbout] = useState(user?.bio || "");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get("/users/me");
        const fetchedUser: User = { ...response.data, _id: response.data._id };
        setUser(fetchedUser);
        onUpdateUser(fetchedUser); // Update parent state
        setTempName(fetchedUser.name);
        setTempAbout(fetchedUser.bio || "");
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [onUpdateUser]);

  const handleUpdateProfile = async (updatedFields: Partial<User>) => {
    setIsUpdating(true);
    setError(null);

    try {
      const response = await api.put("/users/me", updatedFields);
      const updatedUser: User = { ...response.data, _id: response.data._id };
      setUser(updatedUser);
      onUpdateUser(updatedUser);
    } catch (err: any) {
      setError(err.message);
      // Revert optimistic UI changes if necessary
      setUser(currentUser);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveName = () => {
    setIsEditingName(false);
    if (user && tempName !== user.name) {
      handleUpdateProfile({ name: tempName });
    }
  };

  const handleSaveAbout = () => {
    setIsEditingAbout(false);
    if (user && tempAbout !== user.bio) {
      handleUpdateProfile({ bio: tempAbout });
    }
  };

  if (isLoading) {
    return (
      <div className="w-full md:w-[400px] bg-white dark:bg-wa-bg-dark flex flex-col h-full items-center justify-center">
        <Loader2 className="animate-spin text-wa-green" size={48} />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="w-full md:w-[400px] bg-white dark:bg-wa-bg-dark flex flex-col h-full items-center justify-center p-4 text-center">
        <p className="text-red-500">{error || "Could not load profile."}</p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-wa-green text-white rounded-lg"
        >
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="w-full md:w-[400px] bg-white dark:bg-wa-bg-dark flex flex-col h-full">
      {/* Header */}
      <div
        className="bg-gray-50 dark:bg-wa-panel-bg-dark px-4 py-3 flex items-center space-x-6"
        style={{ minHeight: "67px" }}
      >
        <button
          onClick={onBack}
          className="text-gray-600 dark:text-wa-panel-header-icon-dark p-2 rounded-full hover:bg-gray-200 dark:hover:bg-wa-hover-dark"
        >
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-wa-text-dark">
          Profile
        </h2>
      </div>

      {/* Profile Picture */}
      <div className="flex justify-center items-center py-8 bg-gray-100 dark:bg-wa-bg-dark">
        <div className="relative group cursor-pointer">
          <img
            src={user.profilePhoto}
            alt="Profile"
            className="w-48 h-48 rounded-full object-cover shadow-lg"
          />
          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Pencil size={24} className="text-white" />
            <span className="text-white text-sm mt-2 text-center uppercase font-light">
              Change
              <br />
              Profile Photo
            </span>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 bg-gray-100 dark:bg-wa-bg-dark overflow-y-auto pt-4">
        {/* Name Section */}
        <div className="px-6 py-4 bg-white dark:bg-wa-panel-bg-dark">
          <p className="text-sm text-green-600 dark:text-wa-green mb-2">
            Your name
          </p>
          {!isEditingName ? (
            <div className="flex justify-between items-center">
              <p className="text-gray-900 dark:text-wa-text-dark">
                {user.name}
              </p>
              <button
                onClick={() => {
                  setIsEditingName(true);
                  setTempName(user.name);
                }}
                className="text-gray-500 dark:text-wa-text-secondary-dark p-2 rounded-full hover:bg-gray-200 dark:hover:bg-wa-hover-dark"
              >
                <Pencil size={20} />
              </button>
            </div>
          ) : (
            <div>
              <div className="flex items-center">
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  className="flex-grow bg-transparent border-b-2 border-green-500 dark:border-wa-green focus:outline-none text-gray-900 dark:text-wa-text-dark py-1"
                  autoFocus
                  disabled={isUpdating}
                />
                <button
                  onClick={handleSaveName}
                  disabled={isUpdating}
                  className="ml-4 text-gray-500 dark:text-wa-text-secondary-dark p-2 rounded-full hover:bg-gray-200 dark:hover:bg-wa-hover-dark disabled:opacity-50"
                >
                  {isUpdating ? (
                    <Loader2 size={24} className="animate-spin" />
                  ) : (
                    <Check size={24} />
                  )}
                </button>
                <button
                  onClick={() => setIsEditingName(false)}
                  disabled={isUpdating}
                  className="ml-2 text-gray-500 dark:text-wa-text-secondary-dark p-2 rounded-full hover:bg-gray-200 dark:hover:bg-wa-hover-dark disabled:opacity-50"
                >
                  <X size={24} />
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 text-sm text-gray-500 dark:text-wa-text-secondary-dark my-4">
          This is not your username or pin. This name will be visible to your
          WhatsApp contacts.
        </div>

        {/* About Section */}
        <div className="px-6 py-4 bg-white dark:bg-wa-panel-bg-dark">
          <p className="text-sm text-green-600 dark:text-wa-green mb-2">
            About
          </p>
          {!isEditingAbout ? (
            <div className="flex justify-between items-center">
              <p className="text-gray-900 dark:text-wa-text-dark">{user.bio}</p>
              <button
                onClick={() => {
                  setIsEditingAbout(true);
                  setTempAbout(user.bio || "");
                }}
                className="text-gray-500 dark:text-wa-text-secondary-dark p-2 rounded-full hover:bg-gray-200 dark:hover:bg-wa-hover-dark"
              >
                <Pencil size={20} />
              </button>
            </div>
          ) : (
            <div>
              <div className="flex items-center">
                <input
                  type="text"
                  value={tempAbout}
                  onChange={(e) => setTempAbout(e.target.value)}
                  className="flex-grow bg-transparent border-b-2 border-green-500 dark:border-wa-green focus:outline-none text-gray-900 dark:text-wa-text-dark py-1"
                  autoFocus
                  disabled={isUpdating}
                />
                <button
                  onClick={handleSaveAbout}
                  disabled={isUpdating}
                  className="ml-4 text-gray-500 dark:text-wa-text-secondary-dark p-2 rounded-full hover:bg-gray-200 dark:hover:bg-wa-hover-dark disabled:opacity-50"
                >
                  {isUpdating ? (
                    <Loader2 size={24} className="animate-spin" />
                  ) : (
                    <Check size={24} />
                  )}
                </button>
                <button
                  onClick={() => setIsEditingAbout(false)}
                  disabled={isUpdating}
                  className="ml-2 text-gray-500 dark:text-wa-text-secondary-dark p-2 rounded-full hover:bg-gray-200 dark:hover:bg-wa-hover-dark disabled:opacity-50"
                >
                  <X size={24} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileSidebar;
