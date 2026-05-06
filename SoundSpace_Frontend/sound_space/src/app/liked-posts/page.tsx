"use client";

import { useEffect, useState } from "react";
import Header from "@/components/global/Header/Header";
import MenuSidebar from "@/components/global/MenuSidebar/MenuSidebar";
import FriendSidebar from "@/components/global/FriendSidebar/FriendSidebar";
import FeedPost from "@/components/global/FeedPost/FeedPost";
import { fetchLikedPosts } from "@/services/post/likeService";
import type { PostData } from "@/types/post";

export default function LikedPostsPage() {
    const [posts, setPosts] = useState<PostData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchLikedPosts()
            .then(setPosts)
            .finally(() => setIsLoading(false));
    }, []);

    const removePost = (postId: string) => {
        setPosts((prev) => prev.filter((p) => p.id !== postId));
    };

    return (
        <div className="page-wrapper">
            <Header title="Liked Posts" />
            <div className="feed-container">
                <MenuSidebar />
                <div className="feed-main">
                    {isLoading && <p style={{ color: "var(--text-muted)", marginBottom: "16px" }}>Loading liked posts..</p>}

                    {!isLoading && posts.length === 0 && (
                        <p style={{ color: "var(--text-muted)", marginBottom: "16px" }}>No liked posts yet</p>
                    )}

                    {posts.map((post) => (
                        <FeedPost key={post.id} post={post} onPostDeleted={removePost} />
                    ))}
                </div>
                <FriendSidebar />
            </div>
        </div>
    );
}
