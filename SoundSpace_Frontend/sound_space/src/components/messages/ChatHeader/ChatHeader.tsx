import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { MoreVertical, Music, Headphones, Flag, AlertTriangle, ArrowLeft } from "lucide-react";
import type { MessageUser } from "@/types/message";
import "./ChatHeader.css";

interface ChatHeaderProps {
    user: MessageUser;
    onBack?: () => void;
}

const ChatHeader = ({ user, onBack }: ChatHeaderProps) => {
    const [showActionsMenu, setShowActionsMenu] = useState(false);
    const actionsMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (actionsMenuRef.current && !actionsMenuRef.current.contains(e.target as Node)) {
                setShowActionsMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="chat-header">
            <div className="chat-header__user">
                {onBack && (
                    <button
                        className="chat-header__back-btn"
                        onClick={onBack}
                        aria-label="Back to conversations"
                    >
                        <ArrowLeft size={22} />
                    </button>
                )}
                <div className="chat-header__avatar">
                    <Image
                        src={user.avatarUrl}
                        alt={`${user.name} avatar`}
                        width={40}
                        height={40}
                        className="chat-header__avatar-img"
                    />
                    {user.isOnline && (
                        <span className="chat-header__online" />
                    )}
                </div>
                <div className="chat-header__info">
                    <h3 className="chat-header__name">{user.name}</h3>
                    <span className="chat-header__status">
                        {user.isOnline ? "Online" : `Last seen ${user.lastSeen}`}
                    </span>
                </div>
            </div>

            <div className="chat-header__right">
                {user.listeningTo && (
                    <div className="chat-header__listening">
                        <Music size={14} className="chat-header__listening-icon" />
                        <span className="chat-header__listening-text">
                            {user.listeningTo.songTitle} – {user.listeningTo.artist}
                        </span>
                        <button className="chat-header__listen-along-btn">
                            <Headphones size={14} />
                            <span>Listen Along</span>
                        </button>
                    </div>
                )}

                <div className="chat-header__actions" ref={actionsMenuRef}>
                    <button
                        className="chat-header__actions-btn"
                        onClick={() => setShowActionsMenu((prev) => !prev)}
                        aria-label="More actions"
                    >
                        <MoreVertical size={20} />
                    </button>
                    {showActionsMenu && (
                        <div className="chat-header__actions-dropdown">
                            <button
                                className="chat-header__actions-dropdown-item"
                                onClick={() => setShowActionsMenu(false)}
                            >
                                <Flag size={14} />
                                <span>Report User</span>
                            </button>
                            <button
                                className="chat-header__actions-dropdown-item chat-header__actions-dropdown-item--danger"
                                onClick={() => setShowActionsMenu(false)}
                            >
                                <AlertTriangle size={14} />
                                <span>Report Message</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChatHeader;
