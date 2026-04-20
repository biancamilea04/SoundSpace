"use client";

import { useEffect, useState, useRef } from "react";
import { TopTrack } from "@/types/topTrack";
import { fetchTopTracks } from "@/services/spotify/spotifyService";

interface UseTopTracksResult {
    tracks: TopTrack[];
    isLoading: boolean;
}

export const useTopTracks = (): UseTopTracksResult => {
    const [tracks, setTracks] = useState<TopTrack[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const hasFetched = useRef(false);

    useEffect(() => {
        if (hasFetched.current) return;
        hasFetched.current = true;

        const init = async () => {
            try {
                const data = await fetchTopTracks();
                setTracks(data);
            } catch (err) {
                console.error("[useTopTracks] Error fetching top tracks:", err);
            } finally {
                setIsLoading(false);
            }
        };

        init();
    }, []);

    return { tracks, isLoading };
};
