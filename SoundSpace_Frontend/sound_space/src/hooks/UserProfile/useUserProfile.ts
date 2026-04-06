"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { UserProfile } from "@/types/user";
import { fetchUserProfile } from "@/services/user/userService";

const TOKEN_KEY = "access_token";

interface UseUserProfileResult {
    user: UserProfile | null;
    isLoading: boolean;
    error: string | null;
}

const setCookie = ( name: string, value: string, days = 7 ) => {
    const maxAge = days * 60 * 60 * 1000;
    document.cookie = `${name}=${value}`;
}

const getCookie = (name: string) => {
    const cookie = document.cookie.split(';');
    return cookie.find((cookie) => cookie.trim().startsWith(`${name}=`))?.split('=')[1] || null;
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

                let token: string | null = null;

                if (urlToken) {
                    token = urlToken;
                    setCookie(TOKEN_KEY, urlToken);
                    hasProcessedToken.current = true;
                    router.replace("/profile", { scroll: false });
                    return;
                } else {
                    token = getCookie(TOKEN_KEY);
                }

                if (!token) {
                    if (hasProcessedToken.current) {
                        console.log("[Auth] Skipping — token was just processed");
                        return;
                    }
                    setError("Please log in");
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
