"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button/button";
import { initializeSpotifyAuth } from "@/services/auth/spotifyAuth";
import Image from "next/image";
import "./SpotifyButton.css";

export const SpotifyButton = ({ onClick }: { onClick?: () => void }) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async () => {
        setIsLoading(true);
        if (onClick) onClick();
        try {
            await initializeSpotifyAuth();
        } catch (error) {
            console.error("Error during Spotify authentication:", error);
            setIsLoading(false);
        }
    };

    const classes = `spotify-button${isLoading ? " loading" : ""}`;

    return (
        <Button
            size="xl"
            onClick={handleLogin}
            className={classes}
            disabled={isLoading}
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