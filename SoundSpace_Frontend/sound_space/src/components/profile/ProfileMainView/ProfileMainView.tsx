"use client";

import { ProfileHeader } from "@/components/profile/ProfileHeader/ProfileHeader";
import { GenreTags } from "@/components/profile/GenreTags/GenreTags";
import { PostComposer } from "@/components/profile/PostComposer/PostComposer";
import { ProfileFeed } from "@/components/profile/ProfileFeed/ProfileFeed";
import { useUserProfile } from "@/hooks/UserProfile/useUserProfile";
import { fetchUserProfile } from "@/services/user/userService";
import { useEffect, useState } from "react";
import "./ProfileMainView.css";

const GENRE_TAGS = [
    "Synthwave", "Indie Rock", "Techno", "Alternative",
    "Hip-Hop", "Electronic", "R&B", "Pop",
];

interface ProfileMainViewProps {
    username?: string;
}

export const ProfileMainView = ({ username }: ProfileMainViewProps) => {
    const { user, isLoading, error } = useUserProfile(username);
    const [isOwnProfile, setIsOwnProfile] = useState(false);
    const [feedKey, setFeedKey] = useState(0);

    useEffect(() => {
        if (!user) return;

        const checkOwnership = async () => {
            try {
                const loggedInUser = await fetchUserProfile();
                setIsOwnProfile(loggedInUser.spotifyId === user.spotifyId);
            } catch {
                setIsOwnProfile(false);
            }
        };

        checkOwnership();
    }, [user]);

    if (isLoading) {
        return (
            <div className="profile-main-view">
                <div className="profile-main-view__loading">
                    <div className="profile-main-view__spinner" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="profile-main-view">
                <div className="profile-main-view__error">
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="profile-main-view">
            {user && (
                <>
                    <ProfileHeader
                        name={user.displayName}
                        avatarUrl={user.profileImageUrl}
                        email={user.email}
                        country={user.country}
                        followers={user.followers}
                        following={0}
                        playlists={0}
                    />

                    <GenreTags tags={GENRE_TAGS} />

                    {isOwnProfile && (
                        <PostComposer
                            avatarUrl={user.profileImageUrl}
                            username={user.displayName}
                            onPostCreated={() => setFeedKey((k) => k + 1)}
                        />
                    )}

                    <ProfileFeed spotifyId={user.spotifyId} refreshKey={feedKey} />
                </>
            )}
        </div>
    );
};

export default ProfileMainView;
