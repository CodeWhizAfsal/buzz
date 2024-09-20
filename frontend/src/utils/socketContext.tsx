import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { io, Socket } from "socket.io-client";

interface ISocketContextState {
  socket: Socket | null;
  isConnected: boolean;
  isAuthenticated: boolean;
  userId: string;
  userDetails: any;
  joinRoom: (roomId: string) => void;
  leaveRoom: (roomId: string) => void;
  initiateChat: (receiverId: string, chatName: string) => void;
  sendMessage: (chatId: string, message: string) => void;
  getChats: () => void;
}

const defaultSocketContextState: ISocketContextState = {
  socket: null,
  isConnected: false,
  isAuthenticated: false,
  userId: "",
  userDetails: { userId: "", displayName: "", avatarUrl: "" },
  joinRoom: () => {},
  leaveRoom: () => {},
  initiateChat: () => {},
  sendMessage: () => {},
  getChats: () => {},
};

export const SocketContext = createContext<ISocketContextState>(
  defaultSocketContextState
);

export const useSocket = () => useContext(SocketContext);

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState("");
  const [userDetails, setUserDetails] = useState({
    userId: "",
    displayName: "",
    avatarUrl: "",
  });

  useEffect(() => {
    const newSocket = io(import.meta.env.VITE_BACKEND_URL!, {
      withCredentials: true,
    });
    setSocket(newSocket);

    newSocket.on("connect", () => {
      setIsConnected(true);
      console.log("Connected to socket server");
      newSocket.emit("authenticate");
    });

    newSocket.on("disconnect", () => {
      setIsConnected(false);
      setIsAuthenticated(false);
      console.log("Disconnected from socket server");
    });

    newSocket.on("authenticated", (userdetails) => {
      setIsAuthenticated(true);
      setUserId(userdetails.userId);
      setUserDetails(userdetails);
      console.log("Authenticated successfully");
    });

    newSocket.on("authentication_error", (error: string) => {
      setIsAuthenticated(false);
      console.error("Authentication failed:", error);
    });

    return () => {
      newSocket.close();
    };
  }, []);

  const joinRoom = (roomId: string) => {
    if (socket && isAuthenticated) {
      socket.emit("join_room", roomId);
    } else {
      console.error("Cannot join room: not authenticated");
    }
  };

  const leaveRoom = (roomId: string) => {
    if (socket && isAuthenticated) {
      socket.emit("leave_room", roomId);
    }
  };

  const initiateChat = (receiverIds: string, chatName: string) => {
    if (socket && isAuthenticated) {
      console.log("REVIEWER ID", receiverIds);
      socket.emit("initiate_chat", { receiverIds, chatName });
    } else {
      console.error("Cannot initiate chat: not authenticated");
    }
  };

  const sendMessage = (chatId: string, message: string) => {
    if (socket && isAuthenticated) {
      socket.emit("send_message", { chatId, message });
    } else {
      console.error("Cannot send message: not authenticated");
    }
  };

  const getChats = () => {
    if (socket && isAuthenticated) {
      socket.emit("get_chats");
    } else {
      console.error("Cannot get chats: not authenticated");
    }
  };

  const value: ISocketContextState = {
    socket,
    isConnected,
    isAuthenticated,
    userId,
    userDetails,
    joinRoom,
    leaveRoom,
    initiateChat,
    sendMessage,
    getChats,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};
