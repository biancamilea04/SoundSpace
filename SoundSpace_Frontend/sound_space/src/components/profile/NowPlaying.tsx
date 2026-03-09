"use client";

import { Heart, Pause, Play } from "lucide-react";
import { useState } from "react";
import Image from "next/image";

interface NowPlayingProps {
    songTitle: string;
    artist: string;
    album: string;
    albumArtUrl: string;
    currentTime: string;
    totalTime: string;
    progress: number;
    isPlaying?: boolean;
}

export const NowPlaying = ({
    songTitle,
    artist,
    album,
    albumArtUrl,
    currentTime,
    totalTime,
    progress,
    isPlaying: initialPlaying = true,
}: NowPlayingProps) => {
    const [isPlaying, setIsPlaying] = useState(initialPlaying);
    const [isLiked, setIsLiked] = useState(false);

    return (
        <section>
            <h2 className="text-xs font-bold tracking-[0.2em] text-zinc-400 uppercase mb-4">
                Now Playing
            </h2>
            <div className="rounded-xl bg-[#181818] border border-zinc-800/60 p-5 md:p-6 shadow-lg">
                <div className="flex gap-4 md:gap-5">
                    {/* Album Art */}
                    <div className="shrink-0 w-[80px] h-[80px] md:w-[100px] md:h-[100px] rounded-lg overflow-hidden shadow-md bg-zinc-800">
                        <Image
                            src={albumArtUrl}
                            alt={`${album} album art`}
                            width={100}
                            height={100}
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {/* Song Info */}
                    <div className="flex-1 min-w-0">
                        <h3 className="text-lg md:text-xl font-bold text-white truncate">
                            {songTitle}
                        </h3>
                        <p className="text-sm text-zinc-400 mt-0.5 truncate">
                            {artist} · {album}
                        </p>

                        {/* Progress Bar */}
                        <div className="mt-4">
                            <div className="relative w-full h-1 bg-zinc-700 rounded-full overflow-hidden">
                                <div
                                    className="absolute left-0 top-0 h-full bg-[#1ed760] rounded-full transition-all duration-300"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            <div className="flex justify-between mt-1.5 text-[11px] text-zinc-500 font-medium">
                                <span>{currentTime}</span>
                                <span>{totalTime}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-3 mt-3">

                    {/* Play/Pause Button */}
                    <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="w-8 h-8 rounded-full bg-[#1ed760] hover:bg-[#1db954] text-black flex items-center justify-center transition-all hover:scale-105 shadow-[0_0_12px_rgba(30,215,96,0.3)]"
                        aria-label={isPlaying ? "Pause" : "Play"}
                    >
                        {isPlaying ? (
                            <Pause className="w-4 h-4 fill-black" />
                        ) : (
                            <Play className="w-4 h-4 fill-black ml-0.5" />
                        )}
                    </button>
                </div>
            </div>
        </section>
    );
};

export default NowPlaying;
