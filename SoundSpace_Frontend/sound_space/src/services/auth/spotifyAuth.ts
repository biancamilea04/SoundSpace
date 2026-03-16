
// The function to initialize Spotify authentication
export const initializeSpotifyAuth = async () => {
        const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || "https://localhost:7050";
        window.location.href = `${BACKEND_URL}/auth`;
};