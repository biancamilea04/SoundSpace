import { UserProfile } from '@/types/user';
import { apiFetch } from '@/lib/apiClient';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || '';

export const fetchUserProfile = async (): Promise<UserProfile> => {
    const response = await apiFetch(`${BACKEND_URL}/api/Users/profile`);

    if (response.status === 401) {
        throw new Error('UNAUTHORIZED');
    }

    if (!response.ok) {
        throw new Error(`Failed to fetch profile (status ${response.status})`);
    }

    const data = await response.json();

    return {
        displayName:     data.displayName     ?? '',
        profileImageUrl: data.profileImageUrl ?? '',
        email:           data.email           ?? '',
        country:         data.country         ?? '',
        followers:       data.followers       ?? 0,
    };
};
