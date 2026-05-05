import React from 'react';
import { usePostInteractions } from '../../../hooks/Post/usePostInteractions';
import PostHeader from './PostHeader/PostHeader';
import PostContent from './PostContent/PostContent';
import PostFooter from './PostFooter/PostFooter';
import type { PostProps } from './Post.types';
import './Post.css';

export const Post = ({ postId, user, timeAgo, content, song, spotifyUri, stats, isOwner, onEditPost, onDeletePost }: PostProps) => {
    const postKey = `${user.name}|${timeAgo}|${content}`;

    const {
        liked,
        likeCount,
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
        postId,
        userName: user.name,
        content,
        initialLiked: stats.isLikedByCurrentUser,
        initialLikeCount: stats.likes,
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
                isOwner={isOwner}
                onEditPost={onEditPost}
                onDeletePost={onDeletePost}
            />
            <PostContent content={content} song={song} spotifyUri={spotifyUri} />
            <PostFooter
                stats={{ ...stats, likes: likeCount }}
                postData={{
                    postId,
                    postKey,
                    user,
                    timeAgo,
                    content,
                    song,
                    spotifyUri,
                    stats,
                    likeCount,
                    isLikedByCurrentUser: liked,
                }}
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
