"use client";

import { useState, useEffect } from "react";
import { PostData } from "@/types/post";
import { fetchEventPosts } from "@/services/post/postService";
import { PostComposer } from "@/components/profile/PostComposer/PostComposer";
import FeedPost from "@/components/global/FeedPost/FeedPost";
import { useUserProfile } from "@/hooks/UserProfile/useUserProfile";
import "./EventPagePosts.css";

interface EventPagePostsProps {
    eventId: string;
}

const EventPagePosts = ({ eventId }: EventPagePostsProps) => {
    const { user } = useUserProfile();
    const [posts, setPosts] = useState<PostData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        setIsLoading(true);
        fetchEventPosts(eventId)
            .then((data) => { if (!cancelled) setPosts(data); })
            .catch(() => {})
            .finally(() => { if (!cancelled) setIsLoading(false); });
        return () => { cancelled = true; };
    }, [eventId]);

    const handlePostCreated = (post?: PostData) => {
        if (post) setPosts((prev) => [post, ...prev]);
    };

    const handlePostDeleted = (id: string) => {
        setPosts((prev) => prev.filter((p) => p.id !== id));
    };

    return (
        <div className="epp">
            <PostComposer
                avatarUrl={user?.profileImageUrl ?? undefined}
                username={user?.displayName}
                eventId={eventId}
                onPostCreated={handlePostCreated}
            />

            <div className="epp__feed">
                {isLoading && <p className="epp__empty">Loading posts…</p>}
                {!isLoading && posts.length === 0 && (
                    <p className="epp__empty">No posts</p>
                )}
                {posts.map((post) => (
                    <FeedPost
                        key={post.id}
                        post={post}
                        onPostDeleted={handlePostDeleted}
                    />
                ))}
            </div>
        </div>
    );
};

export default EventPagePosts;
