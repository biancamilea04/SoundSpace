import React, { useState } from 'react';
import Image from 'next/image';
import { Send } from 'lucide-react';
import './CommentInput.css';

interface CommentInputProps {
    currentUserAvatar: string;
    onSubmit: (text: string) => void;
}

const CommentInput = ({ currentUserAvatar, onSubmit }: CommentInputProps) => {
    const [text, setText] = useState('');

    const handleSubmit = () => {
        const trimmed = text.trim();
        if (!trimmed) return;
        onSubmit(trimmed);
        setText('');
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    return (
        <div className="comment-input">
            <div className="comment-input__inner">
                <Image
                    src={currentUserAvatar || '/icons/SoundSpaceIcon.png'}
                    alt="Your avatar"
                    width={32}
                    height={32}
                    className="comment-input__avatar"
                />
                <textarea
                    className="comment-input__field"
                    placeholder="Add a comment..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    rows={1}
                    aria-label="Add a comment"
                />
                <button
                    className="comment-input__send-btn"
                    onClick={handleSubmit}
                    disabled={!text.trim()}
                    aria-label="Post comment"
                >
                    <Send size={18} />
                </button>
            </div>
        </div>
    );
};

export default CommentInput;
