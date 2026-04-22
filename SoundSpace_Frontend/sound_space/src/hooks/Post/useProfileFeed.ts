"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { PostData } from "@/types/post";
import { fetchPostsBySpotifyId } from "@/services/post/postService";

interface UseProfileFeedResult {
    posts: PostData[];
    isLoading: boolean;
    error: string | null;
    refresh: () => void;
    removePost: (postId: string) => void;
}

export const useProfileFeed = (spotifyId: string | undefined): UseProfileFeedResult => {
    const [posts, setPosts] = useState<PostData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const hasFetched = useRef(false);

    useEffect(() => {
        hasFetched.current = false;
    }, [spotifyId]);

    const load = useCallback(async () => {
        if (!spotifyId) return;
        setIsLoading(true);
        setError(null);
        try {
            const data = await fetchPostsBySpotifyId(spotifyId);
            setPosts(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load posts");
        } finally {
            setIsLoading(false);
        }
    }, [spotifyId]);

    useEffect(() => {
        if (hasFetched.current || !spotifyId) return;
        hasFetched.current = true;
        load();
    }, [load, spotifyId]);

    const refresh = useCallback(() => {
        hasFetched.current = false;
        load();
    }, [load]);

    const removePost = useCallback((postId: string) => {
        setPosts((prev) => prev.filter((post) => post.id !== postId));
    }, []);

    return { posts, isLoading, error, refresh, removePost };
};
