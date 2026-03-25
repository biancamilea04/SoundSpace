import React from 'react';
import Link from 'next/link';
import { Heart, MessageCircle, Share2 } from 'lucide-react';
import type { PostStats, SelectedPostPayload } from '../Post.types';
import PostShareMenu from '../PostShareMenu/PostShareMenu';
import './PostFooter.css';

interface PostFooterProps {
    stats: PostStats;
    postData: SelectedPostPayload;
    liked: boolean;
    showShareMenu: boolean;
    shareMenuRef: React.RefObject<HTMLDivElement | null>;
    onToggleLike: () => void;
    onToggleShareMenu: () => void;
    onShare: (platform: 'instagram' | 'facebook' | 'x') => void;
}

const PostFooter = ({
    stats,
    postData,
    liked,
    showShareMenu,
    shareMenuRef,
    onToggleLike,
    onToggleShareMenu,
    onShare,
}: PostFooterProps) => {
    const handleOpenPost = () => {
        if (typeof window === 'undefined') {
            return;
        }

        window.sessionStorage.setItem('selectedPost', JSON.stringify(postData));
    };

    return (
        <footer className="post__footer">
            <div className="post__actions-left">
                <button
                    className={`post__action-btn post__action-btn--like${liked ? ' post__action-btn--liked' : ''}`}
                    onClick={onToggleLike}
                    aria-pressed={liked}
                >
                    <Heart size={16} />
                    <span>{stats.likes}</span>
                </button>
                <Link
                    href="/post"
                    className="post__action-btn post__action-btn--comment"
                    aria-label="Open post details"
                    onClick={handleOpenPost}
                >
                    <MessageCircle size={16} />
                    <span>{stats.comments}</span>
                </Link>
            </div>
            <div className="post__share-wrapper" ref={shareMenuRef}>
                <button
                    className="post__action-btn post__action-btn--share"
                    onClick={onToggleShareMenu}
                    aria-label="Share post"
                    aria-expanded={showShareMenu}
                >
                    <Share2 size={16} />
                </button>

                {showShareMenu && <PostShareMenu onShare={onShare} />}
            </div>
        </footer>
    );
};

export default PostFooter;
