"use client";

import { PostData } from "@/types/post";
import Post from "@/components/global/Post/Post";
import "./FeedPost.css";

const timeAgo = (dateStr: string): string => {
    const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
};

interface FeedPostProps {
    post: PostData;
}

export const FeedPost = ({ post }: FeedPostProps) => {
    const avatarFallback = `https://eu.ui-avatars.com/api/?name=${encodeURIComponent(post.displayName)}&size=250&background=1ed760&color=000`;

    return (
        <div className="feed-post">
            <Post
                user={{
                    name: post.displayName,
                    avatarUrl: post.profileImageUrl || avatarFallback,
                    isOnline: false,
                }}
                timeAgo={timeAgo(post.createdAt)}
                content={post.content}
                spotifyUri={post.spotifyUri ?? undefined}
                stats={{ likes: 0, comments: 0 }}
            />
        </div>
    );
};

export default FeedPost;
