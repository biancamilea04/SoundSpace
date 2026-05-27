"use client";

import { MapPin, Calendar, Ticket, Check } from "lucide-react";
import { EventData } from "@/types/event";
import "./EventPageSidebar.css";

interface EventPageSidebarProps {
    event: EventData;
    isAttending: boolean;
    attendeeCount: number;
    onAttendToggle: () => void;
    isPending?: boolean;
}

const FRIEND_AVATARS = [
    { initials: "AK", bg: "#e91e63" },
    { initials: "JM", bg: "#9c27b0" },
    { initials: "RS", bg: "#2196f3" },
    { initials: "TL", bg: "#ff9800" },
];

function formatSidebarDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
    });
}

function formatSidebarTime(timeStr: string): string {
    const [h, m] = timeStr.split(":");
    const d = new Date();
    d.setHours(Number(h), Number(m));
    return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

const EventPageSidebar = ({
    event,
    isAttending,
    attendeeCount,
    onAttendToggle,
    isPending,
}: EventPageSidebarProps) => {
    const extraCount = Math.max(0, attendeeCount - FRIEND_AVATARS.length);

    return (
        <aside className="eps">
            {/* Venue card */}
            <div className="eps__card">
                <div className="eps__card-icon-wrap">
                    <MapPin size={16} />
                </div>
                <div className="eps__card-content">
                    <p className="eps__card-label">VENUE</p>
                    <p className="eps__card-value">{event.location}</p>
                    <p className="eps__card-sub">{event.city}, {event.country}</p>
                    <div className="eps__map-placeholder">
                        <span className="eps__map-text">Map preview</span>
                    </div>
                </div>
            </div>

            {/* Date & Time card */}
            <div className="eps__card">
                <div className="eps__card-icon-wrap">
                    <Calendar size={16} />
                </div>
                <div className="eps__card-content">
                    <p className="eps__card-label">DATE & TIME</p>
                    <p className="eps__card-value">{formatSidebarDate(event.eventDate)}</p>
                    <p className="eps__card-sub">Doors open at {formatSidebarTime(event.eventTime)}</p>
                </div>
            </div>

            {/* Tickets card */}
            <div className="eps__card">
                <div className="eps__card-icon-wrap">
                    <Ticket size={16} />
                </div>
                <div className="eps__card-content">
                    <p className="eps__card-label">TICKETS</p>
                    <p className="eps__card-value">
                        {event.ticketsUrl ? "From $24 · limited" : "Free entry"}
                    </p>
                    {event.ticketsUrl && (
                        <a
                            href={event.ticketsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="eps__tickets-link"
                        >
                            Get Tickets →
                        </a>
                    )}
                </div>
            </div>

            {/* Friends going card */}
            <div className="eps__card eps__card--friends">
                <div className="eps__friends">
                    <div className="eps__avatars">
                        {FRIEND_AVATARS.map((f) => (
                            <span
                                key={f.initials}
                                className="eps__avatar"
                                style={{ background: f.bg }}
                            >
                                {f.initials}
                            </span>
                        ))}
                    </div>
                    <div className="eps__friends-text">
                        <p className="eps__card-label">FRIENDS GOING</p>
                        <p className="eps__friends-count">
                            +{extraCount.toLocaleString()} attending
                        </p>
                    </div>
                </div>
            </div>

            {/* Attend CTA */}
            <button
                className={`eps__attend-cta${isAttending ? " eps__attend-cta--on" : " eps__attend-cta--off"}`}
                onClick={onAttendToggle}
                disabled={isPending}
            >
                {isAttending ? (
                    <>
                        <Check size={16} strokeWidth={3} />
                        Attending
                    </>
                ) : (
                    "Attend Event"
                )}
            </button>
        </aside>
    );
};

export default EventPageSidebar;
