import { NowPlayingData } from '@/types/nowPlaying';
import { TopArtist } from '@/types/topArtist';
import { TopTrack } from '@/types/topTrack';
import { RecentStream } from '@/types/recentStream';
import { apiFetch } from '@/lib/apiClient';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || '';

export const fetchNowPlaying = async (): Promise<NowPlayingData | null> => {
    const response = await apiFetch(`${BACKEND_URL}/api/users/now-playing`);

    if (response.status === 204) return null;

    if (!response.ok) {
        console.error(`[NowPlaying] Failed to fetch (status ${response.status})`);
        return null;
    }

    return response.json() as Promise<NowPlayingData>;
};

export const fetchTopArtists = async (): Promise<TopArtist[]> => {
    const response = await apiFetch(`${BACKEND_URL}/api/users/top-artists`);

    if (!response.ok) {
        console.error(`[TopArtists] Failed to fetch (status ${response.status})`);
        return [];
    }

    return response.json() as Promise<TopArtist[]>;
};

export const fetchTopTracks = async (): Promise<TopTrack[]> => {
    const response = await apiFetch(`${BACKEND_URL}/api/users/top-tracks`);

    if (!response.ok) {
        console.error(`[TopTracks] Failed to fetch (status ${response.status})`);
        return [];
    }

    return response.json() as Promise<TopTrack[]>;
};

export const fetchRecentStreams = async (): Promise<RecentStream[]> => {
    const response = await apiFetch(`${BACKEND_URL}/api/users/recent-streams`);

    if (!response.ok) {
        console.error(`[RecentStreams] Failed to fetch (status ${response.status})`);
        return [];
    }

    return response.json() as Promise<RecentStream[]>;
};
