
// The function to initialize Spotify authentication
export const initializeSpotifyAuth = async () => {
        const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:8000";
        window.location.href = `${BACKEND_URL}/auth`;
};