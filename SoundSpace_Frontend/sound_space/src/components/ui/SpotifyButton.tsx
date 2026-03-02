// components/SpotifyButton.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { initializeSpotifyAuth } from "@/services/auth/spotifyAuth";
import Image from "next/image";

export const SpotifyButton = ({ onClick }: { onClick?: () => void }) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async () => {
        setIsLoading(true);
        if (onClick) onClick();
        try {
            await initializeSpotifyAuth();
            // The service naturally redirects, no need for data return
        } catch (error) {
            console.error("Error during Spotify authentication:", error);
            setIsLoading(false);
        }
    };

    return (
        <Button
            size="xl"
            onClick={handleLogin}
            className="gap-3 rounded-full font-bold bg-[#1ed760] hover:bg-[#1db954] text-black text-[1.1rem] px-8 py-7 shadow-[0_0_20px_rgba(30,215,96,0.3)] hover:shadow-[0_0_25px_rgba(30,215,96,0.5)] transition-all"
        >
            <Image
                src="/icons/spotify.png"
                alt="Spotify Logo"
                width={20}
                height={20}
            />
            Login with Spotify
        </Button>
    );
};