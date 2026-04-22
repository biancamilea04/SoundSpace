"use client";

import { useEffect, useRef } from "react";
import FeedPost from "@/components/global/FeedPost/FeedPost";
import { useProfileFeed } from "@/hooks/Post/useProfileFeed";
import "./ProfileFeed.css";

interface ProfileFeedProps {
    spotifyId: string;
    refreshKey?: number;
}

export const ProfileFeed = ({ spotifyId, refreshKey }: ProfileFeedProps) => {
    const { posts, isLoading, refresh } = useProfileFeed(spotifyId);

    const previousKey = useRef(refreshKey);

    useEffect(() => {
        if (refreshKey !== undefined && refreshKey !== previousKey.current) {
            previousKey.current = refreshKey;
            refresh();
        }
    }, [refreshKey, refresh]);

    if (isLoading && posts.length === 0) {
        return <p className="profile-feed__status">Loading posts...</p>;
    }

    if (posts.length === 0) {
        return <p className="profile-feed__status">No posts yet.</p>;
    }

    return (
        <div className="profile-feed">
            {posts.map((post) => (
                <FeedPost key={post.id} post={post} />
            ))}
        </div>
    );
};

export default ProfileFeed;
