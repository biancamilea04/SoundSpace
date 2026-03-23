"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import CommentInput from '@/components/post/CommentInput/CommentInput';
import MenuSidebar from '@/components/global/MenuSidebar/MenuSidebar';
import FriendSidebar from '@/components/global/FriendSidebar/FriendSidebar';
import Header from '@/components/global/Header/Header';
import SinglePost from '@/components/post/SinglePost/SinglePost';
import PostComments from '@/components/post/PostComments/PostComments';
import { useSinglePostPage } from '@/hooks/Post/useSinglePostPage';
import './page.css';

export default function PostPage() {
    const { liked, likeCount, comments, currentUserAvatar, handleToggleLike, handleAddComment } = useSinglePostPage();

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
                            <SinglePost
                                liked={liked}
                                likeCount={likeCount}
                                commentCount={comments.length}
                                onToggleLike={handleToggleLike}
                            />

                            <div className="post-page__divider" />

                            <PostComments comments={comments} />

                            <footer className="post-page__content-footer">
                                <CommentInput
                                    currentUserAvatar={currentUserAvatar}
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
