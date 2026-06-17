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
    senderDisplayName?: string;
    senderProfileImageUrl?: string | null;
    text: string | null;
    timestamp: string;
    isRead: boolean;
    isDeleted?: boolean;
    conversationId?: string;
    editedAt?: string | null;
}

export interface Conversation {
    id: string;
    user: MessageUser;
    lastMessage: string | null;
    lastMessageTime: string;
    unreadCount: number;
    messages: Message[];
    isPending?: boolean;
    targetUserId?: string;
}
