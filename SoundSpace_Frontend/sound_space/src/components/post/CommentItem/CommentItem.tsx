import React from 'react';
import Image from 'next/image';
import type { Comment } from '@/types/comment';
import './CommentItem.css';

interface CommentItemProps {
    comment: Comment;
}

const CommentItem = ({ comment }: CommentItemProps) => {
    return (
        <div className="comment-item">
            <div className="comment-item__avatar-wrapper">
                <Image
                    src={comment.user.avatarUrl || '/icons/SoundSpaceIcon.png'}
                    alt={`${comment.user.name} avatar`}
                    width={32}
                    height={32}
                    className="comment-item__avatar"
                />
            </div>
            <div className="comment-item__body">
                <div className="comment-item__header">
                    <span className="comment-item__username">{comment.user.name}</span>
                    <span className="comment-item__time">{comment.timeAgo}</span>
                </div>
                <p className="comment-item__text">{comment.text}</p>
                <button className="comment-item__reply-btn" aria-label={`Reply to ${comment.user.name}`}>
                    <span>Reply</span>
                </button>
            </div>
        </div>
    );
};

export default CommentItem;
