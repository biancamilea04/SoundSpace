"use client";

import { useEffect, useState } from "react";
import { TopArtist } from "@/types/topArtist";
import { fetchTopArtists, fetchTopArtistsByUsername } from "@/services/spotify/spotifyService";

interface UseTopArtistsResult {
    artists: TopArtist[];
    isLoading: boolean;
}

export const useTopArtists = (username?: string): UseTopArtistsResult => {
    const [artists, setArtists] = useState<TopArtist[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        setArtists([]);

        const load = async () => {
            try {
                const data = username
                    ? await fetchTopArtistsByUsername(username)
                    : await fetchTopArtists();
                setArtists(data);
            } catch (err) {
                console.error("[useTopArtists] Error fetching artists:", err);
            } finally {
                setIsLoading(false);
            }
        };

        load();
    }, [username]);

    return { artists, isLoading };
};
