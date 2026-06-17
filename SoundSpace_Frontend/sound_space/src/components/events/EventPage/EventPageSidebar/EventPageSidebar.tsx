"use client";

import dynamic from "next/dynamic";
import { MapPin, Calendar, Ticket, Check } from "lucide-react";
import { EventAttendee, EventData } from "@/types/event";
import "./EventPageSidebar.css";

interface EventPageSidebarProps {
    event: EventData;
    isAttending: boolean;
    attendeeCount: number;
    attendees: EventAttendee[];
    onAttendToggle: () => void;
    isPending?: boolean;
    isSticky?: boolean;
}

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

function isEventInPast(eventDate: string, eventTime: string): boolean {
    const dateTime = new Date(`${eventDate}T${eventTime}`);
    if (Number.isNaN(dateTime.getTime())) {
        return false;
    }
    return dateTime.getTime() < Date.now();
}

const EventPageSidebar = ({
    event,
    isAttending,
    attendeeCount,
    attendees,
    onAttendToggle,
    isPending,
    isSticky = true,
}: EventPageSidebarProps) => {
    const ticketsUrl = event.ticketsUrl?.trim() ?? "";
    const hasTicketsUrl = ticketsUrl.length > 0;
    const extraCount = Math.max(0, attendeeCount - attendees.length);
    const isPastEvent = isEventInPast(event.eventDate, event.eventTime);
    const isAttendActive = !isPastEvent && isAttending;
    const attendLabel = isPastEvent ? "View" : isAttendActive ? "Attending" : "Attend Event";

    return (
        <aside className={`eps${isSticky ? "" : " eps--no-sticky"}`}>
            <div className="eps__card">
                <div className="eps__card-icon-wrap">
                    <MapPin size={16} />
                </div>
                <div className="eps__card-content">
                    <p className="eps__card-label">VENUE</p>
                    <p className="eps__card-value">{event.location}</p>
                    <p className="eps__card-sub">{event.city}, {event.country}</p>
                </div>
            </div>

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

            {hasTicketsUrl && (
                <div className="eps__card">
                    <div className="eps__card-icon-wrap">
                        <Ticket size={16} />
                    </div>
                    <div className="eps__card-content">
                        <p className="eps__card-label">TICKETS</p>
                        <p className="eps__card-value">Tickets available</p>
                        <a
                            href={ticketsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="eps__tickets-link"
                        >
                            Get Tickets →
                        </a>
                    </div>
                </div>
            )}

            <div className="eps__card eps__card--friends">
                <div className="eps__friends">
                    {attendees.length > 0 && (
                        <div className="eps__avatars">
                            {attendees.map((a) =>
                                a.profileImageUrl ? (
                                    <img
                                        key={a.userId}
                                        src={a.profileImageUrl}
                                        alt={a.displayName}
                                        className="eps__avatar eps__avatar--photo"
                                    />
                                ) : (
                                    <span
                                        key={a.userId}
                                        className="eps__avatar eps__avatar--placeholder"
                                    >
                                        {a.displayName.charAt(0).toUpperCase()}
                                    </span>
                                )
                            )}
                        </div>
                    )}
                    <div className="eps__friends-text">
                        <p className="eps__card-label">ATTENDING</p>
                        <p className="eps__friends-count">
                            {attendeeCount > 0
                                ? `${attendeeCount.toLocaleString()} going${extraCount > 0 ? ` (+${extraCount.toLocaleString()} more)` : ""}`
                                : "Be the first to attend"}
                        </p>
                    </div>
                </div>
            </div>

            <button
                className={`eps__attend-cta${isAttendActive ? " eps__attend-cta--on" : " eps__attend-cta--off"}`}
                onClick={isPastEvent ? undefined : onAttendToggle}
                disabled={isPending || isPastEvent}
            >
                {isAttendActive ? (
                    <>
                        <Check size={16} strokeWidth={3} />
                        {attendLabel}
                    </>
                ) : (
                    attendLabel
                )}
            </button>
        </aside>
    );
};

export default EventPageSidebar;
