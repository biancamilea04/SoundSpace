"use client";

import React, { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/global/Header/Header";
import MessagesSidebar from "@/components/messages/MessagesSidebar/MessagesSidebar";
import { useMessagesLayout } from "@/hooks/Messages/useMessagesLayout";
import { useMessageStore } from "@/stores/messageStore";
import "./page.css";

export default function MessagesLayout({ children }: { children: React.ReactNode }) {
    const params = useParams<{ user?: string }>();
    const activeUserId = params?.user ?? "";
    const router = useRouter();

    const { conversations, filteredConversations, searchQuery, setSearchQuery } =
        useMessagesLayout();

    const conversationsLoaded = useMessageStore((s) => s.conversationsLoaded);
    const setActiveConversation = useMessageStore((s) => s.setActiveConversation);
    const markConversationRead = useMessageStore((s) => s.markConversationRead);

    const activeConversation = conversations.find((c) => c.user.id === activeUserId);
    const activeConversationId = activeConversation?.id ?? "";

    // Keep store's activeConversationId in sync with URL so SignalR read-receipt
    // logic in ChatHubContext continues to work without changes.
    useEffect(() => {
        if (!activeUserId || !conversationsLoaded) return;
        if (activeConversationId) {
            setActiveConversation(activeConversationId);
            markConversationRead(activeConversationId);
        }
    }, [activeUserId, activeConversationId, conversationsLoaded, setActiveConversation, markConversationRead]);

    const handleSelectConversation = (userId: string) => {
        router.push(`/messages/${userId}`);
    };

    const isConversationOpen = !!activeUserId;

    return (
        <div className="messages__page-wrapper">
            <Header title="Messages" />
            <div className="messages-container">
                <div className="messages-layout">
                    <div
                        className={`messages-sidebar-pane${
                            isConversationOpen ? " messages-sidebar-pane--hidden" : ""
                        }`}
                    >
                        <MessagesSidebar
                            conversations={filteredConversations}
                            activeConversationId={activeConversationId}
                            searchQuery={searchQuery}
                            onSearchChange={setSearchQuery}
                            onSelectConversation={handleSelectConversation}
                        />
                    </div>

                    <main
                        className={`messages-chat${
                            isConversationOpen ? " messages-chat--active" : ""
                        }`}
                    >
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
}
