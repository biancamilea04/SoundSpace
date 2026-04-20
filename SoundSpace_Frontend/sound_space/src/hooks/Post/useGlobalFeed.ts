"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { PostData } from "@/types/post";
import { fetchAllPosts } from "@/services/post/postService";

interface UseGlobalFeedResult {
    posts: PostData[];
    isLoading: boolean;
    error: string | null;
    refresh: () => void;
}

export const useGlobalFeed = (): UseGlobalFeedResult => {
    const [posts, setPosts] = useState<PostData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const hasFetched = useRef(false);

    const load = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await fetchAllPosts();
            setPosts(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load feed");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (hasFetched.current) return;
        hasFetched.current = true;
        load();
    }, [load]);

    const refresh = useCallback(() => {
        hasFetched.current = false;
        load();
    }, [load]);

    return { posts, isLoading, error, refresh };
};
