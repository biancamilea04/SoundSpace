const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || '';

export const validateToken = async (token: string): Promise<boolean> => {
    try {
        const response = await fetch(`${BACKEND_URL}/api/Auth/validate-token`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        return response.ok;
    } catch (error) {
        console.error('[Auth] Token validation failed:', error);
        return false;
    }
};

export const refreshAccessToken = async (): Promise<string | null> => {
    try {
        const res = await fetch('/api/auth/token-refresh', { method: 'POST' });
        if (!res.ok) return null;

        const newToken = getAccessTokenCookie();
        return newToken;
    } catch (error) {
        console.error('[Auth] Token refresh failed:', error);
        return null;
    }
};

export const getAccessTokenCookie = (): string | null => {
    if (typeof document === 'undefined') return null;
    const match = document.cookie
        .split('; ')
        .find((c) => c.startsWith('access_token='));
    return match ? match.split('=')[1] : null;
};

export const clearAuthCookies = () => {
    document.cookie = 'access_token=; Max-Age=0; path=/';
};
