"use client";

import { useEffect, useState, useRef } from "react";
import { RecentStream } from "@/types/recentStream";
import { fetchRecentStreams } from "@/services/spotify/spotifyService";

interface UseRecentStreamsResult {
    streams: RecentStream[];
    isLoading: boolean;
}

export const useRecentStreams = (): UseRecentStreamsResult => {
    const [streams, setStreams] = useState<RecentStream[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const hasFetched = useRef(false);

    useEffect(() => {
        if (hasFetched.current) return;
        hasFetched.current = true;

        const load = async () => {
            try {
                const data = await fetchRecentStreams();
                setStreams(data);
            } catch (err) {
                console.error("[useRecentStreams] Error fetching streams:", err);
            } finally {
                setIsLoading(false);
            }
        };

        load();
    }, []);

    return { streams, isLoading };
};
