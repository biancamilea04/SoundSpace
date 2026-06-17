import { apiFetch } from '@/lib/apiClient';

export interface ArtistSearchResult {
    name: string;
    spotifyId: string | null;
    imageUrl: string | null;
    spotifyUrl: string | null;
    genres: string[];
}

const BASE = `${process.env.NEXT_PUBLIC_BACKEND_API_URL ?? ''}/api/artists`;

export const searchArtists = async (query: string): Promise<ArtistSearchResult[]> => {
    if (!query || query.trim().length < 2) return [];
    const res = await apiFetch(`${BASE}/search?q=${encodeURIComponent(query.trim())}`);
    if (!res.ok) return [];
    return res.json() as Promise<ArtistSearchResult[]>;
};
