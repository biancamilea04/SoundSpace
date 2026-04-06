"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { UserProfile } from "@/types/user";
import { fetchUserProfile } from "@/services/user/userService";

interface UseUserProfileResult {
    user: UserProfile | null;
    isLoading: boolean;
    error: string | null;
}

export const useUserProfile = (): UseUserProfileResult => {
    const router = useRouter();

    const [user, setUser] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const hasFetched = useRef(false);

    useEffect(() => {
        if (hasFetched.current) return;
        hasFetched.current = true;

        const init = async () => {
            try {
                const profile = await fetchUserProfile();
                setUser(profile);
            } catch (err) {
                const message =
                    err instanceof Error ? err.message : "An unexpected error occurred.";

                if (message === "UNAUTHORIZED") {
                    router.push("/landing");
                    return;
                }

                setError(message);
            } finally {
                setIsLoading(false);
            }
        };

        init();
    }, [router]);

    return { user, isLoading, error };
};

