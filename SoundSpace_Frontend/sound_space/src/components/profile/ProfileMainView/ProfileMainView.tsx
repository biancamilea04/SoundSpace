"use client";

import { ProfileHeader } from "@/components/profile/ProfileHeader/ProfileHeader";
import { GenreTags } from "@/components/profile/GenreTags/GenreTags";
import { PostComposer } from "@/components/profile/PostComposer/PostComposer";
import { ProfileFeed } from "@/components/profile/ProfileFeed/ProfileFeed";
import { FriendshipButton } from "@/components/profile/FriendshipButton/FriendshipButton";
import { useUserProfile } from "@/hooks/UserProfile/useUserProfile";
import { useTopGenres } from "@/hooks/TopGenres/useTopGenres";
import { fetchUserProfile } from "@/services/user/userService";
import { useEffect, useState } from "react";
import type { UserProfile } from "@/types/user";
import "./ProfileMainView.css";

interface ProfileMainViewProps {
    username?: string;
}

export const ProfileMainView = ({ username }: ProfileMainViewProps) => {
    const { user, isLoading, error } = useUserProfile(username);
    const { genres, isLoading: genresLoading } = useTopGenres();
    const [isOwnProfile, setIsOwnProfile] = useState(false);
    const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
    const [feedKey, setFeedKey] = useState(0);

    useEffect(() => {
        if (!user) return;

        const checkOwnership = async () => {
            try {
                const loggedInUser = await fetchUserProfile();
                setCurrentUser(loggedInUser);
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
                        followers={user.followers}
                        following={0}
                        playlists={0}
                        action={currentUser && (
                            <FriendshipButton
                                currentUserId={currentUser.id}
                                profileUserId={user.id}
                            />
                        )}
                    />

                    <GenreTags tags={genres} isLoading={genresLoading} />

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
