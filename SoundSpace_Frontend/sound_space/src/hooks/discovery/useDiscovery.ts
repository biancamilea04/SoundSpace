import { useState } from 'react';
import type { DiscoveryUserProfile, FilterType } from '@/types/discovery';

// Mock data for demonstration
const MOCK_PROFILES: DiscoveryUserProfile[] = [
    {
        id: '1',
        name: 'test_name_1',
        age: 24,
        handle: 'test_username_1',
        imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&h=1200&fit=crop',
        tagline: 'test_description_1',
        genres: ['Lo-Fi', 'Post-Punk', 'Jazz'],
        matchPercentage: 94,
        commonSongsCount: 34,
        commonSongs: [
            { id: '1', albumImageUrl: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=100&h=100&fit=crop', title: 'test_song_1', artist: 'test_artist_1' },
            { id: '2', albumImageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop', title: 'test_song_2', artist: 'test_artist_2' },
            { id: '3', albumImageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=100&h=100&fit=crop', title: 'test_song_3', artist: 'test_artist_3' },
            { id: '4', albumImageUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=100&h=100&fit=crop', title: 'test_song_4', artist: 'test_artist_4' },
            { id: '5', albumImageUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=100&h=100&fit=crop', title: 'test_song_5', artist: 'test_artist_5' },
        ],
        recentlyBumping: {
            title: 'test_recent_song_1',
            artist: 'test_recent_artist_1',
            albumImageUrl: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=100&h=100&fit=crop',
            isPlaying: true,
        },
    },
    {
        id: '2',
        name: 'test_name_2',
        age: 27,
        handle: 'test_username_2',
        imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=1200&fit=crop',
        tagline: 'test_description_2',
        genres: ['Electronic', 'House', 'Funk'],
        matchPercentage: 87,
        commonSongsCount: 28,
        commonSongs: [
            { id: '6', albumImageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop', title: 'test_song_6', artist: 'test_artist_6' },
            { id: '7', albumImageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=100&h=100&fit=crop', title: 'test_song_7', artist: 'test_artist_7' },
            { id: '8', albumImageUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=100&h=100&fit=crop', title: 'test_song_8', artist: 'test_artist_8' },
        ],
        recentlyBumping: {
            title: 'test_recent_song_2',
            artist: 'test_recent_artist_2',
            albumImageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop',
            isPlaying: false,
        },
    },
    {
        id: '3',
        name: 'test_name_3',
        age: 22,
        handle: 'test_username_3',
        imageUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&h=1200&fit=crop',
        tagline: 'test_description_3',
        genres: ['Indie', 'Dream Pop', 'Shoegaze'],
        matchPercentage: 91,
        commonSongsCount: 42,
        commonSongs: [
            { id: '9', albumImageUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=100&h=100&fit=crop', title: 'test_song_9', artist: 'test_artist_9' },
            { id: '10', albumImageUrl: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=100&h=100&fit=crop', title: 'test_song_10', artist: 'test_artist_10' },
            { id: '11', albumImageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=100&h=100&fit=crop', title: 'test_song_11', artist: 'test_artist_11' },
            { id: '12', albumImageUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=100&h=100&fit=crop', title: 'test_song_12', artist: 'test_artist_12' },
            { id: '13', albumImageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop', title: 'test_song_13', artist: 'test_artist_13' },
        ],
    },
];

interface UseDiscoveryReturn {
    // State
    activeFilter: FilterType;
    profiles: DiscoveryUserProfile[];
    isLoading: boolean;

    // Actions
    handleFilterChange: (filter: FilterType) => void;
    handleConnect: (profileId: string) => void;
    handleSkip: (profileId: string) => void;
}

export const useDiscovery = (): UseDiscoveryReturn => {
    const [activeFilter, setActiveFilter] = useState<FilterType>('all');
    const [profiles, setProfiles] = useState<DiscoveryUserProfile[]>(MOCK_PROFILES);
    const [isLoading, setIsLoading] = useState(false);

    const handleFilterChange = (filter: FilterType) => {
        setActiveFilter(filter);
        // In a real app, this would trigger a fetch with the new filter
        // setIsLoading(true);
        // await fetchProfiles(filter);
        // setIsLoading(false);
    };

    const handleConnect = (profileId: string) => {
        console.log('Connected with profile:', profileId);
        // Remove the profile from the list after connecting
        setProfiles((prev) => prev.filter((p) => p.id !== profileId));
        // In a real app, this would make an API call to connect
        // await connectWithProfile(profileId);
    };

    const handleSkip = (profileId: string) => {
        console.log('Skipped profile:', profileId);
        // Remove the profile from the list after skipping
        setProfiles((prev) => prev.filter((p) => p.id !== profileId));
        // In a real app, this would make an API call to skip
        // await skipProfile(profileId);
    };

    return {
        // State
        activeFilter,
        profiles,
        isLoading,

        // Actions
        handleFilterChange,
        handleConnect,
        handleSkip,
    };
};

export default useDiscovery;