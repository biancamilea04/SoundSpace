"use client";

import { useEffect, useState } from "react";
import { RecentStream } from "@/types/recentStream";
import { fetchRecentStreams, fetchRecentStreamsByUsername } from "@/services/spotify/spotifyService";

interface UseRecentStreamsResult {
    streams: RecentStream[];
    isLoading: boolean;
}

export const useRecentStreams = (username?: string): UseRecentStreamsResult => {
    const [streams, setStreams] = useState<RecentStream[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        setStreams([]);

        const load = async () => {
            try {
                const data = username
                    ? await fetchRecentStreamsByUsername(username)
                    : await fetchRecentStreams();
                setStreams(data);
            } catch (err) {
                console.error("[useRecentStreams] Error fetching streams:", err);
            } finally {
                setIsLoading(false);
            }
        };

        load();
    }, [username]);

    return { streams, isLoading };
};
