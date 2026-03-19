"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { UserProfile } from "@/types/user";
import { fetchUserProfile } from "@/services/user/userService";

const TOKEN_KEY = "auth_token";

interface UseUserProfileResult {
    user: UserProfile | null;
    isLoading: boolean;
    error: string | null;
}

export const useUserProfile = (): UseUserProfileResult => {
    const searchParams = useSearchParams();
    const router = useRouter();

    const [user, setUser] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const hasProcessedToken = useRef(false);

    useEffect(() => {
        const init = async () => {
            try {
                const urlToken = searchParams.get("token");
                console.log("[Auth] URL token present:", !!urlToken);

                let token: string | null = null;

                if (urlToken) {
                    token = urlToken;
                    localStorage.setItem(TOKEN_KEY, token);
                    hasProcessedToken.current = true;
                    console.log("[Auth] Token saved to localStorage");
                    router.replace("/profile", { scroll: false });
                } else {
                    token = localStorage.getItem(TOKEN_KEY);
                    console.log("[Auth] Token from localStorage:", !!token);
                }

                if (!token) {
                    if (hasProcessedToken.current) {
                        console.log("[Auth] Skipping — token was just processed");
                        return;
                    }
                    setError("No authentication token found. Please log in.");
                    setIsLoading(false);
                    return;
                }

                const profile = await fetchUserProfile(token);
                setUser(profile);
            } catch (err) {
                const message =
                    err instanceof Error ? err.message : "An unexpected error occurred.";

                setError(message);
            } finally {
                setIsLoading(false);
            }
        };

        init();
    }, [searchParams, router]);

    return { user, isLoading, error };
};
