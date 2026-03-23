export interface MessageUser {
    id: string;
    name: string;
    avatarUrl: string;
    isOnline: boolean;
    lastSeen?: string;
    listeningTo?: {
        songTitle: string;
        artist: string;
    };
}

export interface Message {
    id: string;
    senderId: string;
    text: string;
    timestamp: string;
    isRead: boolean;
}

export interface Conversation {
    id: string;
    user: MessageUser;
    lastMessage: string;
    lastMessageTime: string;
    unreadCount: number;
    messages: Message[];
}
