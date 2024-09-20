import React from "react";
import AvatarCard from "./avatar-card";
import { IMessage } from "@/types";

interface MessageCardProps {
  message: IMessage;
  userId: string;
}

const MessageCard: React.FC<MessageCardProps> = ({ message, userId }) => {
  const isCurrentUser = message.sender.id === userId;
  return (
    <div
      key={message._id}
      className={`flex items-start rounded-lg ${
        isCurrentUser ? "justify-end" : "justify-start"
      }`}
    >
      {!isCurrentUser && (
        <AvatarCard
          name={message.sender.displayName}
          avatarUrl={message.sender.avatarUrl}
        />
      )}
      <div className={`ml-3 ${isCurrentUser ? "ml-auto max-w-3/4" : ""}`}>
        <div
          className={`text-xs font-semibold ${
            isCurrentUser ? "text-right" : ""
          }`}
        >
          {message.sender.displayName}
        </div>

        <div
          className={`rounded-lg p-3 ${
            isCurrentUser ? "bg-blue-600" : "bg-gray-800"
          }`}
        >
          <p className="text-sm">{message.message}</p>
        </div>
        <div
          className={`text-xs text-gray-500 mt-1 ${
            isCurrentUser ? "text-right" : ""
          }`}
        >
          {message.timestamp && new Date(message.timestamp).toLocaleString()}
        </div>
      </div>
    </div>
  );
};

export default MessageCard;
