import type { Conversation, Message } from "@/types/message";
import { apiFetch } from "@/lib/apiClient";
import { fetchUserProfile } from "@/services/user/userService";
import { formatLastSeen } from "@/lib/formatLastSeen";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || "";

export interface DirectChatResult {
    conversationId: string;
}

interface ConversationSummaryDto {
    id: string;
    participants: {
        userId: string;
        displayName: string;
        profileImageUrl: string | null;
        lastSeen: string | null;
    }[];
    lastMessage: {
        id: string;
        text: string | null;
        createdAt: string;
        isDeleted: boolean;
    } | null;
    unreadCount: number;
}

interface BackendMessageDto {
    id: string;
    conversationId: string;
    senderId: string;
    senderDisplayName?: string;
    senderProfileImageUrl?: string | null;
    text: string | null;
    createdAt: string;
    isDeleted: boolean;
    isRead: boolean;
}

let _currentUserIdPromise: Promise<string> | null = null;

export const getCurrentUserId = (): Promise<string> => {
    if (!_currentUserIdPromise) {
        _currentUserIdPromise = fetchUserProfile().then((p) => p.id);
    }
    return _currentUserIdPromise;
};

export const fetchConversations = async (
    currentUserId: string
): Promise<Conversation[]> => {
    const res = await apiFetch(`${BACKEND_URL}/api/conversations`);
    if (!res.ok) return [];
    const dtos: ConversationSummaryDto[] = await res.json();

    return dtos.map((dto) => {
        const other =
            dto.participants.find((p) => p.userId !== currentUserId) ??
            dto.participants[0];
        return {
            id: dto.id,
            user: {
                id: other.userId,
                name: other.displayName,
                avatarUrl: other.profileImageUrl ?? "/icons/SoundSpaceIcon.png",
                isOnline: false,
                lastSeen: other.lastSeen
                    ? formatLastSeen(other.lastSeen)
                    : undefined,
            },
            lastMessage: dto.lastMessage?.isDeleted
                ? null
                : (dto.lastMessage?.text ?? null),
            lastMessageTime: dto.lastMessage
                ? new Date(dto.lastMessage.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                  })
                : "",
            unreadCount: dto.unreadCount,
            messages: [],
        };
    });
};

export const fetchConversationMessages = async (
    conversationId: string,
    page = 1,
    pageSize = 50
): Promise<Message[]> => {
    const res = await apiFetch(
        `${BACKEND_URL}/api/conversations/${conversationId}/messages?page=${page}&pageSize=${pageSize}`
    );
    if (!res.ok) return [];
    const dtos: BackendMessageDto[] = await res.json();
    return dtos.map((dto) => ({
        id: dto.id,
        senderId: dto.senderId,
        senderDisplayName: dto.senderDisplayName,
        senderProfileImageUrl: dto.senderProfileImageUrl,
        text: dto.isDeleted ? null : dto.text,
        timestamp: new Date(dto.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        }),
        isRead: dto.isRead,
        isDeleted: dto.isDeleted,
        conversationId: dto.conversationId,
    }));
};

export const getRecentContacts = async () => {
    const res = await apiFetch(`${BACKEND_URL}/api/conversations/recent-contacts`);
    if (!res.ok) return [];
    return res.json();
};

export const createDirectChat = async (
    targetUserId: string
): Promise<DirectChatResult> => {
    const res = await apiFetch(`${BACKEND_URL}/api/conversations/direct`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId }),
    });
    if (!res.ok) throw new Error("Failed to create direct chat");
    return res.json();
};

export const getUnreadConversationCount = async (): Promise<number> => {
    const res = await apiFetch(`${BACKEND_URL}/api/conversations/unread-count`);
    if (!res.ok) return 0;
    return res.json();
};
