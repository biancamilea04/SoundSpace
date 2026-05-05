import { apiFetch } from '@/lib/apiClient';
import type { PostData } from '@/types/post';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || '';

export interface LikeStatus {
    likeCount: number;
    isLikedByCurrentUser: boolean;
}

export const toggleLike = async (postId: string): Promise<LikeStatus> => {
    const response = await apiFetch(`${BACKEND_URL}/api/Posts/${encodeURIComponent(postId)}/like`, {
        method: 'POST',
    });

    if (!response.ok) {
        throw new Error(`Failed to toggle like (status ${response.status})`);
    }

    return response.json() as Promise<LikeStatus>;
};

export const getLikeStatus = async (postId: string): Promise<LikeStatus> => {
    const response = await apiFetch(`${BACKEND_URL}/api/Posts/${encodeURIComponent(postId)}/likes`);

    if (!response.ok) {
        throw new Error(`Failed to fetch like status (status ${response.status})`);
    }

    return response.json() as Promise<LikeStatus>;
};

export const fetchLikedPosts = async (): Promise<PostData[]> => {
    const response = await apiFetch(`${BACKEND_URL}/api/users/liked-posts`);

    if (!response.ok) {
        throw new Error(`Failed to fetch liked posts (status ${response.status})`);
    }

    return response.json() as Promise<PostData[]>;
};
