import { UserProfile } from '@/types/user';
import { apiFetch } from '@/lib/apiClient';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || '';

const mapUserProfile = (data: Record<string, unknown>): UserProfile => ({
    id:              (data.id as string)              ?? '',
    spotifyId:       (data.spotifyId as string)       ?? '',
    displayName:     (data.displayName as string)     ?? '',
    profileImageUrl: (data.profileImageUrl as string) ?? '',
    email:           (data.email as string)           ?? '',
    country:         (data.country as string)         ?? '',
    followers:       (data.followers as number)       ?? 0,
});

export const fetchUserProfile = async (): Promise<UserProfile> => {
    const response = await apiFetch(`${BACKEND_URL}/api/users/profile`);

    if (response.status === 401) {
        throw new Error('UNAUTHORIZED');
    }

    if (!response.ok) {
        throw new Error(`Failed to fetch profile (status ${response.status})`);
    }

    const data = await response.json();
    return mapUserProfile(data);
};

export const fetchUserProfileByUsername = async (username: string): Promise<UserProfile> => {
    const response = await apiFetch(
        `${BACKEND_URL}/api/users/profile/${encodeURIComponent(username)}`
    );

    if (response.status === 401) {
        throw new Error('UNAUTHORIZED');
    }

    if (response.status === 404) {
        throw new Error('USER_NOT_FOUND');
    }

    if (!response.ok) {
        throw new Error(`Failed to fetch profile (status ${response.status})`);
    }

    const data = await response.json();
    return mapUserProfile(data);
};
