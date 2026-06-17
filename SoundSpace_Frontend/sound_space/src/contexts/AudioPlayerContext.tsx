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
    startPlaying: (postId: string, previewUrl: string, startTime?: number, snippetDuration?: number) => void;
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
        (postId: string, previewUrl: string, startTime?: number, snippetDuration?: number) => {
            if (playingPostId === postId) {
                stopPlaying();
                return;
            }

            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.src = "";
            }

            const audio = new Audio(previewUrl);
            audioRef.current = audio;
            setPlayingPostId(postId);

            if (startTime != null && startTime > 0) {
                audio.currentTime = startTime;
            }

            audio.play().catch(() => {});

            if (snippetDuration != null) {
                const stopAt = (startTime ?? 0) + snippetDuration;
                const onTimeUpdate = () => {
                    if (audio.currentTime >= stopAt) {
                        audio.pause();
                        audio.removeEventListener("timeupdate", onTimeUpdate);
                        audioRef.current = null;
                        setPlayingPostId(null);
                    }
                };
                audio.addEventListener("timeupdate", onTimeUpdate);
            }

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
