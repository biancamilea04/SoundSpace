import React from "react";
import type { Conversation } from "@/types/message";
import SidebarHeader from "./SidebarHeader/SidebarHeader";
import SidebarSearch from "./SidebarSearch/SidebarSearch";
import ConversationItem from "./ConversationItem/ConversationItem";
import "./MessagesSidebar.css";

interface MessagesSidebarProps {
    conversations: Conversation[];
    activeConversationId: string;
    searchQuery: string;
    onSearchChange: (query: string) => void;
    onSelectConversation: (id: string) => void;
}

const MessagesSidebar = ({
    conversations,
    activeConversationId,
    searchQuery,
    onSearchChange,
    onSelectConversation,
}: MessagesSidebarProps) => {
    return (
        <aside className="messages-sidebar">
            <SidebarHeader />
            <SidebarSearch value={searchQuery} onChange={onSearchChange} />
            <div className="messages-sidebar__list">
                {conversations.map((convo) => (
                    <ConversationItem
                        key={convo.id}
                        conversation={convo}
                        isActive={convo.id === activeConversationId}
                        onSelect={onSelectConversation}
                    />
                ))}
            </div>
        </aside>
    );
};

export default MessagesSidebar;
