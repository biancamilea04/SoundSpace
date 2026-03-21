import { NowPlayingData } from "@/types/nowPlaying";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || "";

export const fetchNowPlaying = async (
    token: string
): Promise<NowPlayingData | null> => {
    const response = await fetch(`${BACKEND_URL}/api/Users/now-playing`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
    });

    if (response.status === 204) return null;

    if (!response.ok) {
        console.error(`[NowPlaying] Failed to fetch (status ${response.status})`);
        return null;
    }

    return response.json() as Promise<NowPlayingData>;
};
