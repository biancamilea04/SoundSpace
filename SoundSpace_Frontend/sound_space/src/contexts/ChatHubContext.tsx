"use client";

import {createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useRef,} from "react";
import {type HubConnection, HubConnectionBuilder, HubConnectionState, LogLevel,} from "@microsoft/signalr";
import {getAccessTokenCookie} from "@/services/auth/authService";
import {useMessageStore} from "@/stores/messageStore";
import type {MessageState} from "@/stores/messageStore";
import {usePresenceStore} from "@/stores/presenceStore";
import {useNotificationStore} from "@/stores/notificationStore";
import type {Message} from "@/types/message";
import type {Friendship} from "@/types/friendship";

interface BackendMessageDto {
    id: string;
    conversationId: string;
    senderId: string;
    senderDisplayName?: string;
    senderProfileImageUrl?: string | null;
    text: string | null;
    createdAt: string;
    isDeleted: boolean;
    editedAt: string | null;
}

type ConversationHandlers = {
    onMessage: Set<(msg: Message) => void>;
    onDelete: Set<(messageId: string) => void>;
    onEdit: Set<(messageId: string, text: string, editedAt: string) => void>;
};

interface ChatHubContextValue {
    sendMessage: (conversationId: string, text: string) => Promise<void>;
    deleteMessage: (messageId: string) => Promise<void>;
    editMessage: (messageId: string, newText: string) => Promise<void>;
    markConversationRead: (conversationId: string) => Promise<void>;
    isConnected: () => boolean;
    joinEventGroup: (eventId: string) => Promise<void>;
    leaveEventGroup: (eventId: string) => Promise<void>;
    subscribeToConversation: (
        conversationId: string,
        onMessage: (msg: Message) => void,
        onDelete: (messageId: string) => void,
        onEdit: (messageId: string, text: string, editedAt: string) => void
    ) => () => void;
}

const ChatHubContext = createContext<ChatHubContextValue | null>(null);

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || "https://localhost:7050";

