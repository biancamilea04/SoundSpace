'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Search } from 'lucide-react';
import type { EventData } from '@/types/event';
import { EventListItem } from '@/components/profile/EventListItem/EventListItem';
import './EventsModal.css';

interface EventsModalProps {
    events: EventData[];
    isLoading: boolean;
    onClose: () => void;
}

export const EventsModal = ({ events, isLoading, onClose }: EventsModalProps) => {
    const [query, setQuery] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [onClose]);

    const q = query.trim().toLowerCase();
    const filtered = q
        ? events.filter(
              (e) =>
                  e.title.toLowerCase().includes(q) ||
                  (e.artistName?.toLowerCase().includes(q) ?? false)
          )
        : events;

    return (
        <div className="events-modal__backdrop" onClick={onClose}>
            <div
                className="events-modal"
                role="dialog"
                aria-modal="true"
                aria-label="Events"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="events-modal__header">
                    <span className="events-modal__title">
                        Events
                        {events.length > 0 && (
                            <span className="events-modal__count">{events.length}</span>
                        )}
                    </span>
                    <button
                        className="events-modal__close"
                        onClick={onClose}
                        aria-label="Close"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="events-modal__search-wrap">
                    <Search className="events-modal__search-icon" size={14} />
                    <input
                        ref={inputRef}
                        className="events-modal__search"
                        type="text"
                        placeholder="Search events"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                </div>

                <div className="events-modal__list">
                    {isLoading ? (
                        <div className="events-modal__spinner-wrap">
                            <div className="events-modal__spinner" />
                        </div>
                    ) : filtered.length === 0 ? (
                        <p className="events-modal__empty">
                            {q ? 'No results found' : 'No events yet'}
                        </p>
                    ) : (
                        filtered.map((event) => (
                            <EventListItem
                                key={event.id}
                                event={event}
                                onClose={onClose}
                            />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default EventsModal;
