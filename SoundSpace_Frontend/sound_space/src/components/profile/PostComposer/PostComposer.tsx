"use client";

import { useState } from "react";
import { Music, Send } from "lucide-react";
import { createPost } from "@/services/post/postService";
import { SpotifyAttachmentPreview } from "@/components/global/SpotifyAttachmentPreview/SpotifyAttachmentPreview";
import { MediaSelectionModal } from "@/components/global/MediaSelectionModal/MediaSelectionModal";
import type { SpotifyMediaPayload } from "@/types/spotify";
import Link from "next/link";
import "./PostComposer.css";

interface PostComposerProps {
    avatarUrl?: string;
    username?: string;
    onPostCreated?: () => void;
}

export const PostComposer = ({ avatarUrl, username, onPostCreated }: PostComposerProps) => {
    const [text, setText] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [selectedMedia, setSelectedMedia] = useState<SpotifyMediaPayload | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handlePost = async () => {
        if (!text.trim() || isSubmitting) return;
        setIsSubmitting(true);
        try {
            await createPost({
                content: text,
                spotifyUri: selectedMedia?.uri,
            });
            setText("");
            setSelectedMedia(null);
            setShowModal(false);
            onPostCreated?.();
        } catch {
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="post-composer">
            <div className="post-composer__header">
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
                {username ? (
                    <Link href={`/profile/${encodeURIComponent(username)}`} className="post-composer__username">
                        {username}
                    </Link>
                ) : (
                    <span className="post-composer__username">User</span>
                )}
            </div>

            <div className="post-composer__content">
                <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="What's on your mind?"
                    className="post-composer__input"
                    onKeyDown={(e) => e.key === "Enter" && handlePost()}
                />

                {selectedMedia && (
                    <SpotifyAttachmentPreview
                        item={selectedMedia}
                        onRemove={() => setSelectedMedia(null)}
                    />
                )}
            </div>

            <div className="post-composer__actions">
                <button
                    className={`post-composer__attach-btn${selectedMedia ? " post-composer__attach-btn--active" : ""}`}
                    type="button"
                    onClick={() => setShowModal(true)}
                >
                    <Music size={18} className="post-composer__attach-icon" />
                    <span>Attach Track</span>
                </button>

                <button
                    className="post-composer__post-btn"
                    type="button"
                    disabled={!text.trim() || isSubmitting}
                    onClick={handlePost}
                >
                    <Send size={16} />
                    <span>{isSubmitting ? "Posting..." : "Post"}</span>
                </button>
            </div>

            {showModal && (
                <MediaSelectionModal
                    onSelect={(item) => {
                        setSelectedMedia(item);
                        setShowModal(false);
                    }}
                    onClose={() => setShowModal(false)}
                />
            )}
        </div>
    );
};

export default PostComposer;
