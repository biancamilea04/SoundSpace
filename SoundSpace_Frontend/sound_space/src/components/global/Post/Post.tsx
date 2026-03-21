import React from 'react';
import Image from 'next/image';
import { MoreHorizontal, Heart, MessageCircle, Share2 } from 'lucide-react';
import Song, { SongProps } from '../Song/Song';
import './Post.css';

interface PostUser {
    name: string;
    avatarUrl: string;
    isOnline?: boolean;
}

interface PostStats {
    likes: number;
    comments: number;
}

export interface PostProps {
    user: PostUser;
    timeAgo: string;
    content: string;
    song?: SongProps;
    stats: PostStats;
}

export const Post = ({ user, timeAgo, content, song, stats }: PostProps) => {
    return (
        <article className="post">
            <header className="post__header">
                <div className="post__user-info">
                    <div className="post__avatar-wrapper">
                        <Image
                            src={user.avatarUrl || "/icons/SoundSpaceIcon.png"}
                            alt={`${user.name} avatar`}
                            width={40}
                            height={40}
                            className="post__avatar"
                        />
                        {user.isOnline && <span className="post__online-indicator"></span>}
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

            <div className="post__content">
                <p className="post__text">{content}</p>
                {song && (
                    <div className="post__song-wrapper">
                        <Song {...song} />
                    </div>
                )}
            </div>

            <footer className="post__footer">
                <div className="post__actions-left">
                    <button className="post__action-btn post__action-btn--like">
                        <Heart size={16} />
                        <span>{stats.likes}</span>
                    </button>
                    <button className="post__action-btn post__action-btn--comment">
                        <MessageCircle size={16} />
                        <span>{stats.comments}</span>
                    </button>
                </div>
                <button className="post__action-btn post__action-btn--share">
                    <Share2 size={16} />
                </button>
            </footer>
        </article>
    );
};

export default Post;
