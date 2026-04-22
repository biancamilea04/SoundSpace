"use client";

import { useEffect, useState, useRef } from "react";
import { fetchTopGenres } from "@/services/spotify/spotifyService";

interface UseTopGenresResult {
    genres: string[];
    isLoading: boolean;
}

export const useTopGenres = (): UseTopGenresResult => {
    const [genres, setGenres] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const hasFetched = useRef(false);

    useEffect(() => {
        if (hasFetched.current) return;
        hasFetched.current = true;

        const load = async () => {
            try {
                const data = await fetchTopGenres();
                setGenres(data);
            } catch (err) {
                console.error("[useTopGenres] Error fetching genres:", err);
            } finally {
                setIsLoading(false);
            }
        };

        load();
    }, []);

    return { genres, isLoading };
};
