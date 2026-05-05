"use client";

import {createContext, type ReactNode, useCallback, useContext, useEffect, useRef,} from "react";
import {type HubConnection, HubConnectionBuilder, HubConnectionState, LogLevel,} from "@microsoft/signalr";
import {getAccessTokenCookie} from "@/services/auth/authService";
import {useMessageStore} from "@/stores/messageStore";
import {usePresenceStore} from "@/stores/presenceStore";
import {useNotificationStore} from "@/stores/notificationStore";
import type {Message} from "@/types/message";
import type {Friendship} from "@/types/friendship";

interface BackendMessageDto {
    id: string;
    conversationId: string;
    senderId: string;
    text: string | null;
    createdAt: string;
    isDeleted: boolean;
}

interface ChatHubContextValue {
    sendMessage: (conversationId: string, text: string) => Promise<void>;
    deleteMessage: (messageId: string) => Promise<void>;
    markConversationRead: (conversationId: string) => Promise<void>;
    isConnected: () => boolean;
}

const ChatHubContext = createContext<ChatHubContextValue | null>(null);

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || "https://localhost:7050";

export function ChatHubProvider({ children }: { children: ReactNode }) {
    const connectionRef = useRef<HubConnection | null>(null);
    const storeRef = useRef(useMessageStore.getState());

    useEffect(() => {
        return useMessageStore.subscribe((state) => {
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
        });

        connection.on("MessageDeleted", (tombstone: BackendMessageDto) => {
            if (!isMounted) return;
            storeRef.current.replaceWithTombstone(tombstone.id, tombstone.conversationId);
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
            connection.off("OnlineUsers");
            connection.off("UserCameOnline");
            connection.off("UserWentOffline");
            connection.off("MessagesSeen");
            connection.off("FriendRequestReceived");
            connection.off("FriendRequestAccepted");
            if (connection.state === HubConnectionState.Connected) {
                connection.stop().catch((err) =>
                    console.error("[ChatHubProvider] Error stopping SignalR:", err)
                );
            }
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

    const markConversationRead = useCallback(async (conversationId: string) => {
        const conn = connectionRef.current;
        if (!conn || conn.state !== HubConnectionState.Connected) return;
        await conn.invoke("MarkMessagesAsRead", conversationId);
    }, []);

    const isConnected = useCallback(
        () => connectionRef.current?.state === HubConnectionState.Connected,
        []
    );

    return (
        <ChatHubContext.Provider value={{ sendMessage, deleteMessage, markConversationRead, isConnected }}>
            {children}
        </ChatHubContext.Provider>
    );
}

export function useChatHubContext(): ChatHubContextValue {
    const ctx = useContext(ChatHubContext);
    if (!ctx) throw new Error("useChatHubContext must be used within ChatHubProvider");
    return ctx;
}