export function ChatHubProvider({ children }: { children: ReactNode }) {
    const connectionRef = useRef<HubConnection | null>(null);
    const storeRef = useRef(useMessageStore.getState());
    const conversationSubscribers = useRef<Map<string, ConversationHandlers>>(new Map());

    useEffect(() => {
        return useMessageStore.subscribe((state: MessageState) => {
            storeRef.current = state;
        });
    }, []);

    useEffect(() => {
        let isMounted = true;

        const token = getAccessTokenCookie();
        if (!token) return;

        const connection = new HubConnectionBuilder()
            .withUrl(`${BACKEND_URL}/hubs/chat`, {
                accessTokenFactory: () => getAccessTokenCookie() ?? "",
            })
            .configureLogging(LogLevel.Warning)
            .withAutomaticReconnect()
            .build();

        connectionRef.current = connection;

        connection.on("ReceiveMessage", (dto: BackendMessageDto) => {
            if (!isMounted) return;

            const message: Message = {
                id: dto.id,
                senderId: dto.senderId,
                senderDisplayName: dto.senderDisplayName,
                senderProfileImageUrl: dto.senderProfileImageUrl,
                text: dto.isDeleted ? null : dto.text,
                timestamp: new Date(dto.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                }),
                isRead: false,
                isDeleted: dto.isDeleted,
                conversationId: dto.conversationId,
            };

            storeRef.current.appendMessage(dto.conversationId, message);

            if (dto.conversationId === storeRef.current.activeConversationId) {
                void connection.invoke("MarkMessagesAsRead", dto.conversationId);
            } else {
                storeRef.current.incrementUnread(dto.conversationId);
            }

            const subs = conversationSubscribers.current.get(dto.conversationId);
            if (subs) subs.onMessage.forEach((cb) => cb(message));
        });

        connection.on("MessageDeleted", (tombstone: BackendMessageDto) => {
            if (!isMounted) return;
            storeRef.current.replaceWithTombstone(tombstone.id, tombstone.conversationId);

            const subs = conversationSubscribers.current.get(tombstone.conversationId);
            if (subs) subs.onDelete.forEach((cb) => cb(tombstone.id));
        });

        connection.on("MessageEdited", (dto: BackendMessageDto) => {
            if (!isMounted) return;
            useMessageStore.getState().updateMessageText(
                dto.id,
                dto.conversationId,
                dto.text ?? "",
                dto.editedAt ?? new Date().toISOString()
            );

            const subs = conversationSubscribers.current.get(dto.conversationId);
            if (subs) subs.onEdit.forEach((cb) => cb(dto.id, dto.text ?? "", dto.editedAt ?? new Date().toISOString()));
        });

        connection.on("OnlineUsers", (ids: string[]) => {
            if (!isMounted) return;
            usePresenceStore.getState().setOnlineUsers(ids);
        });

        connection.on("UserCameOnline", (id: string) => {
            if (!isMounted) return;
            usePresenceStore.getState().markOnline(id);
        });

        connection.on("UserWentOffline", (id: string) => {
            if (!isMounted) return;
            usePresenceStore.getState().markOffline(id);
            useMessageStore.getState().updateUserLastSeen(id, "just now");
        });

        connection.on("MessagesSeen", (conversationId: string, messageIds: string[]) => {
            if (!isMounted) return;
            useMessageStore.getState().markMessagesAsRead(conversationId, messageIds);
        });

        connection.on("FriendRequestReceived", (dto: Friendship) => {
            if (!isMounted) return;
            useNotificationStore.getState().addRequest(dto);
        });

        connection.on("FriendRequestAccepted", (dto: Friendship) => {
            if (!isMounted) return;
            useNotificationStore.getState().removeRequest(dto.id);
        });

        connection.start().catch((err) =>
            console.error("[ChatHubProvider] SignalR connection error:", err)
        );

        return () => {
            isMounted = false;
            connection.off("ReceiveMessage");
            connection.off("MessageDeleted");
            connection.off("MessageEdited");
            connection.off("OnlineUsers");
            connection.off("UserCameOnline");
            connection.off("UserWentOffline");
            connection.off("MessagesSeen");
            connection.off("FriendRequestReceived");
            connection.off("FriendRequestAccepted");
            connection.stop().catch(() => {});
            connectionRef.current = null;
        };
    }, []);

    const sendMessage = useCallback(async (conversationId: string, text: string) => {
        const conn = connectionRef.current;
        if (!conn || conn.state !== HubConnectionState.Connected) {
            throw new Error("Not connected to chat. Please refresh and try again.");
        }
        await conn.invoke("SendMessage", conversationId, text);
    }, []);

    const deleteMessage = useCallback(async (messageId: string) => {
        const conn = connectionRef.current;
        if (!conn || conn.state !== HubConnectionState.Connected) return;
        await conn.invoke("DeleteMessage", messageId);
    }, []);

    const editMessage = useCallback(async (messageId: string, newText: string) => {
        const conn = connectionRef.current;
        if (!conn || conn.state !== HubConnectionState.Connected) return;
        await conn.invoke("EditMessage", messageId, newText);
    }, []);

    const markConversationRead = useCallback(async (conversationId: string) => {
        const conn = connectionRef.current;
        if (!conn || conn.state !== HubConnectionState.Connected) return;
        await conn.invoke("MarkMessagesAsRead", conversationId);
    }, []);

    const isConnected = useCallback(
        () => connectionRef.current?.state === HubConnectionState.Connected,
        []
    );

    const joinEventGroup = useCallback(async (eventId: string) => {
        const conn = connectionRef.current;
        if (!conn || conn.state !== HubConnectionState.Connected) return;
        await conn.invoke("JoinEventGroup", eventId);
    }, []);

    const leaveEventGroup = useCallback(async (eventId: string) => {
        const conn = connectionRef.current;
        if (!conn || conn.state !== HubConnectionState.Connected) return;
        await conn.invoke("LeaveEventGroup", eventId);
    }, []);

    const subscribeToConversation = useCallback((
        conversationId: string,
        onMessage: (msg: Message) => void,
        onDelete: (messageId: string) => void,
        onEdit: (messageId: string, text: string, editedAt: string) => void
    ) => {
        const existing: ConversationHandlers = conversationSubscribers.current.get(conversationId) ?? {
            onMessage: new Set(),
            onDelete: new Set(),
            onEdit: new Set(),
        };
        existing.onMessage.add(onMessage);
        existing.onDelete.add(onDelete);
        existing.onEdit.add(onEdit);
        conversationSubscribers.current.set(conversationId, existing);

        return () => {
            existing.onMessage.delete(onMessage);
            existing.onDelete.delete(onDelete);
            existing.onEdit.delete(onEdit);
            if (existing.onMessage.size === 0 && existing.onDelete.size === 0 && existing.onEdit.size === 0) {
                conversationSubscribers.current.delete(conversationId);
            }
        };
    }, []);

    const value = useMemo(
        () => ({
            sendMessage, deleteMessage, editMessage, markConversationRead, isConnected,
            joinEventGroup, leaveEventGroup, subscribeToConversation,
        }),
        [sendMessage, deleteMessage, editMessage, markConversationRead, isConnected,
         joinEventGroup, leaveEventGroup, subscribeToConversation]
    );

    return (
        <ChatHubContext.Provider value={value}>
            {children}
        </ChatHubContext.Provider>
    );
}

export function useChatHubContext(): ChatHubContextValue {
    const ctx = useContext(ChatHubContext);
    if (!ctx) throw new Error("useChatHubContext must be used within ChatHubProvider");
    return ctx;
}
