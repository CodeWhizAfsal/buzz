export interface IMessage {
    _id: string;
    sender: ISender;
    message: string;
    timestamp: Date;
  }
  
  export interface ISender {
    id: string;
    displayName: string;
    avatarUrl: string;
  }
  
  export interface IChat {
    _id: string;
    name: string;
    participants: ISender[];
    lastMessage?: string;
    lastMessageTimestamp?: string;
  }
  