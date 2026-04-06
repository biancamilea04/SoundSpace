// Common types for Discovery feature
export interface CommonSong {
    id: string;
    albumImageUrl: string;
    title: string;
    artist: string;
}

export interface RecentlyBumping {
    title: string;
    artist: string;
    albumImageUrl: string;
    isPlaying: boolean;
}

export interface DiscoveryUserProfile {
    id: string;
    name: string;
    age: number;
    handle: string;
    imageUrl: string;
    tagline: string;
    genres: string[];
    matchPercentage: number;
    commonSongsCount: number;
    commonSongs: CommonSong[];
    recentlyBumping?: RecentlyBumping;
}

export type FilterType = 'all' | 'genres' | 'songs';

// Component Props
export interface DiscoveryCardProps {
    profile: DiscoveryUserProfile;
    onConnect?: (profileId: string) => void;
    onSkip?: (profileId: string) => void;
}

export interface UserInfoProps {
    name: string;
    handle: string;
    tagline: string;
}

export interface GenrePillsProps {
    genres: string[];
}

export interface CommonSongsProps {
    commonSongsCount: number;
    commonSongs: CommonSong[];
}

export interface RecentlyBumpingProps {
    recentlyBumping: RecentlyBumping;
}

export interface ActionButtonsProps {
    onConnect?: () => void;
    onSkip?: () => void;
}

export interface FilterButtonsProps {
    activeFilter: FilterType;
    onFilterChange: (filter: FilterType) => void;
}

export interface DiscoveryFeedProps {
    profiles: DiscoveryUserProfile[];
    onConnect?: (profileId: string) => void;
    onSkip?: (profileId: string) => void;
    isLoading?: boolean;
}