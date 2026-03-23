import React from 'react';
import { usePostInteractions } from '../../../hooks/Post/usePostInteractions';
import PostHeader from './PostHeader/PostHeader';
import PostContent from './PostContent/PostContent';
import PostFooter from './PostFooter/PostFooter';
import type { PostProps } from './Post.types';
import './Post.css';

export const Post = ({ user, timeAgo, content, song, stats }: PostProps) => {
    const {
        liked,
        showShareMenu,
        showOptionsMenu,
        shareMenuRef,
        optionsMenuRef,
        toggleLiked,
        toggleShareMenu,
        toggleOptionsMenu,
        handleReportPost,
        handleShare,
    } = usePostInteractions({
        userName: user.name,
        content,
    });

    return (
        <article className="post">
            <PostHeader
                user={user}
                timeAgo={timeAgo}
                showOptionsMenu={showOptionsMenu}
                optionsMenuRef={optionsMenuRef}
                onToggleOptionsMenu={toggleOptionsMenu}
                onReportPost={handleReportPost}
            />
            <PostContent content={content} song={song} />
            <PostFooter
                stats={stats}
                liked={liked}
                showShareMenu={showShareMenu}
                shareMenuRef={shareMenuRef}
                onToggleLike={toggleLiked}
                onToggleShareMenu={toggleShareMenu}
                onShare={handleShare}
            />
        </article>
    );
};

export default Post;
