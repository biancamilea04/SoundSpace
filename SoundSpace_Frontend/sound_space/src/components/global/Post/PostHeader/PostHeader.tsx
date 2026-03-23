import React from 'react';
import Image from 'next/image';
import { MoreHorizontal } from 'lucide-react';
import type { PostUser } from '../Post.types';
import './PostHeader.css';

interface PostHeaderProps {
    user: PostUser;
    timeAgo: string;
}

const PostHeader = ({ user, timeAgo }: PostHeaderProps) => {
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
            <button className="post__options-btn" aria-label="More options">
                <MoreHorizontal size={20} />
            </button>
        </header>
    );
};

export default PostHeader;
