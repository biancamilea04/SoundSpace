import React from "react";
import Image from "next/image";
import type { Conversation } from "@/types/message";
import "./ConversationItem.css";

interface ConversationItemProps {
    conversation: Conversation;
    isActive: boolean;
    onSelect: (id: string) => void;
}

const ConversationItem = ({ conversation, isActive, onSelect }: ConversationItemProps) => {
    return (
        <button
            className={`conversation-item ${isActive ? "conversation-item--active" : ""}`}
            onClick={() => onSelect(conversation.id)}
        >
            <div className="conversation-item__avatar">
                <Image
                    src={conversation.user.avatarUrl}
                    alt={`${conversation.user.name} avatar`}
                    width={48}
                    height={48}
                    className="conversation-item__avatar-img"
                />
                {conversation.user.isOnline && (
                    <span className="conversation-item__online" />
                )}
            </div>
            <div className="conversation-item__info">
                <div className="conversation-item__top">
                    <span className="conversation-item__name">{conversation.user.name}</span>
                    <span className="conversation-item__time">{conversation.lastMessageTime}</span>
                </div>
                <div className="conversation-item__bottom">
                    <span className="conversation-item__preview">{conversation.lastMessage}</span>
                    {conversation.unreadCount > 0 && (
                        <span className="conversation-item__badge">{conversation.unreadCount}</span>
                    )}
                </div>
            </div>
        </button>
    );
};

export default ConversationItem;
