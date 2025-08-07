import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import io, { Socket } from "socket.io-client";
import { User, Message } from "../types";

interface SocketContextType {
  socket: Socket | null;
  sendMessage: (receiverEmail: string, body: string) => Promise<Message>;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  sendMessage: async () => Promise.reject(new Error("Socket not initialized")),
  isConnected: false,
});

export const useSocket = () => {
  return useContext(SocketContext);
};

interface SocketProviderProps {
  children: React.ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Function to initialize socket connection
  const initializeSocket = useCallback((userData: User) => {
    try {
      setUser(userData);
      setConnectionError(null);

      const socketUrl = import.meta.env.VITE_SOCKET_URL;
      console.log(
        "Connecting to socket server at:",
        socketUrl,
        "for user:",
        userData.name
      );

      // Connect to the socket server
      const newSocket = io(socketUrl, {
        transports: ["websocket", "polling"],
        upgrade: true,
        rememberUpgrade: true,
        timeout: 5000,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      newSocket.on("connect", () => {
        console.log(
          "Socket connected:",
          newSocket.id,
          "for user:",
          userData.name,
          "ID:",
          userData._id
        );
        setIsConnected(true);
        setConnectionError(null);

        // Validate user data before joining
        const userId = userData._id;
        if (userId) {
          console.log("Emitting join event with userId:", userId);
          newSocket.emit("join", userId);
        } else {
          console.error("Cannot join room: user ID is missing", userData);
        }
      });

      newSocket.on("disconnect", (reason) => {
        console.log("Socket disconnected:", reason);
        setIsConnected(false);
      });

      newSocket.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
        setIsConnected(false);
        setConnectionError(error.message);
      });

      newSocket.on("reconnect", (attemptNumber) => {
        console.log("Socket reconnected after", attemptNumber, "attempts");
        setIsConnected(true);
        setConnectionError(null);
        // Re-join the room after reconnection
        const userId = userData._id;
        newSocket.emit("join", userId);
      });

      newSocket.on("reconnect_error", (error) => {
        console.error("Socket reconnection error:", error);
        setConnectionError(error.message);
      });

      setSocket(newSocket);
      return newSocket;
    } catch (error) {
      console.error("Error setting up socket connection:", error);
      setConnectionError("Failed to initialize socket connection");
      return null;
    }
  }, []);

  // Effect to initialize socket when user data is available
  useEffect(() => {
    const userJson = localStorage.getItem("user");
    if (userJson && !socket) {
      try {
        const userData: User = JSON.parse(userJson);
        console.log(
          "Initializing socket for user:",
          userData.name,
          userData._id
        );
        initializeSocket(userData);
      } catch (error) {
        console.error("Error parsing user data from localStorage:", error);
      }
    }

    // Cleanup on unmount
    return () => {
      if (socket) {
        console.log("Cleaning up socket connection on unmount");
        socket.close();
      }
    };
  }, []); // Only run on mount

  // Effect to handle user changes (login/logout)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "user") {
        if (e.newValue) {
          // User logged in
          try {
            const userData: User = JSON.parse(e.newValue);
            if (!user || user._id !== userData._id) {
              console.log(
                "User changed, reinitializing socket for:",
                userData.name
              );
              if (socket) {
                socket.close();
              }
              initializeSocket(userData);
            }
          } catch (error) {
            console.error("Error parsing new user data:", error);
          }
        } else if (e.oldValue) {
          // User logged out
          console.log("User logged out, cleaning up socket");
          if (socket) {
            socket.close();
          }
          setSocket(null);
          setUser(null);
          setIsConnected(false);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [user, socket, initializeSocket]);

  const sendMessage = useCallback(
    async (receiverEmail: string, body: string): Promise<Message> => {
      return new Promise((resolve, reject) => {
        if (!socket || !user) {
          reject(new Error("Socket not connected or user not found"));
          return;
        }

        const tempId = `temp_${Date.now()}_${Math.random()}`;

        const handleMessageSent = (data: { tempId: string; message: any }) => {
          if (data.tempId === tempId) {
            socket.off("messageSent", handleMessageSent);
            socket.off("messageError", handleMessageError);
            const confirmedMessage: Message = {
              ...data.message,
              id: data.message._id, // Normalize ID
              timestamp: new Date(data.message.timestamp),
            };
            resolve(confirmedMessage);
          }
        };

        const handleMessageError = (data: {
          tempId: string;
          error: string;
        }) => {
          if (data.tempId === tempId) {
            socket.off("messageSent", handleMessageSent);
            socket.off("messageError", handleMessageError);
            reject(new Error(data.error));
          }
        };

        socket.on("messageSent", handleMessageSent);
        socket.on("messageError", handleMessageError);

        socket.emit("sendMessage", {
          senderId: user._id,
          receiverEmail,
          body,
          tempId,
        });

        // Timeout after 10 seconds
        setTimeout(() => {
          socket.off("messageSent", handleMessageSent);
          socket.off("messageError", handleMessageError);
          reject(new Error("Message send timeout"));
        }, 10000);
      });
    },
    [socket, user]
  );

  const contextValue: SocketContextType = {
    socket,
    sendMessage,
    isConnected,
  };

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
};
