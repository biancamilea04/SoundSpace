"use client";

import Image from 'next/image';
import { X } from 'lucide-react';
import type { SpotifyMediaPayload } from '@/types/spotify';
import './SpotifyAttachmentPreview.css';

interface SpotifyAttachmentPreviewProps {
    item: SpotifyMediaPayload;
    onRemove: () => void;
}

export const SpotifyAttachmentPreview = ({ item, onRemove }: SpotifyAttachmentPreviewProps) => {
    return (
        <div className="spotify-attachment">
            <div className="spotify-attachment__cover-wrap">
                <Image
                    src={item.coverUrl || '/icons/SoundSpaceIcon.png'}
                    alt={item.name}
                    width={48}
                    height={48}
                    className="spotify-attachment__cover"
                />
            </div>
            <div className="spotify-attachment__info">
                <a href={item.externalUrl} target="_blank" rel="noopener noreferrer" className="spotify-attachment__title">
                    {item.name}
                </a>
                <a href={item.subtitleUrl} target="_blank" rel="noopener noreferrer" className="spotify-attachment__artist">
                    {item.subtitle}
                </a>
            </div>
            <button
                type="button"
                className="spotify-attachment__remove-btn"
                onClick={onRemove}
                aria-label="Remove attached media"
            >
                <X size={16} />
            </button>
        </div>
    );
};

export default SpotifyAttachmentPreview;
