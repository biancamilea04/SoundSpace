import React from 'react';
import type { CommentNode } from '@/types/comment';
import CommentItem from '@/components/post/CommentItem/CommentItem';

interface PostCommentsProps {
    comments: CommentNode[];
    currentUserId: string | null;
    onReply: (commentId: string, userName: string) => void;
    onEdit: (commentId: string, newText: string) => void;
    onDelete: (commentId: string) => void;
}

const countNodes = (nodes: CommentNode[]): number =>
    nodes.reduce((total, node) => total + 1 + countNodes(node.replies), 0);

const PostComments = ({ comments, currentUserId, onReply, onEdit, onDelete }: PostCommentsProps) => {
    const total = countNodes(comments);

    return (
        <section className="post-page__comments" aria-label="Comments">
            <h3 className="post-page__comments-heading">Comments ({total})</h3>
            <div className="post-page__comments-list">
                {comments.map((comment) => (
                    <CommentItem
                        key={comment.id}
                        comment={comment}
                        currentUserId={currentUserId}
                        onReply={onReply}
                        onEdit={onEdit}
                        onDelete={onDelete}
                    />
                ))}
            </div>
        </section>
    );
};

export default PostComments;
