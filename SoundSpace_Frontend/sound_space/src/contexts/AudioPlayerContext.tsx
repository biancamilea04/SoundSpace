"use client";

import React, {
    createContext,
    useCallback,
    useContext,
    useRef,
    useState,
} from "react";

interface AudioPlayerContextValue {
    playingPostId: string | null;
    audioRef: React.RefObject<HTMLAudioElement | null>;
    startPlaying: (postId: string, previewUrl: string) => void;
    stopPlaying: () => void;
}

const AudioPlayerContext = createContext<AudioPlayerContextValue>({
    playingPostId: null,
    audioRef: { current: null },
    startPlaying: () => {},
    stopPlaying: () => {},
});

export const AudioPlayerProvider = ({ children }: { children: React.ReactNode }) => {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [playingPostId, setPlayingPostId] = useState<string | null>(null);

    const stopPlaying = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.src = "";
            audioRef.current = null;
        }
        setPlayingPostId(null);
    }, []);

    const startPlaying = useCallback(
        (postId: string, previewUrl: string) => {
            // Clicking the active post toggles it off
            if (playingPostId === postId) {
                stopPlaying();
                return;
            }

            // Stop whatever was playing before
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.src = "";
            }

            const audio = new Audio(previewUrl);
            audioRef.current = audio;
            setPlayingPostId(postId);

            audio.play().catch(() => {});

            audio.addEventListener("ended", () => {
                audioRef.current = null;
                setPlayingPostId(null);
            });
        },
        [playingPostId, stopPlaying],
    );

    return (
        <AudioPlayerContext.Provider value={{ playingPostId, audioRef, startPlaying, stopPlaying }}>
            {children}
        </AudioPlayerContext.Provider>
    );
};

export const useAudioPlayer = () => useContext(AudioPlayerContext);
