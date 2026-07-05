"use client";

import { useRef } from "react";
import { EventData } from "@/types/event";
import GridEventCard from "@/components/events/GridEventCard/GridEventCard";
import "./EventRow.css";

interface EventRowProps {
    title: string;
    events: EventData[];
    isLoading: boolean;
    onEventUpdated: (updated: EventData) => void;
    onEventClick?: (event: EventData) => void;
}

const EventRowSkeleton = () => (
    <div className="event-row__carousel">
        <div className="event-row__scroll">
            {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="event-row__skeleton" />
            ))}
        </div>
    </div>
);

const EventRow = ({ title, events, isLoading, onEventUpdated, onEventClick }: EventRowProps) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scrollByCard = (direction: "left" | "right") => {
        const el = scrollRef.current;
        if (!el) return;
        const firstCard = el.firstElementChild as HTMLElement | null;
        const cardWidth = firstCard ? firstCard.offsetWidth + 16 : 198;
        el.scrollLeft += direction === "left" ? -cardWidth : cardWidth;
    };

    if (!isLoading && events.length === 0) return null;

    return (
        <section className="event-row">
            <h2 className="event-row__title">{title}</h2>
            {isLoading ? (
                <EventRowSkeleton />
            ) : (
                <div className="event-row__carousel">
                    <button
                        className="event-row__btn event-row__btn--left"
                        onClick={() => scrollByCard("left")}
                        aria-label="Previous events"
                    >
                        <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                        </svg>
                    </button>

                    <div className="event-row__scroll" ref={scrollRef}>
                        {events.map((event) => (
                            <GridEventCard
                                key={event.id}
                                event={event}
                                onEventUpdated={onEventUpdated}
                                onClick={() => onEventClick?.(event)}
                                compact
                            />
                        ))}
                    </div>

                    <button
                        className="event-row__btn event-row__btn--right"
                        onClick={() => scrollByCard("right")}
                        aria-label="Next events"
                    >
                        <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                            <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
                        </svg>
                    </button>
                </div>
            )}
        </section>
    );
};

export default EventRow;
