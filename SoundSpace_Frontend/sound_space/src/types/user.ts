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

export interface UserSearchResultDto {
    id: string;
    displayName: string;
    profileImageUrl: string | null;
}
