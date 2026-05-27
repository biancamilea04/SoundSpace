"use client";

import Image from "next/image";
import { MapPin, Users } from "lucide-react";
import { EventData } from "@/types/event";
import AttendButton from "@/components/events/AttendButton/AttendButton";
import "./EventCard.css";

interface EventCardProps {
    event: EventData;
    onEventUpdated: (updated: EventData) => void;
}

function formatEventDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatEventTime(timeStr: string): string {
    const [h, m] = timeStr.split(":");
    const d = new Date();
    d.setHours(Number(h), Number(m));
    return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

const EventCard = ({ event, onEventUpdated }: EventCardProps) => {
    const fallbackImage = `https://eu.ui-avatars.com/api/?name=${encodeURIComponent(event.artistName)}&background=1ed760&color=000&size=300&bold=true`;
    const imageSrc = event.imageUrl ?? event.artistImageUrl ?? fallbackImage;

    return (
        <div className="event-card">
            <div className="event-card__image-wrapper">
                <Image
                    src={imageSrc}
                    alt={event.title}
                    fill
                    sizes="(max-width: 768px) 160px, 200px"
                    className="event-card__image"
                    unoptimized
                />
            </div>

            <div className="event-card__body">
                <p className="event-card__artist">{event.artistName}</p>
                <h3 className="event-card__title">{event.title}</h3>

                <p className="event-card__date">
                    {formatEventDate(event.eventDate)} · {formatEventTime(event.eventTime)}
                </p>

                <p className="event-card__location">
                    <MapPin size={12} className="event-card__location-icon" />
                    {event.city}, {event.country}
                </p>

                <div className="event-card__footer">
                    <span className="event-card__attendees">
                        <Users size={12} />
                        {event.attendeeCount}
                    </span>
                    <AttendButton event={event} onEventUpdated={onEventUpdated} />
                </div>
            </div>
        </div>
    );
};

export default EventCard;
