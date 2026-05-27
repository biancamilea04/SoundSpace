export interface UserProfile {
    id: string;
    spotifyId: string;
    displayName: string;
    profileImageUrl: string;
    email: string;
    country: string;
    followers: number;
    lastSeen?: string;
}

export interface UserMusicStatus {
    userId: string;
    isListening: boolean;
    currentlyPlayingTitle: string | null;
    currentlyPlayingArtist: string | null;
    currentlyPlayingArtistUrl: string | null;
    currentlyPlayingCoverUrl: string | null;
    currentlyPlayingUri: string | null;
    currentlyPlayingProgressMs: number;
}

export interface UserSearchResultDto {
    id: string;
    displayName: string;
    profileImageUrl: string | null;
}
