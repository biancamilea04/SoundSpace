"use client";

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
    <div className="event-row__scroll">
        {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="event-row__skeleton" />
        ))}
    </div>
);

const EventRow = ({ title, events, isLoading, onEventUpdated, onEventClick }: EventRowProps) => {
    if (!isLoading && events.length === 0) return null;

    return (
        <section className="event-row">
            <h2 className="event-row__title">{title}</h2>
            {isLoading ? (
                <EventRowSkeleton />
            ) : (
                <div className="event-row__scroll">
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
            )}
        </section>
    );
};

export default EventRow;
