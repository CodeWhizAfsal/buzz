import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface AvatarCardProps {
  name: string;
  avatarUrl: string;
}

const AvatarCard: React.FC<AvatarCardProps> = ({ name, avatarUrl }) => {
  return (
    <Avatar className="h-10 w-10 relative flex items-center justify-center overflow-hidden rounded-full border border-gray-300 shadow-md transition-transform duration-200 hover:scale-105">
      <AvatarImage
        src={avatarUrl}
        alt={name}
        className="object-cover w-full h-full transition-opacity duration-200"
        onError={(e) => {
          e.currentTarget.src = "/default-avatar.jpg"; // Fallback image
        }}
      />
      <AvatarFallback className="flex items-center justify-center text-white bg-gray-500 rounded-full w-full h-full">
        {name? name[0]: "U"}
      </AvatarFallback>
    </Avatar>
  );
};

export default AvatarCard;
