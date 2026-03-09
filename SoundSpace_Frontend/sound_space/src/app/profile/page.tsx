"use client";

import Image from "next/image";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { NowPlaying } from "@/components/profile/NowPlaying";
import { SharePost } from "@/components/profile/SharePost";

export default function ProfilePage() {
    return (
        <div className="min-h-screen text-white/90 font-sans selection:bg-[#1ed760] selection:text-black">
            {/* Navigation */}
            <nav className="flex items-center justify-between p-6 md:px-12 select-none w-full max-w-[1400px] mx-auto">
                <div className="flex items-center gap-3">
                    <Image
                        src="/icons/SoundSpaceIcon.png"
                        alt="SoundSpace Logo"
                        width={36}
                        height={36}
                        className="brightness-0 invert"
                    />
                    <span className="font-extrabold text-xl tracking-tight text-white">
                        SoundSpace
                    </span>
                </div>
            </nav>

            {/* Profile Content */}
            <main className="max-w-[800px] mx-auto px-6 pb-16 space-y-10">
                {/* Header */}
                <ProfileHeader
                    name="[TEST USER]"
                    followers={0}
                    following={0}
                    playlists={0}
                />

                {/* Divider */}
                <div className="border-t border-zinc-800/60" />

                {/* Now Playing */}
                <NowPlaying
                    songTitle="[TEST TITLE]"
                    artist="[TEST ARTIST]"
                    album="[TEST ALBUM]"
                    albumArtUrl="/icons/SoundSpaceIcon.png"
                    currentTime="00:00"
                    totalTime="99:99"
                    progress={53}
                    isPlaying={true}
                />

                {/* Share Post */}
                <SharePost
                    onPost={(text, song) => {
                        console.log("Post:", text, song);
                    }}
                />
            </main>
        </div>
    );
}
