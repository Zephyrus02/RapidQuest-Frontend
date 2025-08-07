# RapidQuest Frontend

A modern, responsive WhatsApp-like chat application built with React, TypeScript, and real-time Socket.IO communication.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or pnpm package manager
- Backend server running (see backend/README.md)

### Installation & Setup

1. **Install Dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

2. **Environment Configuration**
   Create a `.env` file in the frontend root directory:
   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_SOCKET_URL=http://localhost:5000
   ```

3. **Start the Development Server**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

   The application will start on `http://localhost:5173`

## 📱 Complete Testing Guide for Recruiters

### Step 1: Initial Setup
1. Ensure both backend and frontend servers are running
2. Open your browser and navigate to `http://localhost:5173`
3. You'll see the WhatsApp-style login page

### Step 2: Create User Accounts

#### Create First User (Alice)
1. Click **"Don't have an account? Sign Up"**
2. Fill in the registration form:
   - **Name**: `Alice Johnson`
   - **Email**: `alice@test.com`
   - **Phone**: `+1234567890`
   - **Password**: `password123`
   - **Confirm Password**: `password123`
   - **Bio**: `Hey! I'm Alice, testing RapidQuest` (optional)
   - **Profile Photo**: Leave blank (auto-generates avatar)
3. Click **"Sign Up"**
4. You'll be automatically logged in and see the main chat interface

#### Create Second User (Bob)
1. **Open a new browser window/tab or use incognito mode**
2. Navigate to `http://localhost:5173`
3. Click **"Don't have an account? Sign Up"**
4. Fill in the registration form:
   - **Name**: `Bob Smith`
   - **Email**: `bob@test.com`
   - **Phone**: `+0987654321`
   - **Password**: `password123`
   - **Confirm Password**: `password123`
   - **Bio**: `Hello! I'm Bob, ready to chat` (optional)
   - **Profile Photo**: Leave blank
5. Click **"Sign Up"**

### Step 3: Adding Contacts

#### Alice Adds Bob as Contact
1. In Alice's window, look for the **"+"** button in the sidebar
2. Click the **"+"** button to open "Add Contact" modal
3. Enter Bob's email: `bob@test.com`
4. Click **"Add Contact"**
5. You should see a success message and Bob appears in Alice's contact list

#### Bob Adds Alice as Contact
1. In Bob's window, click the **"+"** button
2. Enter Alice's email: `alice@test.com`
3. Click **"Add Contact"**
4. Alice should appear in Bob's contact list
5. Bob will also receive a notification that Alice added him

### Step 4: Send Messages & Test Real-Time Features

#### Basic Messaging
1. **Alice sends a message to Bob:**
   - In Alice's window, click on Bob in the contact list
   - Type a message: `Hello Bob! How are you?`
   - Press Enter or click the send button
   - Watch the message appear with "sent" status

2. **Bob receives and responds:**
   - In Bob's window, you should see Alice's message appear immediately
   - The message status will change to "delivered"
   - Click on Alice in Bob's contact list
   - Type a response: `Hi Alice! I'm great, thanks for asking!`
   - Send the message

3. **Alice sees the response:**
   - Alice's window should immediately show Bob's message
   - The status of Alice's original message should change to "read"

#### Test Real-Time Features

**Online Status Indicators:**
- Notice the green dots next to online users
- Close one browser window and see the status change to offline in the other
- Reopen and see the status return to online

**Message Status Tracking:**
- **Sent**: Single gray checkmark (✓)
- **Delivered**: Double gray checkmarks (✓✓) 
- **Read**: Double blue checkmarks (✓✓)

**Typing Indicators:** (if implemented)
- Start typing in one window and see typing indicator in the other

### Step 5: Test Additional Features

#### Profile Management
1. Click on your profile picture/name in the sidebar
2. Try updating your bio or name
3. See changes reflect in real-time

#### Dark Mode Toggle
1. Look for the theme toggle button (moon/sun icon)
2. Switch between light and dark modes
3. Notice the smooth theme transition

#### Mobile Responsiveness
1. Resize your browser window to mobile size (375px width)
2. Notice the mobile-friendly layout:
   - Contact list takes full screen
   - Chat area opens when selecting a contact
   - Back button appears to return to contacts

#### Search Functionality (if available)
1. Use the search bar to find specific contacts or messages
2. Test filtering capabilities

### Step 6: Advanced Testing Scenarios

#### Multi-Tab Sync Testing
1. Open the same user account in multiple tabs
2. Send messages from one tab
3. Watch real-time synchronization across all tabs

#### Network Resilience Testing
1. Disconnect your internet briefly
2. Try sending a message (should queue)
3. Reconnect internet
4. Watch messages sync automatically

#### Error Handling
1. Try logging in with incorrect credentials
2. Test sending messages when backend is down
3. Observe user-friendly error messages

## 🎨 UI/UX Features to Showcase

### Visual Elements
- **WhatsApp-inspired design** with authentic colors and layout
- **Smooth animations** and transitions
- **Responsive design** that works on all screen sizes
- **Dark/Light theme** support
- **Real-time status indicators**
- **Message status icons** (sent/delivered/read)

