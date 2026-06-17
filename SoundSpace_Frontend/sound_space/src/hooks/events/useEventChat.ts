"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { Message } from "@/types/message";
import { fetchConversationMessages, getCurrentUserId } from "@/services/messages/messageService";
import { getEventConversation } from "@/services/event/eventService";
import { useChatHubContext } from "@/contexts/ChatHubContext";

interface UseEventChatResult {
    messages: Message[];
    conversationId: string | null;
    currentUserId: string;
    isLoading: boolean;
    error: string | null;
    sendMessage: (text: string) => Promise<void>;
    deleteMessage: (messageId: string) => Promise<void>;
    editMessage: (messageId: string, newText: string) => Promise<void>;
}

export function useEventChat(eventId: string): UseEventChatResult {
    const {
        sendMessage: hubSend,
        deleteMessage: hubDelete,
        editMessage: hubEdit,
        joinEventGroup,
        leaveEventGroup,
        subscribeToConversation,
    } = useChatHubContext();

    const [messages, setMessages] = useState<Message[]>([]);
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [currentUserId, setCurrentUserId] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const convIdRef = useRef<string | null>(null);

    useEffect(() => {
        let mounted = true;

        setError(null);
        setIsLoading(true);
        const init = async () => {
            try {
                const [userId, { conversationId: convId }] = await Promise.all([
                    getCurrentUserId(),
                    getEventConversation(eventId),
                ]);
                if (!mounted) return;

                setCurrentUserId(userId);
                setConversationId(convId);
                convIdRef.current = convId;

                const history = await fetchConversationMessages(convId);
                if (!mounted) return;
                setMessages(history);

                await joinEventGroup(eventId);
            } catch {
                if (mounted) setError("Failed to load event chat.");
            } finally {
                if (mounted) setIsLoading(false);
            }
        };

        init();

        return () => {
            mounted = false;
            void leaveEventGroup(eventId);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [eventId]);

    useEffect(() => {
        if (!conversationId) return;

        const unsub = subscribeToConversation(
            conversationId,
            (msg) => setMessages((prev) => [...prev, msg]),
            (messageId) =>
                setMessages((prev) =>
                    prev.map((m) =>
                        m.id === messageId ? { ...m, isDeleted: true, text: null } : m
                    )
                ),
            (messageId, text, editedAt) =>
                setMessages((prev) =>
                    prev.map((m) => (m.id === messageId ? { ...m, text, editedAt } : m))
                )
        );

        return unsub;
    }, [conversationId, subscribeToConversation]);

    const sendMessage = useCallback(
        async (text: string) => {
            const convId = convIdRef.current;
            if (!convId) return;
            await hubSend(convId, text);
        },
        [hubSend]
    );

    const deleteMessage = useCallback(
        async (messageId: string) => {
            await hubDelete(messageId);
        },
        [hubDelete]
    );

    const editMessage = useCallback(
        async (messageId: string, newText: string) => {
            await hubEdit(messageId, newText);
        },
        [hubEdit]
    );

    return { messages, conversationId, currentUserId, isLoading, error, sendMessage, deleteMessage, editMessage };
}
