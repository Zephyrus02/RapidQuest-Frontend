import { Chat, Message, User } from '../types';

export const currentUser: User = {
  id: 'current-user',
  name: 'You',
  avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150',
  isOnline: true,
};

export const users: User[] = [
  {
    id: '1',
    name: 'John Doe',
    avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=150',
    isOnline: true,
  },
  {
    id: '2',
    name: 'Design Team Group',
    avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150',
    isOnline: false,
    lastSeen: '2 hours ago',
  },
  {
    id: '3',
    name: 'Mike Johnson',
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150',
    isOnline: true,
  },
  {
    id: '4',
    name: 'Work Group',
    avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=150',
    isOnline: false,
    lastSeen: 'yesterday',
  },
  {
    id: '5',
    name: 'David Brown',
    avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150',
    isOnline: true,
  },
];

export const messages: Message[] = [
  {
    id: '1',
    text: 'Hey! How are you doing?',
    timestamp: new Date(Date.now() - 3600000),
    senderId: '1',
    isRead: true,
    type: 'text',
  },
  {
    id: '2',
    text: "I'm doing great! Just finished a project at work. How about you?",
    timestamp: new Date(Date.now() - 3300000),
    senderId: 'current-user',
    isRead: true,
    type: 'text',
  },
  {
    id: '3',
    text: "That's awesome! I'm working on something exciting too. Maybe we can catch up over coffee this weekend?",
    timestamp: new Date(Date.now() - 3000000),
    senderId: '1',
    isRead: true,
    type: 'text',
  },
  {
    id: '4',
    text: "Sounds like a plan! Let me know what time works for you.",
    timestamp: new Date(Date.now() - 2700000),
    senderId: 'current-user',
    isRead: true,
    type: 'text',
  },
];

export const chats: Chat[] = [
  {
    id: '1',
    user: users[0],
    lastMessage: messages[messages.length - 1],
    unreadCount: 0,
    isPinned: false,
    isArchived: false,
  },
  {
    id: '2',
    user: {
      id: '2',
      name: 'Design Team Group',
      avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150',
      isOnline: false,
      lastSeen: '2 hours ago',
    },
    lastMessage: {
      id: '5',
      text: 'Thanks for your help earlier!',
      timestamp: new Date(Date.now() - 7200000),
      senderId: '2',
      isRead: false,
      type: 'text',
    },
    unreadCount: 2,
    isPinned: true,
    isArchived: false,
  },
  {
    id: '3',
    user: users[2],
    lastMessage: {
      id: '6',
      text: 'See you tomorrow!',
      timestamp: new Date(Date.now() - 86400000),
      senderId: 'current-user',
      isRead: true,
      type: 'text',
    },
    unreadCount: 0,
    isPinned: false,
    isArchived: false,
  },
  {
    id: '4',
    user: {
      id: '4',
      name: 'Work Group',
      avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=150',
      isOnline: false,
      lastSeen: 'yesterday',
    },
    lastMessage: {
      id: '7',
      text: 'Happy birthday! 🎉',
      timestamp: new Date(Date.now() - 172800000),
      senderId: '4',
      isRead: true,
      type: 'text',
    },
    unreadCount: 1,
    isPinned: false,
    isArchived: false,
  },
  {
    id: '5',
    user: users[4],
    lastMessage: {
      id: '8',
      text: 'Can you send me that document?',
      timestamp: new Date(Date.now() - 259200000),
      senderId: '5',
      isRead: true,
      type: 'text',
    },
    unreadCount: 0,
    isPinned: false,
    isArchived: false,
  },
];