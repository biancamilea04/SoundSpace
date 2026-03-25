import type { SongProps } from '../Song/Song';

export interface PostUser {
    name: string;
    avatarUrl: string;
    isOnline?: boolean;
}

export interface PostStats {
    likes: number;
    comments: number;
}

export interface PostProps {
    user: PostUser;
    timeAgo: string;
    content: string;
    song?: SongProps;
    stats: PostStats;
}

export interface SelectedPostPayload {
    user: PostUser;
    timeAgo: string;
    content: string;
    song?: SongProps;
    stats: PostStats;
}
