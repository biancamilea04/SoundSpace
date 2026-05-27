"use client";

import { useEffect, useRef, useState } from "react";
import { useMessageStore } from "@/stores/messageStore";
import { usePresenceStore } from "@/stores/presenceStore";
import { useChatHubContext } from "@/contexts/ChatHubContext";
import {
    fetchConversations,
    fetchConversationMessages,
    getCurrentUserId,
    createDirectChat,
} from "@/services/messages/messageService";
import type { Conversation } from "@/types/message";

interface UseMessagesResult {
    conversations: Conversation[];
    filteredConversations: Conversation[];
    activeConversation: Conversation | undefined;
    activeConversationId: string;
    messageInput: string;
    searchQuery: string;
    currentUserId: string;
    isLoading: boolean;
    showMobileChat: boolean;
    setMessageInput: (value: string) => void;
    setSearchQuery: (value: string) => void;
    handleSendMessage: () => void;
    handleDeleteMessage: (messageId: string) => void;
    handleEditMessage: (messageId: string, newText: string) => void;
    handleSelectConversation: (id: string) => void;
    handleBackToList: () => void;
}

export const useMessages = (): UseMessagesResult => {
    const storeConversations = useMessageStore((s) => s.conversations);
    const activeConversationId = useMessageStore((s) => s.activeConversationId);
    const onlineUserIds = usePresenceStore((s) => s.onlineUserIds);
    const { sendMessage, deleteMessage, editMessage, markConversationRead } = useChatHubContext();

    const [currentUserId, setCurrentUserId] = useState("");
    const [messageInput, setMessageInput] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [showMobileChat, setShowMobileChat] = useState(false);
    const loadedConvs = useRef<Set<string>>(new Set());

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const uid = await getCurrentUserId();
                if (cancelled) return;
                setCurrentUserId(uid);

                const convs = await fetchConversations(uid);
                if (cancelled) return;
                useMessageStore.getState().setConversations(convs);

                if (convs.length > 0 && !useMessageStore.getState().activeConversationId) {
                    useMessageStore.getState().setActiveConversation(convs[0].id);
                }
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    // Lazy-load message history when a conversation is first opened
    useEffect(() => {
        if (!activeConversationId || loadedConvs.current.has(activeConversationId)) return;
        const { conversations, setConversationMessages } = useMessageStore.getState();
        const conv = conversations.find((c) => c.id === activeConversationId);
        if (conv?.isPending) return;
        loadedConvs.current.add(activeConversationId);
        fetchConversationMessages(activeConversationId).then((msgs) => {
            setConversationMessages(activeConversationId, msgs);
        });
    }, [activeConversationId]);

    // Overlay live presence onto conversation user objects
    const conversations: Conversation[] = storeConversations.map((c) => ({
        ...c,
        user: { ...c.user, isOnline: onlineUserIds.has(c.user.id) },
    }));

    const activeConversation = conversations.find(
        (c) => c.id === activeConversationId
    );

    const filteredConversations = conversations.filter((c) =>
        c.user.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleDeleteMessage = (messageId: string) => {
        void deleteMessage(messageId);
    };

    const handleEditMessage = (messageId: string, newText: string) => {
        void editMessage(messageId, newText);
    };

    const handleSendMessage = () => {
        if (!messageInput.trim() || !activeConversationId) return;
        const text = messageInput.trim();
        setMessageInput("");

        const { conversations: currentConvs, replacePendingConversation } = useMessageStore.getState();
        const activeConv = currentConvs.find((c) => c.id === activeConversationId);
        if (activeConv?.isPending && activeConv.targetUserId) {
            const tempId = activeConv.id;
            createDirectChat(activeConv.targetUserId).then((result) => {
                replacePendingConversation(tempId, result.conversationId);
                void sendMessage(result.conversationId, text);
            });
            return;
        }

        void sendMessage(activeConversationId, text);
    };

    const handleSelectConversation = (id: string) => {
        useMessageStore.getState().setActiveConversation(id);
        useMessageStore.getState().markConversationRead(id);
        setShowMobileChat(true);
        void markConversationRead(id);
    };

    const handleBackToList = () => setShowMobileChat(false);

    return {
        conversations,
        filteredConversations,
        activeConversation,
        activeConversationId,
        messageInput,
        searchQuery,
        currentUserId,
        isLoading,
        showMobileChat,
        setMessageInput,
        setSearchQuery,
        handleSendMessage,
        handleDeleteMessage,
        handleEditMessage,
        handleSelectConversation,
        handleBackToList,
    };
};
