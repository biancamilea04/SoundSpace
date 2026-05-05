import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Flag, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import type { PostUser } from '../Post.types';
import './PostHeader.css';

interface PostHeaderProps {
    user: PostUser;
    timeAgo: string;
    showOptionsMenu: boolean;
    optionsMenuRef: React.RefObject<HTMLDivElement | null>;
    onToggleOptionsMenu: () => void;
    onReportPost: () => void;
    isOwner?: boolean;
    onEditPost?: () => void;
    onDeletePost?: () => void;
}

const PostHeader = ({
    user,
    timeAgo,
    showOptionsMenu,
    optionsMenuRef,
    onToggleOptionsMenu,
    onReportPost,
    isOwner,
    onEditPost,
    onDeletePost,
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
                    <Link href={`/profile/${encodeURIComponent(user.name)}`} className="post__user-name-link">
                        <h3 className="post__user-name">{user.name}</h3>
                    </Link>
                    <span className="post__time">· {timeAgo}</span>
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
                        {isOwner && (
                            <button className="post__options-menu-item" onClick={onEditPost} role="menuitem">
                                <Pencil size={14} />
                                <span>Edit Post</span>
                            </button>
                        )}
                        {isOwner && (
                            <button className="post__options-menu-item post__options-menu-item--danger" onClick={onDeletePost} role="menuitem">
                                <Trash2 size={14} />
                                <span>Delete Post</span>
                            </button>
                        )}
                        <button className="post__options-menu-item post__options-menu-item--danger" onClick={onReportPost} role="menuitem">
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
