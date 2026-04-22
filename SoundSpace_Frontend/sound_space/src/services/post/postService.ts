import { apiFetch } from '@/lib/apiClient';
import { PostData, CreatePostPayload, UpdatePostPayload } from '@/types/post';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || '';

export const createPost = async (payload: CreatePostPayload): Promise<PostData> => {
    const response = await apiFetch(`${BACKEND_URL}/api/Posts`, {
        method: 'POST',
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        throw new Error(`Failed to create post (status ${response.status})`);
    }

    return response.json() as Promise<PostData>;
};

export const updatePost = async (id: string, payload: UpdatePostPayload): Promise<PostData> => {
    const response = await apiFetch(`${BACKEND_URL}/api/Posts/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        throw new Error(`Failed to update post (status ${response.status})`);
    }

    return response.json() as Promise<PostData>;
};

export const deletePost = async (id: string): Promise<void> => {
    const response = await apiFetch(`${BACKEND_URL}/api/Posts/${encodeURIComponent(id)}`, {
        method: 'DELETE',
    });

    if (!response.ok) {
        throw new Error(`Failed to delete post (status ${response.status})`);
    }
};

export const fetchAllPosts = async (): Promise<PostData[]> => {
    const response = await apiFetch(`${BACKEND_URL}/api/Posts`);

    if (!response.ok) {
        throw new Error(`Failed to fetch posts (status ${response.status})`);
    }

    return response.json() as Promise<PostData[]>;
};

export const fetchPostsByUserId = async (userId: string): Promise<PostData[]> => {
    const response = await apiFetch(
        `${BACKEND_URL}/api/Posts/user/${encodeURIComponent(userId)}`
    );

    if (!response.ok) {
        throw new Error(`Failed to fetch user posts (status ${response.status})`);
    }

    return response.json() as Promise<PostData[]>;
};

export const fetchPostsBySpotifyId = async (spotifyId: string): Promise<PostData[]> => {
    const response = await apiFetch(
        `${BACKEND_URL}/api/Posts/user/spotify/${encodeURIComponent(spotifyId)}`
    );

    if (!response.ok) {
        throw new Error(`Failed to fetch user posts (status ${response.status})`);
    }

    return response.json() as Promise<PostData[]>;
};
