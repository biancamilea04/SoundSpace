"use client";

import React from 'react';
import Song, { SongProps } from '../../Song/Song';
import SpotifyAlbumCard from '../../SpotifyAlbumCard/SpotifyAlbumCard';
import { useSpotifyItem } from '@/hooks/spotify/useSpotifyItem';
import './PostContent.css';

interface PostContentProps {
    content: string;
    song?: SongProps;
    spotifyUri?: string;
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

const PostContent = ({ content, song, spotifyUri }: PostContentProps) => {
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
                    <SpotifyMediaEmbed uri={spotifyUri} />
                </div>
            )}
        </div>
    );
};

export default PostContent;
