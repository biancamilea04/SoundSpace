"use client";

import { Users, Heart, Music } from "lucide-react";

interface ProfileHeaderProps {
    name: string;
    isPremium?: boolean;
    followers: number;
    following: number;
    playlists: number;
    avatarUrl?: string;
}

export const ProfileHeader = ({
    name,
    isPremium = false,
    followers,
    following,
    playlists,
    avatarUrl,
}: ProfileHeaderProps) => {
    return (
        <div className="flex items-start gap-6 md:gap-8">
            {/* Avatar */}
            <div className="relative shrink-0">
                <div className="absolute inset-0 bg-[#1ed760]/20 blur-2xl rounded-full scale-110" />
                <div className="relative w-20 h-20 md:w-28 md:h-28 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 flex items-center justify-center border-2 border-zinc-700 overflow-hidden shadow-xl">
                    {avatarUrl ? (
                        <img
                            src={avatarUrl}
                            alt={name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <svg
                            viewBox="0 0 64 64"
                            className="w-12 h-12 md:w-16 md:h-16 text-zinc-400"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <path d="M16 52c0-8 6-14 16-14s16 6 16 14" strokeLinecap="round" />
                            <circle cx="32" cy="22" r="10" />
                            <path d="M20 18c0-8 5-14 12-14s12 6 12 14" strokeLinecap="round" />
                            <path d="M18 18 C18 18 14 20 14 18 C14 12 16 8 18 8" strokeLinecap="round" />
                            <path d="M46 18 C46 18 50 20 50 18 C50 12 48 8 46 8" strokeLinecap="round" />
                        </svg>
                    )}
                </div>
            </div>

            {/* Info */}
            <div className="flex flex-col gap-2 pt-2">
                {isPremium && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#1ed760]/15 border border-[#1ed760]/30 text-[#1ed760] text-xs font-semibold tracking-wide w-fit">
                        <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="currentColor">
                            <path d="M8 1l2 5h5l-4 3.5 1.5 5L8 11.5 3.5 14.5 5 9.5 1 6h5z" />
                        </svg>
                        Premium
                    </span>
                )}
                <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white leading-none">
                    {name}
                </h1>
                <div className="flex items-center gap-4 text-sm text-zinc-400 mt-1">
                    <span className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5" />
                        <strong className="text-zinc-200">{followers.toLocaleString()}</strong> followers
                    </span>
                    <span className="flex items-center gap-1.5">
                        <Heart className="w-3.5 h-3.5" />
                        <strong className="text-zinc-200">{following.toLocaleString()}</strong> following
                    </span>
                    <span className="flex items-center gap-1.5">
                        <Music className="w-3.5 h-3.5" />
                        <strong className="text-zinc-200">{playlists}</strong> playlists
                    </span>
                </div>
            </div>
        </div>
    );
};

export default ProfileHeader;
