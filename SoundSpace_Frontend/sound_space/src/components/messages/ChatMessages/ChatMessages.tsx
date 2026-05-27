import { useRef, useEffect, useState } from "react";
import { Check, CheckCheck, MoreVertical, Trash2, Pencil, X } from "lucide-react";
import type { Message } from "@/types/message";
import "./ChatMessages.css";

interface ChatMessagesProps {
    messages: Message[];
    currentUserId: string;
    onDeleteMessage?: (messageId: string) => void;
    onEditMessage?: (messageId: string, newText: string) => void;
}

const ChatMessages = ({ messages, currentUserId, onDeleteMessage, onEditMessage }: ChatMessagesProps) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const editInputRef = useRef<HTMLInputElement>(null);
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editText, setEditText] = useState("");

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        if (!openMenuId) return;
        const close = () => setOpenMenuId(null);
        document.addEventListener("click", close);
        return () => document.removeEventListener("click", close);
    }, [openMenuId]);

    useEffect(() => {
        if (editingId) editInputRef.current?.focus();
    }, [editingId]);

    const startEditing = (msg: Message) => {
        setEditingId(msg.id);
        setEditText(msg.text ?? "");
        setOpenMenuId(null);
    };

    const cancelEditing = () => {
        setEditingId(null);
        setEditText("");
    };

    const submitEdit = (messageId: string) => {
        const trimmed = editText.trim();
        if (trimmed && onEditMessage) {
            onEditMessage(messageId, trimmed);
        }
        cancelEditing();
    };

    return (
        <div className="chat-messages">
            {messages.map((msg) => {
                const isMine = msg.senderId === currentUserId;
                const isMenuOpen = openMenuId === msg.id;
                const isEditing = editingId === msg.id;
                return (
                    <div
                        key={msg.id}
                        className={`chat-messages__bubble-row ${isMine ? "chat-messages__bubble-row--sent" : "chat-messages__bubble-row--received"}`}
                    >
                        {isMine && !msg.isDeleted && (
                            <div className={`chat-messages__menu-wrap${isMenuOpen ? " chat-messages__menu-wrap--open" : ""}`}>
                                <button
                                    className="chat-messages__menu-btn"
                                    aria-label="Message options"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setOpenMenuId(isMenuOpen ? null : msg.id);
                                    }}
                                >
                                    <MoreVertical size={14} />
                                </button>
                                {isMenuOpen && (
                                    <div className="chat-messages__dropdown">
                                        <button
                                            className="chat-messages__dropdown-item"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                startEditing(msg);
                                            }}
                                        >
                                            <Pencil size={13} />
                                            Edit message
                                        </button>
                                        <button
                                            className="chat-messages__dropdown-item chat-messages__dropdown-item--danger"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDeleteMessage?.(msg.id);
                                                setOpenMenuId(null);
                                            }}
                                        >
                                            <Trash2 size={13} />
                                            Delete message
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                        <div
                            className={`chat-messages__bubble ${isMine ? "chat-messages__bubble--sent" : "chat-messages__bubble--received"}${msg.isDeleted ? " chat-messages__bubble--deleted" : ""}`}
                        >
                            {msg.isDeleted ? (
                                <p className="chat-messages__bubble-text chat-messages__bubble-text--deleted">
                                    Message deleted
                                </p>
                            ) : isEditing ? (
                                <div className="chat-messages__edit-wrap">
                                    <input
                                        ref={editInputRef}
                                        className="chat-messages__edit-input"
                                        value={editText}
                                        onChange={(e) => setEditText(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") submitEdit(msg.id);
                                            if (e.key === "Escape") cancelEditing();
                                        }}
                                    />
                                    <div className="chat-messages__edit-actions">
                                        <button
                                            className="chat-messages__edit-btn chat-messages__edit-btn--confirm"
                                            onClick={() => submitEdit(msg.id)}
                                            aria-label="Save edit"
                                            disabled={!editText.trim()}
                                        >
                                            <Check size={13} />
                                        </button>
                                        <button
                                            className="chat-messages__edit-btn chat-messages__edit-btn--cancel"
                                            onClick={cancelEditing}
                                            aria-label="Cancel edit"
                                        >
                                            <X size={13} />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <p className="chat-messages__bubble-text">{msg.text}</p>
                            )}
                            {!isEditing && (
                                <div className="chat-messages__bubble-meta">
                                    {msg.editedAt && !msg.isDeleted && (
                                        <span className="chat-messages__edited-label">edited</span>
                                    )}
                                    <span className="chat-messages__bubble-time">{msg.timestamp}</span>
                                    {isMine && !msg.isDeleted && (
                                        <span className="chat-messages__bubble-read">
                                            {msg.isRead ? (
                                                <CheckCheck size={14} className="chat-messages__bubble-read--read" />
                                            ) : (
                                                <Check size={14} className="chat-messages__bubble-read--unread" />
                                            )}
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
            <div ref={messagesEndRef} />
        </div>
    );
};

export default ChatMessages;
