"use client";

import { useEffect, useState } from "react";
import type { Conversation, Message } from "@/types/message";
import { fetchConversations, getCurrentUserId } from "@/services/messages/messageService";

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
    handleSelectConversation: (id: string) => void;
    handleBackToList: () => void;
}

export const useMessages = (): UseMessagesResult => {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeConversationId, setActiveConversationId] = useState<string>("");
    const [messageInput, setMessageInput] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [showMobileChat, setShowMobileChat] = useState(false);

    const currentUserId = getCurrentUserId();

    useEffect(() => {
        const load = async () => {
            try {
                const data = await fetchConversations();
                setConversations(data);
                if (data.length > 0) {
                    setActiveConversationId(data[0].id);
                }
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, []);

    const activeConversation = conversations.find((c) => c.id === activeConversationId);

    const filteredConversations = conversations.filter((c) =>
        c.user.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSendMessage = () => {
        if (!messageInput.trim() || !activeConversation) return;

        const newMessage: Message = {
            id: `m-${Date.now()}`,
            senderId: currentUserId,
            text: messageInput.trim(),
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            isRead: false,
        };

        setConversations((prev) =>
            prev.map((c) =>
                c.id === activeConversationId
                    ? {
                          ...c,
                          messages: [...c.messages, newMessage],
                          lastMessage: newMessage.text,
                          lastMessageTime: "Just now",
                      }
                    : c
            )
        );
        setMessageInput("");
    };

    const handleSelectConversation = (id: string) => {
        setActiveConversationId(id);
        setShowMobileChat(true);
        setConversations((prev) =>
            prev.map((c) =>
                c.id === id ? { ...c, unreadCount: 0 } : c
            )
        );
    };

    const handleBackToList = () => {
        setShowMobileChat(false);
    };

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
        handleSelectConversation,
        handleBackToList,
    };
};
