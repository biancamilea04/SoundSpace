"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Heart, MessageCircle, Share2 } from 'lucide-react';
import type { Comment } from '@/types/comment';
import CommentItem from '@/components/post/CommentItem/CommentItem';
import CommentInput from '@/components/post/CommentInput/CommentInput';
import MenuSidebar from '@/components/global/MenuSidebar/MenuSidebar';
import FriendSidebar from '@/components/global/FriendSidebar/FriendSidebar';
import Header from '@/components/global/Header/Header';
import './page.css';

const mockComments: Comment[] = [
    {
        id: '1',
        user: { name: 'Emily W.', avatarUrl: 'https://i.pravatar.cc/150?img=1' },
        text: 'This is such a vibe! Been listening on repeat all day 🎶',
        timeAgo: '2h ago',
    },
    {
        id: '2',
        user: { name: 'Marcus J.', avatarUrl: 'https://i.pravatar.cc/150?img=3' },
        text: 'The bridge in this song is unreal. Definitely adding to my playlist.',
        timeAgo: '1h ago',
    },
    {
        id: '3',
        user: { name: 'Olivia T.', avatarUrl: 'https://i.pravatar.cc/150?img=9' },
        text: "Anyone know if they're touring soon? Would love to see this live!",
        timeAgo: '45m ago',
    },
    {
        id: '4',
        user: { name: 'Jake P.', avatarUrl: 'https://i.pravatar.cc/150?img=8' },
        text: 'Production quality is insane on this one.',
        timeAgo: '30m ago',
    },
    {
        id: '5',
        user: { name: 'Nina S.', avatarUrl: 'https://i.pravatar.cc/150?img=16' },
        text: 'Shared this with all my friends. Pure fire 🔥',
        timeAgo: '15m ago',
    },
];

export default function PostPage() {
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(245);
    const [comments, setComments] = useState<Comment[]>(mockComments);

    const handleToggleLike = () => {
        setLiked((prev) => !prev);
        setLikeCount((prev) => (liked ? prev - 1 : prev + 1));
    };

    const handleAddComment = (text: string) => {
        const newComment: Comment = {
            id: String(Date.now()),
            user: { name: 'You', avatarUrl: 'https://i.pravatar.cc/150?img=7' },
            text,
            timeAgo: 'Just now',
        };
        setComments((prev) => [...prev, newComment]);
    };

    return (
        <div className="page-wrapper">
            <Header title="Post" />
            <div className="feed-container">
                <MenuSidebar />
                <div className="feed-main">
                    <div className="post-page">
                        <header className="post-page__header">
                            <Link href="/feed" className="post-page__back-btn" aria-label="Back to Feed">
                                <ArrowLeft size={20} />
                                <span>Back to Feed</span>
                            </Link>
                            <h1 className="post-page__title">Post</h1>
                            <div className="post-page__header-spacer" />
                        </header>

                        <main className="post-page__content">
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
                                        onClick={handleToggleLike}
                                        aria-pressed={liked}
                                        aria-label="Like post"
                                    >
                                        <Heart size={18} />
                                        <span>{likeCount}</span>
                                    </button>
                                    <button className="post-page__action-btn" aria-label="Comments">
                                        <MessageCircle size={18} />
                                        <span>{comments.length}</span>
                                    </button>
                                    <button className="post-page__action-btn" aria-label="Share post">
                                        <Share2 size={18} />
                                    </button>
                                </div>
                            </article>

                            <div className="post-page__divider" />

                            <section className="post-page__comments" aria-label="Comments">
                                <h3 className="post-page__comments-heading">
                                    Comments ({comments.length})
                                </h3>
                                <div className="post-page__comments-list">
                                    {comments.map((comment) => (
                                        <CommentItem key={comment.id} comment={comment} />
                                    ))}
                                </div>
                            </section>

                            <footer className="post-page__content-footer">
                                <CommentInput
                                    currentUserAvatar="https://i.pravatar.cc/150?img=7"
                                    onSubmit={handleAddComment}
                                />
                            </footer>
                        </main>
                    </div>
                </div>
                <FriendSidebar />
            </div>
        </div>
    );
}
