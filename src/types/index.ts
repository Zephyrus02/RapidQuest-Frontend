export interface User {
  _id: string;
  name: string;
  isOnline: boolean;
  lastSeen?: string;
  email?: string;
  phone?: string;
  bio?: string;
  profilePhoto?: string;
}

export interface Message {
  id: string;
  text: string;
  timestamp: Date;
  senderId: string;
  status: "sending" | "sent" | "delivered" | "read" | "failed";
  type: "text" | "image" | "document" | "audio";
  fileUrl?: string;
  fileName?: string;
  fileSize?: string;
}

export interface Chat {
  id: string;
  user: User;
  lastMessage?: Message;
  unreadCount: number;
  isPinned: boolean;
  isArchived: boolean;
}
