"use client";

import { useEffect, useState } from "react";
import { TopTrack } from "@/types/topTrack";
import { fetchTopTracks, fetchTopTracksByUsername } from "@/services/spotify/spotifyService";

interface UseTopTracksResult {
    tracks: TopTrack[];
    isLoading: boolean;
}

export const useTopTracks = (username?: string): UseTopTracksResult => {
    const [tracks, setTracks] = useState<TopTrack[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        setTracks([]);

        const load = async () => {
            try {
                const data = username
                    ? await fetchTopTracksByUsername(username)
                    : await fetchTopTracks();
                setTracks(data);
            } catch (err) {
                console.error("[useTopTracks] Error fetching tracks:", err);
            } finally {
                setIsLoading(false);
            }
        };

        load();
    }, [username]);

    return { tracks, isLoading };
};
