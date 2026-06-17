"use client";

import { Suspense, useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Header from "@/components/global/Header/Header";
import MenuSidebar from "@/components/global/MenuSidebar/MenuSidebar";
import FriendSidebar from "@/components/global/FriendSidebar/FriendSidebar";
import { ProfileHeader } from "@/components/profile/ProfileHeader/ProfileHeader";
import { GenreTags } from "@/components/profile/GenreTags/GenreTags";
import { PostComposer } from "@/components/profile/PostComposer/PostComposer";
import { ProfileFeed } from "@/components/profile/ProfileFeed/ProfileFeed";
import { ProfileStatsView } from "@/components/profile/ProfileStatsView/ProfileStatsView";
import { FriendshipButton } from "@/components/profile/FriendshipButton/FriendshipButton";
import { FriendsModal } from "@/components/profile/FriendsModal/FriendsModal";
import { EventsModal } from "@/components/profile/EventsModal/EventsModal";
import { useUserProfile } from "@/hooks/UserProfile/useUserProfile";
import { useTopGenres } from "@/hooks/TopGenres/useTopGenres";
import { useFriendsList } from "@/hooks/Friendship/useFriendsList";
import { useUserEvents } from "@/hooks/Event/useUserEvents";
import { fetchUserProfile } from "@/services/user/userService";
import type { UserProfile } from "@/types/user";
import "./page.css";

type Tab = "posts" | "stats";

function ProfilePageContent() {
    const params = useParams<{ username: string }>();
    const username = decodeURIComponent(params.username);

    const { user, isLoading, error } = useUserProfile(username);
    const { genres, isLoading: genresLoading } = useTopGenres();
    const { friends, isLoading: friendsLoading, remove } = useFriendsList(user?.id);
    const { events: userEvents, isLoading: eventsLoading } = useUserEvents(user?.id);

    const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
    const [isOwnProfile, setIsOwnProfile] = useState(false);
    const [feedKey, setFeedKey] = useState(0);
    const [activeTab, setActiveTab] = useState<Tab>("posts");
    const [friendsModalOpen, setFriendsModalOpen] = useState(false);
    const [eventsModalOpen, setEventsModalOpen] = useState(false);

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
            <div className="page-wrapper">
                <Header title="Profile" />
                <div className="feed-container">
                    <MenuSidebar />
                    <div className="profile-layout-loading">
                        <div className="profile-layout-spinner" />
                    </div>
                </div>
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="page-wrapper">
                <Header title="Profile" />
                <div className="feed-container">
                    <MenuSidebar />
                    <div className="profile-layout-error">
                        <p>{error ?? "User not found"}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="page-wrapper">
            <Header title="Profile" />
            <div className="feed-container">
                <MenuSidebar />
                <div className="profile-layout-main">
                    <div className="profile-layout-center">
                        <div className="profile-shared-header">
                            <ProfileHeader
                                name={user.displayName}
                                avatarUrl={user.profileImageUrl}
                                followers={user.followers}
                                following={0}
                                playlists={0}
                                friends={friends.length}
                                onFriendsClick={() => setFriendsModalOpen(true)}
                                events={userEvents.length}
                                onEventsClick={() => setEventsModalOpen(true)}
                                action={currentUser && (
                                    <FriendshipButton
                                        currentUserId={currentUser.id}
                                        profileUserId={user.id}
                                    />
                                )}
                            />
                            <GenreTags tags={genres} isLoading={genresLoading} />
                            <nav className="profile-tab-nav">
                                <button
                                    className={`profile-tab-nav__btn${activeTab === "posts" ? " profile-tab-nav__btn--active" : ""}`}
                                    onClick={() => setActiveTab("posts")}
                                >
                                    Posts
                                </button>
                                <button
                                    className={`profile-tab-nav__btn${activeTab === "stats" ? " profile-tab-nav__btn--active" : ""}`}
                                    onClick={() => setActiveTab("stats")}
                                >
                                    Stats
                                </button>
                            </nav>
                        </div>

                        <div className="profile-tab-content">
                            {activeTab === "posts" ? (
                                <div className="posts-view">
                                    {isOwnProfile && (
                                        <PostComposer
                                            avatarUrl={user.profileImageUrl}
                                            username={user.displayName}
                                            onPostCreated={() => setFeedKey(k => k + 1)}
                                        />
                                    )}
                                    <ProfileFeed spotifyId={user.spotifyId} refreshKey={feedKey} />
                                </div>
                            ) : (
                                <ProfileStatsView username={username} />
                            )}
                        </div>
                    </div>

                    <div className="profile-layout-right">
                        <FriendSidebar />
                    </div>
                </div>
            </div>

            {friendsModalOpen && (
                <FriendsModal
                    friends={friends}
                    isLoading={friendsLoading}
                    isOwnProfile={isOwnProfile}
                    onClose={() => setFriendsModalOpen(false)}
                    onRemove={remove}
                />
            )}

            {eventsModalOpen && (
                <EventsModal
                    events={userEvents}
                    isLoading={eventsLoading}
                    onClose={() => setEventsModalOpen(false)}
                />
            )}
        </div>
    );
}

export default function ProfilePage() {
    return (
        <Suspense fallback={<div className="profile-loading-fallback">Loading...</div>}>
            <ProfilePageContent />
        </Suspense>
    );
}
