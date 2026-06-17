"use client";

import React from 'react';
import Song, { SongProps } from '../../Song/Song';
import SpotifyAlbumCard from '../../SpotifyAlbumCard/SpotifyAlbumCard';
import MusicPostCard from '../../MusicPostCard/MusicPostCard';
import { useSpotifyItem } from '@/hooks/spotify/useSpotifyItem';
import './PostContent.css';

interface PostContentProps {
    postId: string;
    content: string;
    song?: SongProps;
    spotifyUri?: string;
    spotifyName?: string;
    spotifyCoverUrl?: string;
    spotifySubtitle?: string;
    spotifySubtitleUrl?: string | null;
    spotifyMediaType?: string;
    previewUrl?: string;
    previewStartSecond?: number | null;
    previewDuration?: number | null;
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

const PostContent = ({
    postId,
    content,
    song,
    spotifyUri,
    spotifyName,
    spotifyCoverUrl,
    spotifySubtitle,
    spotifySubtitleUrl,
    spotifyMediaType,
    previewUrl,
    previewStartSecond,
    previewDuration,
}: PostContentProps) => {
    const isTrackWithPreview =
        spotifyUri &&
        spotifyMediaType === 'track' &&
        previewUrl &&
        spotifyName;

    return (
        <div className="post__content">
            <p className="post__text">{content}</p>

            {song && (
                <div className="post__song-wrapper">
                    <Song {...song} />
                </div>
            )}

            {spotifyUri && (
                <div className="post__media-wrapper">
                    {isTrackWithPreview ? (
                        <MusicPostCard
                            postId={postId}
                            previewUrl={previewUrl!}
                            coverUrl={spotifyCoverUrl}
                            title={spotifyName!}
                            artist={spotifySubtitle ?? ''}
                            externalUrl={spotifyUri ? uriToExternalUrl(spotifyUri) : null}
                            subtitleUrl={spotifySubtitleUrl}
                            previewStartSecond={previewStartSecond}
                            previewDuration={previewDuration}
                        />
                    ) : spotifyName ? (
                        <SpotifyAlbumCard
                            item={{
                                uri: spotifyUri,
                                name: spotifyName,
                                type: (spotifyMediaType as 'track' | 'album' | 'show') ?? 'track',
                                coverUrl: spotifyCoverUrl ?? '',
                                subtitle: spotifySubtitle ?? '',
                                externalUrl: uriToExternalUrl(spotifyUri),
                                subtitleUrl: spotifySubtitleUrl ?? '',
                            }}
                        />
                    ) : (
                        <SpotifyMediaEmbed uri={spotifyUri} />
                    )}
                </div>
            )}
        </div>
    );
};

export default PostContent;
