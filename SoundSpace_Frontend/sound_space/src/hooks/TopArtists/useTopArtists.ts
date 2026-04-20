"use client";

import { useEffect, useState, useRef } from "react";
import { TopArtist } from "@/types/topArtist";
import { fetchTopArtists } from "@/services/spotify/spotifyService";

interface UseTopArtistsResult {
    artists: TopArtist[];
    isLoading: boolean;
}

export const useTopArtists = (): UseTopArtistsResult => {
    const [artists, setArtists] = useState<TopArtist[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const hasFetched = useRef(false);

    useEffect(() => {
        if (hasFetched.current) return;
        hasFetched.current = true;

        const init = async () => {
            try {
                const data = await fetchTopArtists();
                setArtists(data);
            } catch (err) {
                console.error("[useTopArtists] Error fetching top artists:", err);
            } finally {
                setIsLoading(false);
            }
        };

        init();
    }, []);

    return { artists, isLoading };
};
