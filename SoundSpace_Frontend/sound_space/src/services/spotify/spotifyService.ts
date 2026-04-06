import { NowPlayingData } from '@/types/nowPlaying';
import { apiFetch } from '@/lib/apiClient';

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
