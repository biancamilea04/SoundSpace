"use client";

import { useState } from "react";
import { Music, Send } from "lucide-react";
import "./PostComposer.css";

interface PostComposerProps {
    avatarUrl?: string;
    onPost?: (text: string, song?: string) => void;
}

export const PostComposer = ({ avatarUrl, onPost }: PostComposerProps) => {
    const [text, setText] = useState("");

    const handlePost = () => {
        if (!text.trim()) return;
        onPost?.(text);
        setText("");
    };

    return (
        <div className="post-composer">
            <div className="post-composer__input-row">
                <div className="post-composer__avatar">
                    {avatarUrl ? (
                        <img
                            src={avatarUrl}
                            alt="Your avatar"
                            className="post-composer__avatar-img"
                        />
                    ) : (
                        <div className="post-composer__avatar-placeholder" />
                    )}
                </div>
                <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="What's on your mind?"
                    className="post-composer__input"
                    onKeyDown={(e) => e.key === "Enter" && handlePost()}
                />
            </div>

            <div className="post-composer__actions">
                <button className="post-composer__attach-btn" type="button">
                    <Music size={16} />
                    <span>Attach Track</span>
                </button>

                <button
                    className="post-composer__post-btn"
                    type="button"
                    disabled={!text.trim()}
                    onClick={handlePost}
                >
                    <Send size={14} />
                    <span>Post</span>
                </button>
            </div>
        </div>
    );
};

export default PostComposer;
