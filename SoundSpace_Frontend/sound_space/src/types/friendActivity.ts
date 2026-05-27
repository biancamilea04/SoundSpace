export interface FriendActivity {
    userId: string;
    displayName: string;
    profileImageUrl: string | null;
    isOnline: boolean;
    isListening: boolean;
    currentlyPlayingTitle: string | null;
    currentlyPlayingArtist: string | null;
    currentlyPlayingArtistUrl: string | null;
    currentlyPlayingCoverUrl: string | null;
    currentlyPlayingUri: string | null;
    currentlyPlayingProgressMs: number;
    lastPlayedTitle: string | null;
    lastPlayedArtist: string | null;
    lastPlayedArtistUrl: string | null;
    lastPlayedUri: string | null;
    lastPlayedCoverUrl: string | null;
    musicStatusUpdatedAt: string | null;
    lastSeen: string;
}

export interface UserStatusChangedPayload {
    userId: string;
    isListening: boolean;
    currentlyPlayingTitle: string | null;
    currentlyPlayingArtist: string | null;
    currentlyPlayingArtistUrl: string | null;
    currentlyPlayingCoverUrl: string | null;
    currentlyPlayingUri: string | null;
    currentlyPlayingProgressMs: number;
    lastPlayedTitle: string | null;
    lastPlayedArtist: string | null;
    lastPlayedArtistUrl: string | null;
    lastPlayedUri: string | null;
    lastPlayedCoverUrl: string | null;
    musicStatusUpdatedAt: string | null;
}
