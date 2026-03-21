const BACKEND_URL =
    process.env.NEXT_PUBLIC_BACKEND_API_URL || "";

export const validateToken = async (token: string): Promise<boolean> => {
    try {
        const response = await fetch(`${BACKEND_URL}/api/Auth/validate-token`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        return response.ok;
    } catch (error) {
        console.error("[Auth] Token validation failed:", error);
        return false;
    }
};
