const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || '';

export const refreshAccessToken = async (): Promise<string | null> => {
    try {
        const res = await fetch('/api/auth/token-refresh', { method: 'POST' });
        if (!res.ok) return null;

        return getAccessTokenCookie();
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

const clearAuthCookies = () => {
    document.cookie.split(";").forEach(function(c) { document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); });

};

export const logoutUser = async () => {
    try{
        await fetch(`/api/auth/logout`, { method: 'POST' });
        clearAuthCookies();
        window.location.href = '/landing';
    } catch (error) {
        console.error('[Auth] Token logout failed:', error);
    }
}
