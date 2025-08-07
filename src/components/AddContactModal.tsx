import React, { useState } from "react";
import { X, Phone, UserPlus, Loader2 } from "lucide-react";
import { User } from "../types";
import api from "../services/api";

interface AddContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContactAdded: (newContact: User) => void;
}

const AddContactModal: React.FC<AddContactModalProps> = ({
  isOpen,
  onClose,
  onContactAdded,
}) => {
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await api.post("/users/contacts", {
        contactPhone: phone,
      });

      onContactAdded(response.data.contact);
      onClose();
      setPhone("");
    } catch (err: any) {
      setError(
        err.response?.data?.message || err.message || "Failed to add contact."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-wa-panel-bg-dark rounded-lg shadow-xl w-full max-w-md">
        <div className="p-4 border-b border-gray-200 dark:border-wa-border-dark flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-wa-text-dark">
            Add New Contact
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-wa-hover-dark"
          >
            <X
              size={24}
              className="text-gray-600 dark:text-wa-text-secondary-dark"
            />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <p className="text-sm text-gray-600 dark:text-wa-text-secondary-dark mb-4">
              Enter the phone number of the user you want to add to your
              contacts.
            </p>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-wa-hover-dark border border-gray-300 dark:border-wa-border-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-wa-green text-gray-900 dark:text-wa-text-dark"
                placeholder="Contact's phone number"
                required
              />
            </div>
            {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
          </div>
          <div className="p-4 bg-gray-50 dark:bg-wa-bg-dark border-t border-gray-200 dark:border-wa-border-dark flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-gray-700 dark:text-wa-text-dark bg-transparent hover:bg-gray-200 dark:hover:bg-wa-hover-dark"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 rounded-lg bg-wa-green text-white font-semibold hover:bg-wa-green-dark flex items-center disabled:bg-gray-400"
            >
              {isLoading ? (
                <Loader2 size={20} className="animate-spin mr-2" />
              ) : (
                <UserPlus size={20} className="mr-2" />
              )}
              <span>{isLoading ? "Adding..." : "Add Contact"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddContactModal;
