"use client";

import { useEffect, useRef, useCallback } from "react";
import {
    HubConnectionBuilder,
    HubConnectionState,
    LogLevel,
    type HubConnection,
} from "@microsoft/signalr";
import { getAccessTokenCookie } from "@/services/auth/authService";
import { useMessageStore } from "@/stores/messageStore";
import { usePresenceStore } from "@/stores/presenceStore";
import type { Message } from "@/types/message";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || "https://localhost:7050";

interface BackendMessageDto {
    id: string;
    conversationId: string;
    senderId: string;
    text: string | null;
    createdAt: string;
    isDeleted: boolean;
}

interface UseChatHubResult {
    sendMessage: (conversationId: string, text: string) => Promise<void>;
    deleteMessage: (messageId: string) => Promise<void>;
    markConversationRead: (conversationId: string) => Promise<void>;
    isConnected: () => boolean;
}

export const useChatHub = (): UseChatHubResult => {
    const connectionRef = useRef<HubConnection | null>(null);
    const store = useMessageStore();
    const storeRef = useRef(store);
    storeRef.current = store;

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
                void connectionRef.current?.invoke("MarkMessagesAsRead", dto.conversationId);
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

        connection.start().catch((err) =>
            console.error("[useChatHub] SignalR connection error:", err)
        );

        return () => {
            isMounted = false;
            connection.off("ReceiveMessage");
            connection.off("MessageDeleted");
            connection.off("OnlineUsers");
            connection.off("UserCameOnline");
            connection.off("UserWentOffline");
            connection.off("MessagesSeen");
            if (connection.state === HubConnectionState.Connected) {
                connection.stop().catch((err) =>
                    console.error("[useChatHub] Error stopping SignalR:", err)
                );
            }
            connectionRef.current = null;
        };
    }, []);

    const sendMessage = useCallback(
        async (conversationId: string, text: string) => {
            const conn = connectionRef.current;
            if (!conn || conn.state !== HubConnectionState.Connected) {
                throw new Error("Not connected to chat. Please refresh and try again.");
            }
            await conn.invoke("SendMessage", conversationId, text);
        },
        []
    );

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

    return { sendMessage, deleteMessage, markConversationRead, isConnected };
};
