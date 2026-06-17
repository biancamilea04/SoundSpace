"use client";

import { Headphones, Music, Send } from "lucide-react";
import { useState } from "react";
import { createPost } from "@/services/post/postService";
import "./SharePost.css";

interface SharePostProps {
    onPostCreated?: () => void;
}

export const SharePost = ({ onPostCreated }: SharePostProps) => {
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
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section className="share-post">
            <h2 className="share-post__section-title">
                Share Your Thoughts
            </h2>
            <div className="share-post__card">
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

                <div className="share-post__input-row">
                    <div className="share-post__avatar">
                        <Music className="share-post__avatar-icon" />
                    </div>
                    <input
                        type="text"
                        value={spotifyUri}
                        onChange={(e) => setSpotifyUri(e.target.value)}
                        placeholder="Spotify URI (e.g. spotify:track:...)"
                        className="share-post__input"
                    />
                </div>

                <div className="share-post__actions">
                    <button
                        onClick={handlePost}
                        disabled={!text.trim() || isSubmitting}
                        className="share-post__post-btn"
                    >
                        <Send className="share-post__post-icon" />
                        {isSubmitting ? "Posting..." : "Post"}
                    </button>
                </div>
            </div>
        </section>
    );
};

export default SharePost;
