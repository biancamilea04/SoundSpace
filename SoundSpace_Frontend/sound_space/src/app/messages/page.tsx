"use client";

import React from "react";
import Header from "@/components/global/Header/Header";
import MessagesSidebar from "@/components/messages/MessagesSidebar/MessagesSidebar";
import ChatHeader from "@/components/messages/ChatHeader/ChatHeader";
import ChatMessages from "@/components/messages/ChatMessages/ChatMessages";
import ChatInput from "@/components/messages/ChatInput/ChatInput";
import { useMessages } from "@/hooks/Messages/useMessages";
import "./page.css";

export default function MessagesPage() {
    const {
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
    } = useMessages();

    if (isLoading) {
        return (
            <div className="messages__page-wrapper">
                <Header title="Messages" />
                <div className="messages-container">
                    <div className="messages-chat__empty">
                        <p className="messages-chat__empty-text">Loading conversations...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="messages__page-wrapper">
            <Header title="Messages" />
            <div className="messages-container">
                <div className="messages-layout">
                    <div className={`messages-sidebar-pane${showMobileChat ? " messages-sidebar-pane--hidden" : ""}`}>
                        <MessagesSidebar
                            conversations={filteredConversations}
                            activeConversationId={activeConversationId}
                            searchQuery={searchQuery}
                            onSearchChange={setSearchQuery}
                            onSelectConversation={handleSelectConversation}
                        />
                    </div>

                    <main className={`messages-chat${showMobileChat ? " messages-chat--active" : ""}`}>
                        {activeConversation ? (
                            <>
                                <ChatHeader user={activeConversation.user} onBack={handleBackToList} />
                                <ChatMessages
                                    messages={activeConversation.messages}
                                    currentUserId={currentUserId}
                                />
                                <ChatInput
                                    value={messageInput}
                                    onChange={setMessageInput}
                                    onSend={handleSendMessage}
                                />
                            </>
                        ) : (
                            <div className="messages-chat__empty">
                                <p className="messages-chat__empty-text">Select a conversation to start chatting</p>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}
