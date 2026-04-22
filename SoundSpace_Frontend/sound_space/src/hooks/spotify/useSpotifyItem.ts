import { useState, useEffect } from 'react';
import { fetchSpotifyItem } from '@/services/spotify/spotifyService';
import type { SpotifyMediaItem } from '@/types/spotify';

export interface UseSpotifyItemResult {
    item: SpotifyMediaItem | null;
    isLoading: boolean;
}

export const useSpotifyItem = (uri: string | null): UseSpotifyItemResult => {
    const [item, setItem] = useState<SpotifyMediaItem | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!uri) {
            setItem(null);
            return;
        }

        let cancelled = false;

        const load = async () => {
            setIsLoading(true);
            try {
                const result = await fetchSpotifyItem(uri);
                if (!cancelled) setItem(result);
            } catch {
                if (!cancelled) setItem(null);
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        };

        load();

        return () => { cancelled = true; };
    }, [uri]);

    return { item, isLoading };
};
