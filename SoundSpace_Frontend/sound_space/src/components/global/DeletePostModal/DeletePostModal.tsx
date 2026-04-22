"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import "./DeletePostModal.css";

interface DeletePostModalProps {
    isDeleting: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export const DeletePostModal = ({ isDeleting, onClose, onConfirm }: DeletePostModalProps) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = prev;
        };
    }, []);

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape" && !isDeleting) {
                onClose();
            }
        };

        document.addEventListener("keydown", onKeyDown);
        return () => {
            document.removeEventListener("keydown", onKeyDown);
        };
    }, [isDeleting, onClose]);

    if (!mounted) {
        return null;
    }

    return createPortal(
        <>
            <div className="delete-post-modal__overlay" onClick={!isDeleting ? onClose : undefined} />
            <div
                className="delete-post-modal__dialog"
                role="dialog"
                aria-modal="true"
                aria-label="Delete post"
            >
                <div className="delete-post-modal__header">
                    <h2 className="delete-post-modal__title">Delete Post</h2>
                    <button
                        className="delete-post-modal__close"
                        type="button"
                        onClick={onClose}
                        aria-label="Close"
                        disabled={isDeleting}
                    >
                        <X size={18} />
                    </button>
                </div>
                <p className="delete-post-modal__text">
                    This post will be removed from feed. Continue?
                </p>
                <div className="delete-post-modal__actions">
                    <button
                        className="delete-post-modal__button delete-post-modal__button--secondary"
                        type="button"
                        onClick={onClose}
                        disabled={isDeleting}
                    >
                        Cancel
                    </button>
                    <button
                        className="delete-post-modal__button delete-post-modal__button--danger"
                        type="button"
                        onClick={onConfirm}
                        disabled={isDeleting}
                    >
                        {isDeleting ? "Deleting..." : "Delete"}
                    </button>
                </div>
            </div>
        </>,
        document.body
    );
};

export default DeletePostModal;

