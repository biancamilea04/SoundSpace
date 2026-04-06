import React from 'react';
import Image from 'next/image';
import { Music } from 'lucide-react';
import type { CommonSongsProps } from '@/types/discovery';
import './CommonSongs.css';

export const CommonSongs = ({ commonSongsCount, commonSongs }: CommonSongsProps) => {
    return (
        <div className="common-songs">
            <div className="common-songs__header">
                <Music size={16} className="common-songs__icon" />
                <span className="common-songs__count">
                    {commonSongsCount} COMMON SONGS
                </span>
            </div>
            <div className="common-songs__list">
                {commonSongs.slice(0, 5).map((song) => (
                    <div key={song.id} className="common-songs__album-thumb">
                        <Image
                            src={song.albumImageUrl}
                            alt={`${song.title} by ${song.artist}`}
                            width={40}
                            height={40}
                            className="common-songs__album-image"
                        />
                    </div>
                ))}
                {commonSongsCount > 5 && (
                    <div className="common-songs__album-more">
                        +{commonSongsCount - 5}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CommonSongs;