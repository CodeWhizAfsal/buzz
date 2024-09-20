import React from "react";
import AvatarCard from "./avatar-card";
import { IChat } from "@/types";

interface ChatCardProps {
  chat: IChat;
  currentChat: IChat | null;
  setCurrentChat: (chat: IChat) => void;
  handleRoomChange: (roomId: string) => void;
}

const ChatCard: React.FC<ChatCardProps> = ({
  chat,
  currentChat,
  setCurrentChat,
  handleRoomChange,
}) => {
  return (
    <div
      key={chat._id}
      className={`p-4 hover:bg-gray-800 mx-3 rounded-xl cursor-pointer ${
        currentChat?._id === chat._id ? "bg-gray-700" : ""
      }`}
      onClick={() => {
        setCurrentChat(chat);
        handleRoomChange(chat._id);
      }}
    >
      <div className="flex items-center space-x-3 overflow-hidden">
        <AvatarCard
          name={chat.name}
          avatarUrl={`/placeholder-avatar-${chat._id}.jpg`}
        />

        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-baseline">
            <h2 className="text-sm font-semibold truncate">{chat.name}</h2>
          </div>
          <p className="text-sm text-gray-400 truncate">{chat.lastMessage}</p>
        </div>
      </div>
    </div>
  );
};

export default ChatCard;
