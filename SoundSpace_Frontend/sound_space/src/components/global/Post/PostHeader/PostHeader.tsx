import React from 'react';
import Image from 'next/image';
import { Flag, MoreHorizontal } from 'lucide-react';
import type { PostUser } from '../Post.types';
import './PostHeader.css';

interface PostHeaderProps {
    user: PostUser;
    timeAgo: string;
    showOptionsMenu: boolean;
    optionsMenuRef: React.RefObject<HTMLDivElement | null>;
    onToggleOptionsMenu: () => void;
    onReportPost: () => void;
}

const PostHeader = ({
    user,
    timeAgo,
    showOptionsMenu,
    optionsMenuRef,
    onToggleOptionsMenu,
    onReportPost,
}: PostHeaderProps) => {
    return (
        <header className="post__header">
            <div className="post__user-info">
                <div className="post__avatar-wrapper">
                    <Image
                        src={user.avatarUrl || '/icons/SoundSpaceIcon.png'}
                        alt={`${user.name} avatar`}
                        width={40}
                        height={40}
                        className="post__avatar"
                    />
                </div>
                <div className="post__meta">
                    <h3 className="post__user-name">{user.name}</h3>
                    <span className="post__time">{timeAgo}</span>
                </div>
            </div>
            <div className="post__options-wrapper" ref={optionsMenuRef}>
                <button
                    className="post__options-btn"
                    aria-label="More options"
                    aria-expanded={showOptionsMenu}
                    onClick={onToggleOptionsMenu}
                >
                    <MoreHorizontal size={20} />
                </button>

                {showOptionsMenu && (
                    <div className="post__options-menu" role="menu" aria-label="Post options">
                        <button className="post__options-menu-item" onClick={onReportPost} role="menuitem">
                            <Flag size={14} />
                            <span>Report Post</span>
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
};

export default PostHeader;
