import React from 'react';
import Image from 'next/image';
import { Heart, MessageCircle, Share2 } from 'lucide-react';

interface SinglePostProps {
    liked: boolean;
    likeCount: number;
    commentCount: number;
    onToggleLike: () => void;
}

const SinglePost = ({ liked, likeCount, commentCount, onToggleLike }: SinglePostProps) => {
    return (
        <article className="post-page__post">
            <div className="post-page__post-header">
                <div className="post-page__post-user">
                    <div className="post-page__avatar-wrapper">
                        <Image
                            src="https://i.pravatar.cc/150?img=11"
                            alt="Alex R. avatar"
                            width={44}
                            height={44}
                            className="post-page__avatar"
                        />
                    </div>
                    <div className="post-page__post-meta">
                        <h2 className="post-page__username">Alex R.</h2>
                        <span className="post-page__time">3h ago</span>
                    </div>
                </div>
            </div>

            <div className="post-page__post-body">
                <p className="post-page__text">
                    Vibing to this new single! The production on this is absolutely insane. 🔥 🎧
                    Can&apos;t stop listening to it on repeat. Drop your thoughts below!
                </p>
                <div className="post-page__media-placeholder">
                    <Image
                        src="/icons/SoundSpaceIcon.png"
                        alt="Post media"
                        width={680}
                        height={380}
                        className="post-page__media-image"
                    />
                </div>
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
