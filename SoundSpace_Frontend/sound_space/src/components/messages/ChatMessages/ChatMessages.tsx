import React, { useRef, useEffect } from "react";
import { Check, CheckCheck } from "lucide-react";
import type { Message } from "@/types/message";
import "./ChatMessages.css";

interface ChatMessagesProps {
    messages: Message[];
    currentUserId: string;
}

const ChatMessages = ({ messages, currentUserId }: ChatMessagesProps) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    return (
        <div className="chat-messages">
            {messages.map((msg) => {
                const isMine = msg.senderId === currentUserId;
                return (
                    <div
                        key={msg.id}
                        className={`chat-messages__bubble-row ${isMine ? "chat-messages__bubble-row--sent" : "chat-messages__bubble-row--received"}`}
                    >
                        <div
                            className={`chat-messages__bubble ${isMine ? "chat-messages__bubble--sent" : "chat-messages__bubble--received"}`}
                        >
                            <p className="chat-messages__bubble-text">{msg.text}</p>
                            <div className="chat-messages__bubble-meta">
                                <span className="chat-messages__bubble-time">{msg.timestamp}</span>
                                {isMine && (
                                    <span className="chat-messages__bubble-read">
                                        {msg.isRead ? (
                                            <CheckCheck size={14} className="chat-messages__bubble-read--read" />
                                        ) : (
                                            <Check size={14} className="chat-messages__bubble-read--unread" />
                                        )}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
            <div ref={messagesEndRef} />
        </div>
    );
};

export default ChatMessages;
