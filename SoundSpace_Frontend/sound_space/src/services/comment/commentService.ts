import { apiFetch } from '@/lib/apiClient';
import type { CommentData } from '@/types/comment';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || '';

export const fetchCommentsByPostId = async (postId: string): Promise<CommentData[]> => {
    const response = await apiFetch(`${BACKEND_URL}/api/posts/${encodeURIComponent(postId)}/comments`);

    if (!response.ok) {
        throw new Error(`Failed to fetch comments (status ${response.status})`);
    }

    return response.json() as Promise<CommentData[]>;
};

export const createComment = async (payload: {
    content: string;
    postId: string;
    parentCommentId?: string;
}): Promise<CommentData> => {
    const response = await apiFetch(`${BACKEND_URL}/api/Comments`, {
        method: 'POST',
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        throw new Error(`Failed to create comment (status ${response.status})`);
    }

    return response.json() as Promise<CommentData>;
};

export const updateComment = async (
    commentId: string,
    payload: { content: string }
): Promise<CommentData> => {
    const response = await apiFetch(`${BACKEND_URL}/api/Comments/${encodeURIComponent(commentId)}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        throw new Error(`Failed to update comment (status ${response.status})`);
    }

    return response.json() as Promise<CommentData>;
};

export const deleteComment = async (commentId: string): Promise<void> => {
    const response = await apiFetch(`${BACKEND_URL}/api/Comments/${encodeURIComponent(commentId)}`, {
        method: 'DELETE',
    });

    if (!response.ok) {
        throw new Error(`Failed to delete comment (status ${response.status})`);
    }
};
