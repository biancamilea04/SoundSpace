"use client";

import { useEffect, useState } from "react";
import { fetchTopGenres, fetchTopGenresByUsername } from "@/services/spotify/spotifyService";

interface UseTopGenresResult {
    genres: string[];
    isLoading: boolean;
}

export const useTopGenres = (username?: string): UseTopGenresResult => {
    const [genres, setGenres] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        setGenres([]);

        const load = async () => {
            try {
                const data = username
                    ? await fetchTopGenresByUsername(username)
                    : await fetchTopGenres();
                setGenres(data);
            } catch (err) {
                console.error("[useTopGenres] Error fetching genres:", err);
            } finally {
                setIsLoading(false);
            }
        };

        load();
    }, [username]);

    return { genres, isLoading };
};
