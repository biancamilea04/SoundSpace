"use client";

import { ProfileHeader } from "@/components/profile/ProfileHeader/ProfileHeader";
import { GenreTags } from "@/components/profile/GenreTags/GenreTags";
import { PostComposer } from "@/components/profile/PostComposer/PostComposer";
import { ProfileFeed } from "@/components/profile/ProfileFeed/ProfileFeed";
import { useUserProfile } from "@/hooks/UserProfile/useUserProfile";
import "./ProfileMainView.css";

const GENRE_TAGS = [
    "Synthwave", "Indie Rock", "Techno", "Alternative",
    "Hip-Hop", "Electronic", "R&B", "Pop",
];

export const ProfileMainView = () => {
    const { user, isLoading, error } = useUserProfile();

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

                    <PostComposer
                        avatarUrl={user.profileImageUrl}
                        onPost={(text) => console.log("Post:", text)}
                    />

                    <ProfileFeed />
                </>
            )}
        </div>
    );
};

export default ProfileMainView;
