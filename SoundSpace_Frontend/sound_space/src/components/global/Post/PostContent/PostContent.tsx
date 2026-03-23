import React from 'react';
import Song, { SongProps } from '../../Song/Song';
import './PostContent.css';

interface PostContentProps {
    content: string;
    song?: SongProps;
}

const PostContent = ({ content, song }: PostContentProps) => {
    return (
        <div className="post__content">
            <p className="post__text">{content}</p>
            {song && (
                <div className="post__song-wrapper">
                    <Song {...song} />
                </div>
            )}
        </div>
    );
};

export default PostContent;
