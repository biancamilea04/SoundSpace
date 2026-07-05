"use client";

import React, { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMessageStore } from "@/stores/messageStore";
import { usePresenceStore } from "@/stores/presenceStore";
import { useChatHubContext } from "@/contexts/ChatHubContext";
import {
    createDirectChat,
    fetchConversations,
    fetchConversationMessages,
    getCurrentUserId,
} from "@/services/messages/messageService";
import ChatHeader from "@/components/messages/ChatHeader/ChatHeader";
import ChatMessages from "@/components/messages/ChatMessages/ChatMessages";
import ChatInput from "@/components/messages/ChatInput/ChatInput";

export default function ConversationPage() {
    const params = useParams<{ user: string }>();
    const targetUserId = params?.user ?? "";
    const router = useRouter();

    const storeConversations = useMessageStore((s) => s.conversations);
    const conversationsLoaded = useMessageStore((s) => s.conversationsLoaded);
    const onlineUserIds = usePresenceStore((s) => s.onlineUserIds);
    const { sendMessage, deleteMessage, editMessage } = useChatHubContext();

    const [currentUserId, setCurrentUserId] = useState("");
    const [messageInput, setMessageInput] = useState("");
    const [resolving, setResolving] = useState(false);
    const [resolveError, setResolveError] = useState(false);
    const loadedConvs = useRef<Set<string>>(new Set());

    useEffect(() => {
        getCurrentUserId().then(setCurrentUserId);
    }, []);

    const conversations = storeConversations.map((c) => ({
        ...c,
        user: { ...c.user, isOnline: onlineUserIds.has(c.user.id) },
    }));

    const activeConversation = conversations.find((c) => c.user.id === targetUserId);
    const activeConversationId = activeConversation?.id ?? "";

    // Load messages for this conversation once we have it
    useEffect(() => {
        if (!activeConversationId || loadedConvs.current.has(activeConversationId)) return;
        if (activeConversation?.isPending) return;
        loadedConvs.current.add(activeConversationId);
        fetchConversationMessages(activeConversationId).then((msgs) => {
            useMessageStore.getState().setConversationMessages(activeConversationId, msgs);
        });
    }, [activeConversationId]);

    // Edge case: conversations loaded but this user not found — create the conversation
    useEffect(() => {
        if (!conversationsLoaded || !currentUserId) return;
        if (activeConversation) return;
        if (resolving || resolveError) return;

        setResolving(true);
        createDirectChat(targetUserId)
            .then(() => fetchConversations(currentUserId))
            .then((convs) => {
                useMessageStore.getState().setConversations(convs);
                setResolving(false);
            })
            .catch(() => {
                setResolveError(true);
                setResolving(false);
            });
    }, [targetUserId, conversationsLoaded, currentUserId, activeConversation, resolving, resolveError]);

    const handleSendMessage = () => {
        if (!messageInput.trim() || !activeConversationId) return;
        const text = messageInput.trim();
        setMessageInput("");
        void sendMessage(activeConversationId, text);
    };

    const handleDeleteMessage = (messageId: string) => {
        void deleteMessage(messageId);
    };

    const handleEditMessage = (messageId: string, newText: string) => {
        void editMessage(messageId, newText);
    };

    if (resolveError) {
        return (
            <div className="messages-chat__empty">
                <p className="messages-chat__empty-text">
                    Could not open this conversation.{" "}
                    <button
                        onClick={() => router.push("/messages")}
                        style={{ color: "var(--color-primary)", background: "none", border: "none", cursor: "pointer", padding: 0 }}
                    >
                        Go back
                    </button>
                </p>
            </div>
        );
    }

    if (!activeConversation) {
        return (
            <div className="messages-chat__empty">
                <p className="messages-chat__empty-text">Loading conversation...</p>
            </div>
        );
    }

    return (
        <>
            <ChatHeader
                user={activeConversation.user}
                onBack={() => router.push("/messages")}
            />
            <ChatMessages
                messages={activeConversation.messages}
                currentUserId={currentUserId}
                onDeleteMessage={handleDeleteMessage}
                onEditMessage={handleEditMessage}
            />
            <ChatInput
                value={messageInput}
                onChange={setMessageInput}
                onSend={handleSendMessage}
            />
        </>
    );
}
