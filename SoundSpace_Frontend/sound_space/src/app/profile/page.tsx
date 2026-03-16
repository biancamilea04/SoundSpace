"use client";

import { Suspense } from "react";
import Image from "next/image";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { NowPlaying } from "@/components/profile/NowPlaying";
import { SharePost } from "@/components/profile/SharePost";
import { useUserProfile } from "@/hooks/useUserProfile";
import "./page.css";

function ProfileContent() {
    const { user, isLoading, error } = useUserProfile();

    return (
        <div className="profile-container">
            {/* Navigation */}
            <nav className="profile-nav">
                <div className="profile-nav__brand">
                    <Image
                        src="/icons/SoundSpaceIcon.png"
                        alt="SoundSpace Logo"
                        width={36}
                        height={36}
                        className="profile-nav__logo"
                    />
                    <span className="profile-nav__title">
                        SoundSpace
                    </span>
                </div>
            </nav>

            {/* Profile Content */}
            <main className="profile-main">
                {/* Loading State */}
                {isLoading && (
                    <div className="profile-loading-wrapper">
                        <div className="profile-spinner" />
                    </div>
                )}

                {/* Error State */}
                {error && !isLoading && (
                    <div className="profile-error-wrapper">
                        <p className="profile-error-text">{error}</p>
                    </div>
                )}

                {/* Profile Data */}
                {user && !isLoading && (
                    <>
                        {/* Header */}
                        <ProfileHeader
                            name={user.displayName}
                            avatarUrl={user.profileImageUrl}
                            email={user.email}
                            country={user.country}
                            followers={user.followers}
                            following={0}
                            playlists={0}
                        />

                        {/* Divider */}
                        <div className="profile-divider" />

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
                    </>
                )}
            </main>
        </div>
    );
}


export default function ProfilePage() {
    return (
        <Suspense
            fallback={
                <div className="profile-suspense-fallback">
                    <div className="profile-spinner" />
                </div>
            }
        >
            <ProfileContent />
        </Suspense>
    );
}
