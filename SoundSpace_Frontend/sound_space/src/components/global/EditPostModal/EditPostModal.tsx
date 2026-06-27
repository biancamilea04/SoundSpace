"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X, Music, Send } from "lucide-react";
import { updatePost } from "@/services/post/postService";
import { useSpotifyItem } from "@/hooks/spotify/useSpotifyItem";
import { SpotifyAttachmentPreview } from "@/components/global/SpotifyAttachmentPreview/SpotifyAttachmentPreview";
import { MediaSelectionModal } from "@/components/global/MediaSelectionModal/MediaSelectionModal";
import type { SpotifyMediaPayload } from "@/types/spotify";
import "./EditPostModal.css";

interface EditPostModalProps {
    postId: string;
    initialContent: string;
    initialSpotifyUri?: string;
    onClose: () => void;
    onSaved: () => void;
}

export const EditPostModal = ({
    postId,
    initialContent,
    initialSpotifyUri,
    onClose,
    onSaved,
}: EditPostModalProps) => {
    const [text, setText] = useState(initialContent);
    const [selectedMedia, setSelectedMedia] = useState<SpotifyMediaPayload | null>(null);
    const [showMediaModal, setShowMediaModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [mounted, setMounted] = useState(false);
    const dialogRef = useRef<HTMLDivElement>(null);

    const { item: initialItem, isLoading: isLoadingItem } = useSpotifyItem(
        initialSpotifyUri ?? null
    );

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (initialItem && selectedMedia === null) {
            setSelectedMedia(initialItem);
        }
    }, [initialItem]);

    useEffect(() => {
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = prev; };
    }, []);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [onClose]);

    const handleSave = async () => {
        if (!text.trim() || isSubmitting) return;
        setIsSubmitting(true);
        try {
            await updatePost(postId, {
                content: text,
                spotifyUri: selectedMedia?.uri ?? null,
                spotifyName: selectedMedia?.name ?? null,
                spotifyCoverUrl: selectedMedia?.coverUrl ?? null,
                spotifySubtitle: selectedMedia?.subtitle ?? null,
                spotifySubtitleUrl: selectedMedia?.subtitleUrl ?? null,
                spotifyMediaType: selectedMedia?.type ?? null,
                previewUrl: selectedMedia?.previewUrl ?? null,
                previewStartSecond: selectedMedia?.previewStartSecond ?? null,
                previewDuration: selectedMedia?.previewDuration ?? null,
            });
            onSaved();
            onClose();
        } catch {
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!mounted) return null;

    return createPortal(
        <>
            <div className="edit-post-modal__overlay" onClick={onClose} />
            <div
                className="edit-post-modal__dialog"
                role="dialog"
                aria-modal="true"
                aria-label="Edit post"
                ref={dialogRef}
                tabIndex={-1}
            >
                <div className="edit-post-modal__header">
                    <h2 className="edit-post-modal__title">Edit Post</h2>
                    <button
                        className="edit-post-modal__close-btn"
                        type="button"
                        onClick={onClose}
                        aria-label="Close"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="edit-post-modal__content">
                    <input
                        type="text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="What's on your mind?"
                        className="edit-post-modal__input"
                        onKeyDown={(e) => e.key === "Enter" && handleSave()}
                        autoFocus
                    />

                    {!isLoadingItem && selectedMedia && (
                        <SpotifyAttachmentPreview
                            item={selectedMedia}
                            onRemove={() => setSelectedMedia(null)}
                        />
                    )}
                </div>

                <div className="edit-post-modal__actions">
                    <button
                        className={`edit-post-modal__attach-btn${selectedMedia ? " edit-post-modal__attach-btn--active" : ""}`}
                        type="button"
                        onClick={() => setShowMediaModal(true)}
                    >
                        <Music size={18} className="edit-post-modal__attach-icon" />
                        <span>Add Media</span>
                    </button>

                    <button
                        className="edit-post-modal__save-btn"
                        type="button"
                        disabled={!text.trim() || isSubmitting}
                        onClick={handleSave}
                    >
                        <Send size={16} />
                        <span>{isSubmitting ? "Saving..." : "Save"}</span>
                    </button>
                </div>
            </div>

            {showMediaModal && (
                <MediaSelectionModal
                    onSelect={(item) => {
                        setSelectedMedia(item);
                        setShowMediaModal(false);
                    }}
                    onClose={() => setShowMediaModal(false)}
                />
            )}
        </>,
        document.body
    );
};

export default EditPostModal;
