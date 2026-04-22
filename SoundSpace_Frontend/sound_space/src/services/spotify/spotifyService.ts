"use client";

import { NowPlayingData } from '@/types/nowPlaying';
import { TopArtist } from '@/types/topArtist';
import { TopTrack } from '@/types/topTrack';
import { RecentStream } from '@/types/recentStream';
import { apiFetch } from '@/lib/apiClient';
import type { SpotifyMediaItem } from '@/types/spotify';

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

export const fetchTopGenres = async (): Promise<string[]> => {
    const response = await apiFetch(`${BACKEND_URL}/api/users/top-genres`);

    if (!response.ok) {
        console.error(`[TopGenres] Failed to fetch (status ${response.status})`);
        return [];
    }

    return response.json() as Promise<string[]>;
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

export const fetchRecentStreams = async (limit: number = 5): Promise<RecentStream[]> => {
    const response = await apiFetch(`${BACKEND_URL}/api/users/recent-streams?limit=${limit}`);

    if (!response.ok) {
        console.error(`[RecentStreams] Failed to fetch (status ${response.status})`);
        return [];
    }

    return response.json() as Promise<RecentStream[]>;
};
