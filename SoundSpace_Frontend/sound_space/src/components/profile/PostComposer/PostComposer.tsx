"use client";

import { useState } from "react";
import { Music, Send } from "lucide-react";
import { createPost } from "@/services/post/postService";
import "./PostComposer.css";

interface PostComposerProps {
    avatarUrl?: string;
    onPostCreated?: () => void;
}

export const PostComposer = ({ avatarUrl, onPostCreated }: PostComposerProps) => {
    const [text, setText] = useState("");
    const [spotifyUri, setSpotifyUri] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handlePost = async () => {
        if (!text.trim() || isSubmitting) return;
        setIsSubmitting(true);
        try {
            await createPost({
                content: text,
                spotifyUri: spotifyUri.trim() || undefined,
            });
            setText("");
            setSpotifyUri("");
            onPostCreated?.();
        } catch {
            /* silent */
        } finally {
            setIsSubmitting(false);
        }
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

            <div className="post-composer__input-row">
                <div className="post-composer__avatar">
                    <Music size={16} />
                </div>
                <input
                    type="text"
                    value={spotifyUri}
                    onChange={(e) => setSpotifyUri(e.target.value)}
                    placeholder="Spotify URI (e.g. spotify:track:...)"
                    className="post-composer__input"
                />
            </div>

            <div className="post-composer__actions">
                <div />
                <button
                    className="post-composer__post-btn"
                    type="button"
                    disabled={!text.trim() || isSubmitting}
                    onClick={handlePost}
                >
                    <Send size={14} />
                    <span>{isSubmitting ? "Posting..." : "Post"}</span>
                </button>
            </div>
        </div>
    );
};

export default PostComposer;
