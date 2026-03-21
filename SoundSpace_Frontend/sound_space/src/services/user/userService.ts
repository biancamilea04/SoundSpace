import { UserProfile } from "@/types/user";

const BACKEND_URL =
    process.env.NEXT_PUBLIC_BACKEND_API_URL || "";


export const fetchUserProfile = async (
    token: string
): Promise<UserProfile> => {
    const response = await fetch(`${BACKEND_URL}/api/Users/profile`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
    });

    if (response.status === 401) {
        throw new Error("UNAUTHORIZED");
    }

    if (!response.ok) {
        throw new Error(`Failed to fetch profile (status ${response.status})`);
    }

    const data = await response.json();

    return {
        displayName: data.displayName ?? "",
        profileImageUrl: data.profileImageUrl ?? "",
        email: data.email ?? "",
        country: data.country ?? "",
        followers: data.followers ?? 0,
    };
};
