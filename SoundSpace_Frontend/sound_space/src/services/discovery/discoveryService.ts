import { apiFetch } from '@/lib/apiClient';
import type { DiscoveryUserProfile } from '@/types/discovery';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || '';

interface SharedArtistDto {
    spotifyArtistId: string;
    name: string;
    imageUrl: string | null;
}

interface DiscoveryApiResponse {
    id: string;
    displayName: string;
    profileImageUrl: string | null;
    country: string | null;
    finalScore: number;
    sharedArtistCount: number;
    isListening: boolean;
    currentlyPlayingTitle: string | null;
    currentlyPlayingArtist: string | null;
    currentlyPlayingCoverUrl: string | null;
    sharedArtists: SharedArtistDto[];
    isCountryFallback: boolean;
}

const mapToDiscoveryProfile = (r: DiscoveryApiResponse): DiscoveryUserProfile => ({
    id:               r.id,
    name:             r.displayName,
    age:              0,
    handle:           r.displayName,
    imageUrl:         r.profileImageUrl ?? '',
    tagline:          r.country ?? '',
    genres:           [],
    matchPercentage:  Math.round(r.finalScore),
    commonSongsCount: r.sharedArtistCount,
    commonSongs:      r.sharedArtists.slice(0, 5).map(a => ({
                          id:            a.spotifyArtistId,
                          albumImageUrl: a.imageUrl ?? '',
                          title:         a.name,
                          artist:        a.name,
                      })),
    recentlyBumping:  r.isListening
                          ? {
                                title:         r.currentlyPlayingTitle  ?? '',
                                artist:        r.currentlyPlayingArtist ?? '',
                                albumImageUrl: r.currentlyPlayingCoverUrl ?? '',
                                isPlaying:     true,
                            }
                          : undefined,
    isCountryFallback: r.isCountryFallback,
});

export interface DiscoveryPanelArtist {
    id: string;
    name: string;
    imageUrl: string | null;
    spotifyUrl: string | null;
}

export interface DiscoveryPanelTrack {
    id: string;
    title: string;
    artist: string;
    coverUrl: string | null;
    spotifyUrl: string | null;
}

export interface DiscoveryPanelPost {
    id: string;
    content: string;
    spotifyName: string | null;
    spotifyCoverUrl: string | null;
    spotifyUri: string | null;
    createdAt: string;
}

export const fetchDiscoveryUserArtists = async (displayName: string): Promise<DiscoveryPanelArtist[]> => {
    const res = await apiFetch(`${BACKEND_URL}/api/users/${encodeURIComponent(displayName)}/top-artists`);
    if (!res.ok) return [];
    const data: unknown = await res.json();
    if (!Array.isArray(data)) return [];
    return (data as Record<string, unknown>[]).map((a) => ({
        id:         (a.spotifyArtistId as string) ?? '',
        name:       (a.name as string)            ?? '',
        imageUrl:   (a.imageUrl as string | null) ?? null,
        spotifyUrl: (a.spotifyUrl as string | null) ?? null,
    }));
};

export const fetchDiscoveryUserTracks = async (displayName: string): Promise<DiscoveryPanelTrack[]> => {
    const res = await apiFetch(`${BACKEND_URL}/api/users/${encodeURIComponent(displayName)}/top-tracks`);
    if (!res.ok) return [];
    const data: unknown = await res.json();
    if (!Array.isArray(data)) return [];
    return (data as Record<string, unknown>[]).map((t) => ({
        id:         (t.spotifyTrackId as string)    ?? '',
        title:      (t.title as string)             ?? '',
        artist:     (t.artistName as string)        ?? '',
        coverUrl:   (t.coverUrl as string | null)   ?? null,
        spotifyUrl: (t.spotifyUrl as string | null) ?? null,
    }));
};

export const fetchDiscoveryUserStreams = async (displayName: string): Promise<DiscoveryPanelTrack[]> => {
    const res = await apiFetch(`${BACKEND_URL}/api/users/${encodeURIComponent(displayName)}/recent-streams?limit=3`);
    if (!res.ok) return [];
    const data: unknown = await res.json();
    if (!Array.isArray(data)) return [];
    return (data as Record<string, unknown>[]).map((s) => ({
        id:         (s.spotifyTrackId as string)    ?? '',
        title:      (s.title as string)             ?? '',
        artist:     (s.artistName as string)        ?? '',
        coverUrl:   (s.coverUrl as string | null)   ?? null,
        spotifyUrl: (s.spotifyUrl as string | null) ?? null,
    }));
};

export const fetchDiscoveryUserPosts = async (userId: string): Promise<DiscoveryPanelPost[]> => {
    const res = await apiFetch(`${BACKEND_URL}/api/posts/user/${userId}`);
    if (!res.ok) return [];
    const data: unknown = await res.json();
    if (!Array.isArray(data)) return [];
    return (data as Record<string, unknown>[]).slice(0, 3).map((p) => ({
        id:              (p.id as string)                  ?? '',
        content:         (p.content as string)             ?? '',
        spotifyName:     (p.spotifyName as string | null)  ?? null,
        spotifyCoverUrl: (p.spotifyCoverUrl as string | null) ?? null,
        spotifyUri:      (p.spotifyUri as string | null)   ?? null,
        createdAt:       (p.createdAt as string)           ?? '',
    }));
};

export const updateUserLocation = async (
    latitude: number,
    longitude: number,
): Promise<void> => {
    const res = await apiFetch(`${BACKEND_URL}/api/users/location`, {
        method: 'PUT',
        body: JSON.stringify({ latitude, longitude }),
    });
    if (!res.ok) {
        throw new Error(`Failed to update location (${res.status})`);
    }
};

export const fetchDiscoveryFeed = async (
    page     = 1,
    pageSize = 20,
): Promise<DiscoveryUserProfile[]> => {
    const res = await apiFetch(
        `${BACKEND_URL}/api/users/discovery?page=${page}&pageSize=${pageSize}`,
    );
    if (!res.ok) {
        const body = await res.json().catch(() => ({})) as { message?: string };
        throw new Error(body.message ?? `discovery_error_${res.status}`);
    }
    const data: unknown = await res.json();
    if (!Array.isArray(data)) return [];
    return (data as DiscoveryApiResponse[]).map(mapToDiscoveryProfile);
};
