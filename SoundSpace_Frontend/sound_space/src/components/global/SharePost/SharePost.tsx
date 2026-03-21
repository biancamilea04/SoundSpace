"use client";

import { Headphones, Music, Send } from "lucide-react";
import { useState } from "react";
import "./SharePost.css";

interface SharePostProps {
    onPost?: (text: string, song?: string) => void;
}

export const SharePost = ({ onPost }: SharePostProps) => {
    const [text, setText] = useState("");
    const [attachedSong, setAttachedSong] = useState<string | null>(null);

    const handlePost = () => {
        if (!text.trim()) return;
        onPost?.(text, attachedSong ?? undefined);
        setText("");
        setAttachedSong(null);
    };

    const handleAttachSong = () => {
        setAttachedSong("Selected Song");
    };

    return (
        <section className="share-post">
            <h2 className="share-post__section-title">
                Share Your Thoughts
            </h2>
            <div className="share-post__card">
                {/* Input Area */}
                <div className="share-post__input-row">
                    <div className="share-post__avatar">
                        <Headphones className="share-post__avatar-icon" />
                    </div>
                    <input
                        type="text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="What are you listening to?"
                        className="share-post__input"
                        onKeyDown={(e) => e.key === "Enter" && handlePost()}
                    />
                </div>

                {/* Attached Song Chip */}
                {attachedSong && (
                    <div className="share-post__song-chip">
                        <Music className="share-post__song-chip-icon" />
                        <span className="share-post__song-chip-name">{attachedSong}</span>
                        <button
                            onClick={() => setAttachedSong(null)}
                            className="share-post__song-chip-remove"
                            aria-label="Remove attached song"
                        >
                            ✕
                        </button>
                    </div>
                )}

                {/* Actions */}
                <div className="share-post__actions">
                    <button
                        onClick={handleAttachSong}
                        className="share-post__attach-btn"
                    >
                        <Music className="share-post__attach-icon" />
                        Attach Song
                    </button>

                    <button
                        onClick={handlePost}
                        disabled={!text.trim()}
                        className="share-post__post-btn"
                    >
                        <Send className="share-post__post-icon" />
                        Post
                    </button>
                </div>
            </div>
        </section>
    );
};

export default SharePost;
