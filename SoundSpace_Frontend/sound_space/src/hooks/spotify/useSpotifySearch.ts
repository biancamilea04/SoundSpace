import { useState, useEffect, useRef } from 'react';
import { apiFetch } from '@/lib/apiClient';
import type { SpotifyMediaItem, SpotifyMediaType } from '@/types/spotify';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || '';

export interface UseSpotifySearchResult {
    query: string;
    setQuery: (q: string) => void;
    results: SpotifyMediaItem[];
    recentItems: SpotifyMediaItem[];
    isLoading: boolean;
    isLoadingRecent: boolean;
    error: 'rate-limited' | 'generic' | null;
}

export const useSpotifySearch = (type: SpotifyMediaType): UseSpotifySearchResult => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SpotifyMediaItem[]>([]);
    const [recentItems, setRecentItems] = useState<SpotifyMediaItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingRecent, setIsLoadingRecent] = useState(true);
    const [error, setError] = useState<'rate-limited' | 'generic' | null>(null);
    const isMountedRef = useRef(true);

    useEffect(() => {
        isMountedRef.current = true;
        setRecentItems([]);
        setError(null);
        const fetchRecent = async () => {
            setIsLoadingRecent(true);
            try {
                const res = await apiFetch(`${BACKEND_URL}/api/Spotify/recently-played?type=${type}`);
                if (!isMountedRef.current) return;
                if (res.status === 429) { setError('rate-limited'); return; }
                if (!res.ok) { setError('generic'); return; }
                const data: SpotifyMediaItem[] = await res.json();
                if (isMountedRef.current) setRecentItems(data);
            } catch {
                if (isMountedRef.current) setError('generic');
            } finally {
                if (isMountedRef.current) setIsLoadingRecent(false);
            }
        };
        fetchRecent();
        return () => { isMountedRef.current = false; };
    }, [type]);

    useEffect(() => {
        if (!query.trim()) {
            setResults([]);
            setError(null);
            return;
        }
        const timerId = setTimeout(async () => {
            setIsLoading(true);
            setError(null);
            try {
                const res = await apiFetch(
                    `${BACKEND_URL}/api/Spotify/search?q=${encodeURIComponent(query)}`
                );
                if (!isMountedRef.current) return;
                if (res.status === 429) { setError('rate-limited'); return; }
                if (!res.ok) { setError('generic'); return; }
                const data: SpotifyMediaItem[] = await res.json();
                if (isMountedRef.current) setResults(data.filter(item => item.type === type));
            } catch {
                if (isMountedRef.current) setError('generic');
            } finally {
                if (isMountedRef.current) setIsLoading(false);
            }
        }, 500);
        return () => clearTimeout(timerId);
    }, [query, type]);

    return { query, setQuery, results, recentItems, isLoading, isLoadingRecent, error };
};
