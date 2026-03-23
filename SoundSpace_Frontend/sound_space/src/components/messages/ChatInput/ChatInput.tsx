import React from "react";
import { Send } from "lucide-react";
import "./ChatInput.css";

interface ChatInputProps {
    value: string;
    onChange: (value: string) => void;
    onSend: () => void;
}

const ChatInput = ({ value, onChange, onSend }: ChatInputProps) => {
    return (
        <div className="chat-input">
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && onSend()}
                placeholder="Type a message..."
                className="chat-input__field"
            />
            <button
                onClick={onSend}
                disabled={!value.trim()}
                className="chat-input__send-btn"
                aria-label="Send message"
            >
                <Send size={18} />
            </button>
        </div>
    );
};

export default ChatInput;
