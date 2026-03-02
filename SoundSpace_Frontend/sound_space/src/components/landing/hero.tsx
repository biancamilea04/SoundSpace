"use client";
import {SpotifyButton} from "@/components/ui/SpotifyButton";

export const Hero = () => {
    return (
        <div className="max-w-2xl text-center">
            <h1>
                Your music
                <span>Your coummunity</span>
                <p>Connect with friends through music. Share playlists, discover new tracks, and see what everyone's listening to</p>
            </h1>
            <SpotifyButton/>
        </div>
    )
}

export default Hero;