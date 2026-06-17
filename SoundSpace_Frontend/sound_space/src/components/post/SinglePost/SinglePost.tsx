import React from 'react';
import Image from 'next/image';
import { Heart, MessageCircle, Share2 } from 'lucide-react';
import Song from '../../global/Song/Song';
import SpotifyAlbumCard from '../../global/SpotifyAlbumCard/SpotifyAlbumCard';
import MusicPostCard from '../../global/MusicPostCard/MusicPostCard';
import { useSpotifyItem } from '@/hooks/spotify/useSpotifyItem';
import type { SelectedPostPayload } from '../../global/Post/Post.types';

interface SinglePostProps {
    post: SelectedPostPayload;
    liked: boolean;
    likeCount: number;
    commentCount: number;
    onToggleLike: () => void;
}

const SpotifyMediaEmbed = ({ uri }: { uri: string }) => {
    const { item, isLoading } = useSpotifyItem(uri);

    if (isLoading) {
        return (
            <div className="spotify-album-card spotify-album-card--skeleton">
                <div className="spotify-album-card__skeleton-cover" />
                <div className="spotify-album-card__skeleton-lines">
                    <div className="spotify-album-card__skeleton-line spotify-album-card__skeleton-line--short" />
                    <div className="spotify-album-card__skeleton-line spotify-album-card__skeleton-line--long" />
                    <div className="spotify-album-card__skeleton-line spotify-album-card__skeleton-line--medium" />
                </div>
            </div>
        );
    }

    if (!item) return null;
    return <SpotifyAlbumCard item={item} />;
};

const uriToExternalUrl = (uri: string): string => {
    const parts = uri.split(':');
    return parts.length === 3 ? `https://open.spotify.com/${parts[1]}/${parts[2]}` : '#';
};

const SinglePost = ({ post, liked, likeCount, commentCount, onToggleLike }: SinglePostProps) => {
    const isTrackWithPreview =
        post.spotifyUri &&
        post.spotifyMediaType === 'track' &&
        post.previewUrl &&
        post.spotifyName;

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

                {post.song && (
                    <div className="post__song-wrapper">
                        <Song {...post.song} />
                    </div>
                )}

                {post.spotifyUri && (
                    <div className="post__media-wrapper">
                        {isTrackWithPreview ? (
                            <MusicPostCard
                                postId={post.postId}
                                previewUrl={post.previewUrl!}
                                coverUrl={post.spotifyCoverUrl}
                                title={post.spotifyName!}
                                artist={post.spotifySubtitle ?? ''}
                                externalUrl={post.spotifyUri ? uriToExternalUrl(post.spotifyUri) : null}
                                subtitleUrl={post.spotifySubtitleUrl}
                                previewStartSecond={post.previewStartSecond}
                                previewDuration={post.previewDuration}
                            />
                        ) : post.spotifyName ? (
                            <SpotifyAlbumCard
                                item={{
                                    uri: post.spotifyUri,
                                    name: post.spotifyName,
                                    type: (post.spotifyMediaType as 'track' | 'album' | 'show') ?? 'track',
                                    coverUrl: post.spotifyCoverUrl ?? '',
                                    subtitle: post.spotifySubtitle ?? '',
                                    externalUrl: '',
                                    subtitleUrl: '',
                                }}
                            />
                        ) : (
                            <SpotifyMediaEmbed uri={post.spotifyUri} />
                        )}
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
