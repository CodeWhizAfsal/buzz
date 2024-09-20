import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MoreHorizontal, Search, Send, Video } from "lucide-react";
import { useEffect, useState } from "react";

import AvatarCard from "@/Components/avatar-card";
import ChatCard from "@/Components/chat-card";
import MessageCard from "@/Components/message-card";
import NewChatModal from "@/Components/new-chat-model";
import Sidebar from "@/Components/sidebar";
import { useSocket } from "@/utils/socketContext";
import { IChat, IMessage } from "@/types";

export default function Chat() {
  const [showSidebar, setShowSidebar] = useState(false);

  const {
    isConnected,
    isAuthenticated,
    userId,
    userDetails,
    joinRoom,
    leaveRoom,
    sendMessage,
    getChats,
    initiateChat,
    socket,
  } = useSocket();

  const [messages, setMessages] = useState<IMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);
  const [chats, setChats] = useState<IChat[]>([]);

  const [currentChat, setCurrentChat] = useState<IChat | null>(null);
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);

  useEffect(() => {
    if (isConnected && isAuthenticated && socket) {
      socket.on("previous_messages", handlePreviousMessages);
      socket.on("new_message", handleNewMessage);
      socket.on("authenticated", (userId: any) => {
        console.log("USERS", userId);
      });
      socket.on("chats_list", handleChatsList);
      socket.on("error", handleError);

      getChats();

      return () => {
        socket.off("previous_messages");
        socket.off("new_message");
        socket.off("chats_list");
        socket.off("error");
      };
    }
  }, [isConnected, isAuthenticated, socket, getChats]);

  const handlePreviousMessages = (prevMessages: IMessage[]) => {
    console.log("PREV MESSAGE", prevMessages);
    setMessages(prevMessages);
  };

  const handleNewMessage = (message: IMessage) => {
    setMessages((prev) => [...prev, message]);
  };

  const handleChatsList = (chatsList: IChat[]) => {
    console.log(chatsList);
    setChats(chatsList);
  };

  const handleError = (error: string) => {
    console.error("Socket error:", error);
  };

  const handleRoomChange = (roomId: string) => {
    if (currentRoom) {
      leaveRoom(currentRoom);
    }
    joinRoom(roomId);
    setCurrentRoom(roomId);
  };

  const handleSendMessage = () => {
    console.log("INPUT", inputMessage, currentRoom);
    if (inputMessage && currentRoom) {
      sendMessage(currentRoom, inputMessage);
      setInputMessage("");
    }
  };

  //   if (!isConnected || !isAuthenticated) {
  //     return (
  //       <div>
  //         Connecting to chat server... he {isConnected ? "SS" : "s"}{" "}
  //         {isAuthenticated ? "SSS" : "ss"}{" "}
  //       </div>
  //     );
  //   }

  const handleNewChatSubmit = (participants: string, chatName: string) => {
    setIsNewChatModalOpen(false);
    initiateChat(participants, chatName);
  };
  return (
    <div className="flex h-screen bg-[#0f1117] text-white">
      <NewChatModal
        isOpen={isNewChatModalOpen}
        onClose={() => setIsNewChatModalOpen(false)}
        onSubmit={handleNewChatSubmit}
      />

      <div className="w-1/4 border-r border-gray-800 flex flex-col">
        <div className="p-4 border-b border-gray-800 flex justify-between items-center">
          <h1 className="text-xl font-bold flex items-center">
            <img src="/buzz.png" className="w-[3rem] mr-2" alt="Buzz Chat" />
          </h1>
          <div className="flex items-center">
            <button
              onClick={() => setIsNewChatModalOpen(true)}
              className="text-white p-2 rounded-full hover:bg-blue-600 transition"
              aria-label="New Chat"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className={`h-5 w-5`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 12a9 9 0 0 1 18 0 9 9 0 0 1-18 0z" />
                <path d="M12 9v6M9 12h6" />
              </svg>{" "}
            </button>
            <div className="ml-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={userDetails.avatarUrl} alt="User" />
                <AvatarFallback>{userDetails.displayName ? userDetails.displayName[0]: "U"}</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-lg">
          <div className="relative rounded-lg">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500 rounded-lg" />
            <Input
              placeholder="Search message..."
              className="pl-8 bg-gray-800 border-gray-700 rounded-lg"
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          {chats.map((chat) => (
            <ChatCard
              chat={chat}
              currentChat={currentChat}
              setCurrentChat={setCurrentChat}
              handleRoomChange={handleRoomChange}
            />
          ))}
        </ScrollArea>
      </div>
      <div className="flex-1 flex flex-col">
        <div className="flex items-center p-4 border-b border-gray-800">
          {currentChat && (
            <AvatarCard
              name={currentChat ? currentChat!.name : ""}
              avatarUrl={""}
            />
          )}
          <div className="ml-3">
            <div className="font-semibold">{currentChat?.name}</div>
          </div>
          <div className="ml-auto flex items-center space-x-2">
            <Button size="icon" variant="ghost">
              <Video className="h-5 w-5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => {
                setShowSidebar(true);
              }}
            >
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </div>
        </div>
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <MessageCard
                key={message._id}
                message={message}
                userId={userId}
              />
            ))}
          </div>
        </ScrollArea>
        <div className="p-4 border-t border-gray-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center"
          >
            <Input
              className="flex-1 bg-gray-800 border-gray-700"
              placeholder="Type a message..."
              value={inputMessage}
              onChange={(e) => {
                setInputMessage(e.target.value);
              }}
            />
            <Button
              size="icon"
              className="ml-2"
              onClick={() => {
                handleSendMessage();
              }}
            >
              <Send className="h-5 w-5" />
            </Button>
          </form>
        </div>
      </div>
      {showSidebar && (
        <Sidebar currentChat={currentChat} setShowSidebar={setShowSidebar} />
      )}
    </div>
  );
}
