export interface PostData {
    id: string;
    userId: string;
    displayName: string;
    profileImageUrl: string | null;
    content: string;
    spotifyUri: string | null;
    createdAt: string;
}

export interface CreatePostPayload {
    content: string;
    spotifyUri?: string;
}
