import React from 'react';
import Image from 'next/image';
import type { Comment } from '../../../types/comment';
import './CommentItem.css';

interface CommentItemProps {
    comment: Comment;
    onReply: (comment: Comment) => void;
    level?: number;
}

const CommentItem = ({ comment, onReply, level = 0 }: CommentItemProps) => {
    const hasReplies = Boolean(comment.replies && comment.replies.length > 0);

    return (
        <div className="comment-item-thread">
            <div className={`comment-item${level > 0 ? ' comment-item--nested' : ''}`}>
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
                    <button
                        className="comment-item__reply-btn"
                        aria-label={`Reply to ${comment.user.name}`}
                        onClick={() => onReply(comment)}
                    >
                        <span>Reply</span>
                    </button>
                </div>
            </div>

            {hasReplies && (
                <div className="comment-item__replies">
                    {comment.replies?.map((reply) => (
                        <CommentItem key={reply.id} comment={reply} onReply={onReply} level={level + 1} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default CommentItem;
