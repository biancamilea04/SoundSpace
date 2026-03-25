import React from 'react';
import type { Comment } from '@/types/comment';
import CommentItem from '@/components/post/CommentItem/CommentItem';

interface PostCommentsProps {
    comments: Comment[];
    onReply: (comment: Comment) => void;
}

const countComments = (commentList: Comment[]): number => {
    return commentList.reduce((total, comment) => {
        const replyCount = comment.replies ? countComments(comment.replies) : 0;
        return total + 1 + replyCount;
    }, 0);
};

const PostComments = ({ comments, onReply }: PostCommentsProps) => {
    const totalComments = countComments(comments);

    return (
        <section className="post-page__comments" aria-label="Comments">
            <h3 className="post-page__comments-heading">Comments ({totalComments})</h3>
            <div className="post-page__comments-list">
                {comments.map((comment) => (
                    <CommentItem key={comment.id} comment={comment} onReply={onReply} />
                ))}
            </div>
        </section>
    );
};

export default PostComments;
