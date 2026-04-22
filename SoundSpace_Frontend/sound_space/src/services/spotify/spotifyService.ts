import { NowPlayingData } from '@/types/nowPlaying';
import { apiFetch } from '@/lib/apiClient';
import type { SpotifyMediaItem } from '@/types/spotify';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || '';

export const fetchNowPlaying = async (): Promise<NowPlayingData | null> => {
    const response = await apiFetch(`${BACKEND_URL}/api/Users/now-playing`);

    if (response.status === 204) return null;

    if (!response.ok) {
        console.error(`[NowPlaying] Failed to fetch (status ${response.status})`);
        return null;
    }

    return response.json() as Promise<NowPlayingData>;
};

export const fetchSpotifyItem = async (uri: string): Promise<SpotifyMediaItem | null> => {
    try {
        const response = await apiFetch(
            `${BACKEND_URL}/api/Spotify/lookup?uri=${encodeURIComponent(uri)}`
        );
        if (!response.ok) return null;
        return response.json() as Promise<SpotifyMediaItem>;
    } catch {
        return null;
    }
};
