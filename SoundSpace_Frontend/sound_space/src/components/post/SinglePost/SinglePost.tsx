import React from 'react';
import Image from 'next/image';
import { Heart, MessageCircle, Share2 } from 'lucide-react';
import type { SelectedPostPayload } from '../../global/Post/Post.types';

interface SinglePostProps {
    post: SelectedPostPayload;
    liked: boolean;
    likeCount: number;
    commentCount: number;
    onToggleLike: () => void;
}

const SinglePost = ({ post, liked, likeCount, commentCount, onToggleLike }: SinglePostProps) => {
    return (
        <article className="post-page__post">
            <div className="post-page__post-header">
                <div className="post-page__post-user">
                    <div className="post-page__avatar-wrapper">
                        <Image
                            src={post.user.avatarUrl}
                            alt={`${post.user.name} avatar`}
                            width={44}
                            height={44}
                            className="post-page__avatar"
                        />
                    </div>
                    <div className="post-page__post-meta">
                        <h2 className="post-page__username">{post.user.name}</h2>
                        <span className="post-page__time">{post.timeAgo}</span>
                    </div>
                </div>
            </div>

            <div className="post-page__post-body">
                <p className="post-page__text">{post.content}</p>
                {post.song?.albumImageUrl && (
                    <div className="post-page__media-placeholder">
                        <Image
                            src={post.song.albumImageUrl}
                            alt={`${post.song.title} album art`}
                            width={680}
                            height={380}
                            className="post-page__media-image"
                        />
                    </div>
                )}
            </div>

            <div className="post-page__engagement">
                <button
                    className={`post-page__action-btn post-page__action-btn--like${liked ? ' post-page__action-btn--liked' : ''}`}
                    onClick={onToggleLike}
                    aria-pressed={liked}
                    aria-label="Like post"
                >
                    <Heart size={18} />
                    <span>{likeCount}</span>
                </button>
                <button className="post-page__action-btn" aria-label="Comments">
                    <MessageCircle size={18} />
                    <span>{commentCount}</span>
                </button>
                <button className="post-page__action-btn" aria-label="Share post">
                    <Share2 size={18} />
                </button>
            </div>
        </article>
    );
};

export default SinglePost;
