"use client";

import { useState } from "react";
import { PostData } from "@/types/post";
import Post from "@/components/global/Post/Post";
import { EditPostModal } from "@/components/global/EditPostModal/EditPostModal";
import { DeletePostModal } from "@/components/global/DeletePostModal/DeletePostModal";
import { deletePost } from "@/services/post/postService";
import { useUserProfile } from "@/hooks/UserProfile/useUserProfile";
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
    onPostUpdated?: () => void;
    onPostDeleted?: (postId: string) => void;
}

export const FeedPost = ({ post, onPostUpdated, onPostDeleted }: FeedPostProps) => {
    const { user } = useUserProfile();
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const isOwner = !!user && post.userId === user.id;
    const avatarFallback = `https://eu.ui-avatars.com/api/?name=${encodeURIComponent(post.displayName)}&size=250&background=1ed760&color=000`;

    const handleDeletePost = async () => {
        if (isDeleting) {
            return;
        }

        setIsDeleting(true);

        try {
            await deletePost(post.id);
            setShowDeleteModal(false);
            onPostDeleted?.(post.id);
            onPostUpdated?.();
        } catch {
        } finally {
            setIsDeleting(false);
        }
    };

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
                isOwner={isOwner}
                onEditPost={() => setShowEditModal(true)}
                onDeletePost={() => setShowDeleteModal(true)}
            />

            {showEditModal && (
                <EditPostModal
                    postId={post.id}
                    initialContent={post.content}
                    initialSpotifyUri={post.spotifyUri ?? undefined}
                    onClose={() => setShowEditModal(false)}
                    onSaved={() => {
                        setShowEditModal(false);
                        onPostUpdated?.();
                    }}
                />
            )}

            {showDeleteModal && (
                <DeletePostModal
                    isDeleting={isDeleting}
                    onClose={() => setShowDeleteModal(false)}
                    onConfirm={handleDeletePost}
                />
            )}
        </div>
    );
};

export default FeedPost;
