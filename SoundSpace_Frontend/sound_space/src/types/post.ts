export interface PostData {
    id: string;
    userId: string;
    displayName: string;
    profileImageUrl: string | null;
    content: string;
    spotifyUri: string | null;
    spotifyName: string | null;
    spotifyCoverUrl: string | null;
    spotifySubtitle: string | null;
    spotifyMediaType: string | null;
    previewUrl: string | null;
    createdAt: string;
    likeCount: number;
    isLikedByCurrentUser: boolean;
    eventId?: string | null;
    eventTitle?: string | null;
}

export interface CreatePostPayload {
    content: string;
    spotifyUri?: string;
    spotifyName?: string;
    spotifyCoverUrl?: string;
    spotifySubtitle?: string;
    spotifyMediaType?: string;
    previewUrl?: string;
}

export interface UpdatePostPayload {
    content: string;
    spotifyUri?: string | null;
}
