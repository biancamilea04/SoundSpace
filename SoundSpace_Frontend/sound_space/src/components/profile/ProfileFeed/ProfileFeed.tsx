"use client";

import FeedPost from "@/components/global/FeedPost/FeedPost";
import { useProfileFeed } from "@/hooks/Post/useProfileFeed";
import "./ProfileFeed.css";

interface ProfileFeedProps {
    spotifyId: string;
    refreshKey?: number;
}

export const ProfileFeed = ({ spotifyId, refreshKey }: ProfileFeedProps) => {
    const { posts, isLoading } = useProfileFeed(spotifyId);

    if (isLoading) {
        return <p style={{ color: "var(--text-muted)" }}>Loading posts...</p>;
    }

    if (posts.length === 0) {
        return <p style={{ color: "var(--text-muted)" }}>No posts yet.</p>;
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
