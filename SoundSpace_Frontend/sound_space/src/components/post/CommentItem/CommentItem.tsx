import React, { useState } from 'react';
import Image from 'next/image';
import type { CommentNode } from '../../../types/comment';
import './CommentItem.css';

interface CommentItemProps {
    comment: CommentNode;
    currentUserId: string | null;
    onReply: (commentId: string, userName: string) => void;
    onEdit: (commentId: string, newText: string) => void;
    onDelete: (commentId: string) => void;
    level?: number;
}

const timeAgo = (dateStr: string): string => {
    const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
};

const CommentItem = ({ comment, currentUserId, onReply, onEdit, onDelete, level = 0 }: CommentItemProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(comment.content);
    const isOwner = currentUserId !== null && currentUserId === comment.userId;
    const hasReplies = comment.replies.length > 0;

    const handleEditSubmit = () => {
        const trimmed = editText.trim();
        if (!trimmed || trimmed === comment.content) {
            setIsEditing(false);
            return;
        }
        onEdit(comment.id, trimmed);
        setIsEditing(false);
    };

    const handleEditKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleEditSubmit();
        }
        if (e.key === 'Escape') {
            setEditText(comment.content);
            setIsEditing(false);
        }
    };

    const avatarSrc = comment.profileImageUrl
        || `https://eu.ui-avatars.com/api/?name=${encodeURIComponent(comment.displayName)}&size=64&background=1ed760&color=000`;

    return (
        <div className="comment-item-thread">
            <div className={`comment-item${level > 0 ? ' comment-item--nested' : ''}`}>
                <div className="comment-item__avatar-wrapper">
                    <Image
                        src={avatarSrc}
                        alt={`${comment.displayName} avatar`}
                        width={32}
                        height={32}
                        className="comment-item__avatar"
                    />
                </div>
                <div className="comment-item__body">
                    <div className="comment-item__header">
                        <span className="comment-item__username">{comment.displayName}</span>
                        <span className="comment-item__time">{timeAgo(comment.createdAt)}</span>
                        {comment.updatedAt && (
                            <span className="comment-item__edited-indicator">(edited)</span>
                        )}
                    </div>

                    {isEditing ? (
                        <div className="comment-item__edit-form">
                            <textarea
                                className="comment-item__edit-input"
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                onKeyDown={handleEditKeyDown}
                                autoFocus
                                rows={2}
                            />
                            <div className="comment-item__edit-actions">
                                <button
                                    className="comment-item__edit-save-btn"
                                    onClick={handleEditSubmit}
                                    disabled={!editText.trim()}
                                >
                                    Save
                                </button>
                                <button
                                    className="comment-item__edit-cancel-btn"
                                    onClick={() => {
                                        setEditText(comment.content);
                                        setIsEditing(false);
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <p className="comment-item__text">{comment.content}</p>
                    )}

                    <div className="comment-item__actions">
                        <button
                            className="comment-item__reply-btn"
                            aria-label={`Reply to ${comment.displayName}`}
                            onClick={() => onReply(comment.id, comment.displayName)}
                        >
                            <span>Reply</span>
                        </button>

                        {isOwner && !isEditing && (
                            <div className="comment-item__owner-actions">
                                <button
                                    className="comment-item__edit-btn"
                                    aria-label="Edit comment"
                                    onClick={() => setIsEditing(true)}
                                >
                                    Edit
                                </button>
                                <button
                                    className="comment-item__delete-btn"
                                    aria-label="Delete comment"
                                    onClick={() => onDelete(comment.id)}
                                >
                                    Delete
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {hasReplies && (
                <div className="comment-item__replies">
                    {comment.replies.map((reply) => (
                        <CommentItem
                            key={reply.id}
                            comment={reply}
                            currentUserId={currentUserId}
                            onReply={onReply}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            level={level + 1}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default CommentItem;
