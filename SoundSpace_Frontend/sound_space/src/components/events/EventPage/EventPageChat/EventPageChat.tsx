"use client";

import { useState } from "react";
import ChatMessages from "@/components/messages/ChatMessages/ChatMessages";
import ChatInput from "@/components/messages/ChatInput/ChatInput";
import { useEventChat } from "@/hooks/events/useEventChat";
import "./EventPageChat.css";

interface EventPageChatProps {
    eventId: string;
}

const EventPageChat = ({ eventId }: EventPageChatProps) => {
    const { messages, currentUserId, isLoading, error, sendMessage, deleteMessage, editMessage } =
        useEventChat(eventId);
    const [inputValue, setInputValue] = useState("");

    const handleSend = async () => {
        const text = inputValue.trim();
        if (!text) return;
        setInputValue("");
        await sendMessage(text);
    };

    return (
        <div className="epc">
            <div className="epc__header">
                <span className="epc__live-dot" aria-label="live" />
                <span className="epc__live-text">LIVE</span>
                <span className="epc__header-title">Event Chat</span>
            </div>

            {isLoading ? (
                <div className="epc__state">Connecting to chat…</div>
            ) : error ? (
                <div className="epc__state epc__state--error">{error}</div>
            ) : (
                <ChatMessages
                    messages={messages}
                    currentUserId={currentUserId}
                    onDeleteMessage={deleteMessage}
                    onEditMessage={editMessage}
                />
            )}

            <div className="epc__input-wrapper">
                <ChatInput value={inputValue} onChange={setInputValue} onSend={handleSend} />
            </div>
        </div>
    );
};

export default EventPageChat;
