export const initializeSpotifyAuth = async () => {
        const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || "";
        window.location.href = `${BACKEND_URL}/auth`;
};