import type { SongProps } from '../Song/Song';

export interface PostUser {
    name: string;
    avatarUrl: string;
    isOnline?: boolean;
}

export interface PostStats {
    likes: number;
    comments: number;
    isLikedByCurrentUser: boolean;
}

export interface PostProps {
    postId: string;
    user: PostUser;
    timeAgo: string;
    content: string;
    song?: SongProps;
    spotifyUri?: string;
    spotifyName?: string;
    spotifyCoverUrl?: string;
    spotifySubtitle?: string;
    spotifyMediaType?: string;
    previewUrl?: string;
    stats: PostStats;
    isOwner?: boolean;
    onEditPost?: () => void;
    onDeletePost?: () => void;
}

export interface SelectedPostPayload {
    postId: string;
    postKey: string;
    user: PostUser;
    timeAgo: string;
    content: string;
    song?: SongProps;
    spotifyUri?: string;
    spotifyName?: string;
    spotifyCoverUrl?: string;
    spotifySubtitle?: string;
    spotifyMediaType?: string;
    previewUrl?: string;
    stats: PostStats;
    likeCount?: number;
    isLikedByCurrentUser?: boolean;
}