### User Experience
- **Optimistic UI updates** - messages appear instantly
- **Smooth chat switching** between contacts
- **Keyboard shortcuts** - Enter to send messages
- **Auto-scroll** to latest messages
- **Persistent login** - stays logged in after refresh

## 🔧 Technical Implementation Highlights

### React Features Demonstrated
- **Modern React 18** with functional components
- **Custom Hooks** for socket management
- **Context API** for global state management
- **TypeScript** for type safety
- **Error Boundaries** for robust error handling

### Real-Time Communication
- **Socket.IO integration** for WebSocket communication
- **Automatic reconnection** handling
- **Room-based messaging** for efficient delivery
- **Optimistic updates** with server confirmation

### Performance Optimizations
- **Code splitting** for faster load times
- **Memoization** to prevent unnecessary re-renders
- **Efficient re-rendering** with proper dependency arrays
- **Bundle optimization** with Vite

## 📁 Project Structure

```
frontend/
├── public/                     # Static assets
├── src/
│   ├── components/
│   │   ├── LoginPage.tsx       # Authentication UI
│   │   ├── Sidebar.tsx         # Contact list & navigation
│   │   ├── ChatArea.tsx        # Main chat interface
│   │   ├── MessageList.tsx     # Message rendering
│   │   ├── MessageBubble.tsx   # Individual messages
│   │   ├── MessageInput.tsx    # Message composition
│   │   ├── ProfileSidebar.tsx  # Profile management
│   │   └── AddContactModal.tsx # Contact addition
│   ├── context/
│   │   └── SocketContext.tsx   # Socket state management
│   ├── services/
│   │   └── api.ts              # HTTP client configuration
│   ├── types/
│   │   └── index.ts            # TypeScript definitions
│   ├── App.tsx                 # Main application component
│   └── main.tsx                # Application entry point
├── tailwind.config.js          # Styling configuration
├── vite.config.ts              # Build configuration
└── package.json                # Dependencies
```

## 🎯 Key Features Demonstrated

### Authentication System
- ✅ **Secure registration** with validation
- ✅ **JWT-based login** with persistent sessions
- ✅ **Auto-login** on app refresh
- ✅ **Logout functionality** with cleanup

### Real-Time Messaging
- ✅ **Instant message delivery** via Socket.IO
- ✅ **Message status tracking** (sent/delivered/read)
- ✅ **Optimistic UI updates** for instant feedback
- ✅ **Auto-reconnection** on connection loss

### User Management
- ✅ **Contact system** with search functionality
- ✅ **Online/offline status** indicators
- ✅ **Profile management** with real-time updates
- ✅ **User search** by email

### UI/UX Excellence
- ✅ **Responsive design** for all screen sizes
- ✅ **Dark/Light theme** toggle
- ✅ **WhatsApp-inspired** interface
- ✅ **Smooth animations** and transitions
- ✅ **Accessibility features** and keyboard navigation

## 🚨 Troubleshooting Guide

### Common Issues

#### "Cannot connect to server"
- **Check**: Backend server is running on port 5000
- **Solution**: Start the backend server first

#### Messages not appearing in real-time
- **Check**: Socket.IO connection status in browser dev tools
- **Solution**: Refresh the page or check network connection

#### "User not found" when adding contacts
- **Check**: Email address is correct and user exists
- **Solution**: Create the user account first

#### Login not working
- **Check**: Credentials are correct
- **Solution**: Try registering a new account if forgotten

#### Page not loading
- **Check**: Frontend server is running on port 5173
- **Solution**: Run `npm run dev` in the frontend directory

## 🎬 Demo Script for Recruiters

### 2-Minute Demo Flow

1. **Opening (15 seconds)**
   - "This is RapidQuest, a full-stack real-time chat application"
   - Show the login page and mention WhatsApp-inspired design

2. **User Registration (30 seconds)**
   - Quickly register two users
   - Highlight the validation and auto-generated avatars

3. **Contact Management (30 seconds)**
   - Add contacts using email addresses
   - Show the real-time contact addition notifications

4. **Real-Time Messaging (45 seconds)**
   - Send messages between users
   - Highlight instant delivery and status updates
   - Show typing indicators and online status

5. **Feature Showcase (30 seconds)**
   - Toggle dark/light theme
   - Show mobile responsiveness
   - Demonstrate cross-tab synchronization

### Questions Recruiters Might Ask

**Q: How does real-time messaging work?**
A: Uses Socket.IO for WebSocket connections with automatic fallback to polling, ensuring reliable real-time communication.

**Q: How do you handle offline scenarios?**
A: Implements optimistic updates with message queuing and automatic reconnection when the connection is restored.

**Q: What makes this production-ready?**
A: Includes comprehensive error handling, type safety with TypeScript, security measures, and scalable architecture patterns.

---

## 🏆 Technical Achievements Showcased

This frontend demonstrates:
- **Advanced React patterns** with TypeScript
- **Real-time state management** across components
- **Responsive design** principles
- **Modern development practices** with Vite
- **Production-ready code** structure
- **User experience focus** with intuitive design
- **Performance optimizations** for smooth interactions

Ready to test? Start with the backend setup, then follow this guide step by step!
