'use client';

import Link from 'next/link';
import type { EventData } from '@/types/event';
import './EventListItem.css';

interface EventListItemProps {
    event: EventData;
    onClose?: () => void;
}

function toAbsoluteUrl(url: string): string {
    return url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;
}

export const EventListItem = ({ event, onClose }: EventListItemProps) => {
    const cover = event.coverImageUrl ?? event.imageUrl;
    const artistUrl = event.artistProfileUrl ? toAbsoluteUrl(event.artistProfileUrl) : null;

    return (
        <div className="event-list-item">
            <div className="event-list-item__thumb">
                {cover ? (
                    <img
                        src={cover}
                        alt={event.title}
                        className="event-list-item__thumb-img"
                    />
                ) : (
                    <div className="event-list-item__thumb-placeholder" />
                )}
            </div>

            <div className="event-list-item__info">
                <Link
                    href={`/events/${event.id}`}
                    className="event-list-item__title-link"
                    onClick={onClose}
                >
                    <span className="event-list-item__title">{event.title}</span>
                </Link>

                {event.artistName && (
                    artistUrl ? (
                        <a
                            href={artistUrl}
                            className="event-list-item__artist-link"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <span className="event-list-item__artist">{event.artistName}</span>
                        </a>
                    ) : (
                        <span className="event-list-item__artist">{event.artistName}</span>
                    )
                )}
            </div>
        </div>
    );
};

export default EventListItem;
