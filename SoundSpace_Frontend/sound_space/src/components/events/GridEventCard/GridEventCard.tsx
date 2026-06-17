"use client";

import { useState } from "react";
import Image from "next/image";
import { Users, Check } from "lucide-react";
import { EventData } from "@/types/event";
import { toggleAttendance } from "@/services/event/eventService";
import "./GridEventCard.css";

interface GridEventCardProps {
    event: EventData;
    onEventUpdated: (updated: EventData) => void;
    onClick?: () => void;
    compact?: boolean;
}

function formatShortDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" }).toUpperCase();
}

const GridEventCard = ({ event, onEventUpdated, onClick, compact }: GridEventCardProps) => {
    const [isPending, setIsPending] = useState(false);

    const fallbackImage = `https://eu.ui-avatars.com/api/?name=${encodeURIComponent(event.artistName ?? event.title)}&background=1ed760&color=000&size=400&bold=true`;
    const imageSrc = event.imageUrl ?? event.artistImageUrl ?? fallbackImage;

    const handleAttend = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isPending) return;

        const wasAttending = event.isAttendedByCurrentUser;
        onEventUpdated({
            ...event,
            isAttendedByCurrentUser: !wasAttending,
            attendeeCount: wasAttending ? event.attendeeCount - 1 : event.attendeeCount + 1,
        });

        setIsPending(true);
        try {
            const result = await toggleAttendance(event.id);
            onEventUpdated({
                ...event,
                isAttendedByCurrentUser: result.isAttending,
                attendeeCount: result.isAttending
                    ? event.attendeeCount + 1
                    : event.attendeeCount - 1,
            });
        } catch {
            onEventUpdated(event);
        } finally {
            setIsPending(false);
        }
    };

    const displayCount =
        event.attendeeCount >= 1000
            ? `${(event.attendeeCount / 1000).toFixed(1)}k`
            : String(event.attendeeCount);

    return (
        <div className={`gec${compact ? " gec--compact" : ""}`} onClick={onClick}>
            <div className="gec__image-wrapper">
                <Image
                    src={imageSrc}
                    alt={event.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="gec__image"
                    unoptimized
                />
                <div className="gec__date-badge">
                    {formatShortDate(event.eventDate)}
                </div>
            </div>

            <div className="gec__body">
                <h3 className="gec__title">{event.title}</h3>
                <p className="gec__venue">{event.location} · {event.city}</p>

                <div className="gec__footer">
                    <div className="gec__attendees">
                        <Users size={12} className="gec__users-icon" />
                        <span className="gec__count">{displayCount}</span>
                    </div>

                    <button
                        className={`gec__attend ${event.isAttendedByCurrentUser ? "gec__attend--on" : "gec__attend--off"}`}
                        onClick={handleAttend}
                        disabled={isPending}
                        aria-label={event.isAttendedByCurrentUser ? "Leave event" : "Attend event"}
                    >
                        {event.isAttendedByCurrentUser ? (
                            <>
                                <Check size={11} strokeWidth={3} />
                                Attending
                            </>
                        ) : (
                            "Attend"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GridEventCard;
