import React from 'react';
import type { Comment } from '@/types/comment';
import CommentItem from '@/components/post/CommentItem/CommentItem';

interface PostCommentsProps {
    comments: Comment[];
}

const PostComments = ({ comments }: PostCommentsProps) => {
    return (
        <section className="post-page__comments" aria-label="Comments">
            <h3 className="post-page__comments-heading">Comments ({comments.length})</h3>
            <div className="post-page__comments-list">
                {comments.map((comment) => (
                    <CommentItem key={comment.id} comment={comment} />
                ))}
            </div>
        </section>
    );
};

export default PostComments;
