import React from 'react';
import { Heart, MessageCircle, Share2 } from 'lucide-react';
import type { PostStats } from '../Post.types';
import PostShareMenu from '../PostShareMenu/PostShareMenu';
import './PostFooter.css';

interface PostFooterProps {
    stats: PostStats;
    liked: boolean;
    showShareMenu: boolean;
    shareMenuRef: React.RefObject<HTMLDivElement | null>;
    onToggleLike: () => void;
    onToggleShareMenu: () => void;
    onShare: (platform: 'instagram' | 'facebook' | 'x') => void;
}

const PostFooter = ({
    stats,
    liked,
    showShareMenu,
    shareMenuRef,
    onToggleLike,
    onToggleShareMenu,
    onShare,
}: PostFooterProps) => {
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
                <button className="post__action-btn post__action-btn--comment">
                    <MessageCircle size={16} />
                    <span>{stats.comments}</span>
                </button>
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
