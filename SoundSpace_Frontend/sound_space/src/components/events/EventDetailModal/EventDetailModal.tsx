"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, MapPin, Clock, Ticket, Check, Upload, Camera } from "lucide-react";
import { EventData } from "@/types/event";
import { toggleAttendance } from "@/services/event/eventService";
import "./EventDetailModal.css";

interface EventDetailModalProps {
    event: EventData;
    onClose: () => void;
    onEventUpdated: (updated: EventData) => void;
}

function formatLongDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
    });
}

function formatTime(timeStr: string): string {
    const [h, m] = timeStr.split(":");
    const d = new Date();
    d.setHours(Number(h), Number(m));
    return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

const FRIEND_AVATARS = [
    { initials: "AK", bg: "#e91e63" },
    { initials: "JM", bg: "#9c27b0" },
    { initials: "RS", bg: "#2196f3" },
    { initials: "TL", bg: "#ff5722" },
    { initials: "MP", bg: "#009688" },
];

const EventDetailModal = ({ event, onClose, onEventUpdated }: EventDetailModalProps) => {
    const [isPending, setIsPending] = useState(false);
    const overlayRef = useRef<HTMLDivElement>(null);

    const fallbackImage = `https://eu.ui-avatars.com/api/?name=${encodeURIComponent(event.artistName)}&background=1ed760&color=000&size=400&bold=true`;
    const imageSrc = event.imageUrl ?? event.artistImageUrl ?? fallbackImage;

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", onKey);
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", onKey);
            document.body.style.overflow = "";
        };
    }, [onClose]);

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === overlayRef.current) onClose();
    };

    const handleAttend = async () => {
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

    const extraAttendees = Math.max(0, event.attendeeCount - FRIEND_AVATARS.length);

    return (
        <div className="edm-overlay" ref={overlayRef} onClick={handleOverlayClick}>
            <div
                className="edm-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="edm-title"
            >
                <button className="edm-close" onClick={onClose} aria-label="Close">
                    <X size={18} />
                </button>

                {/* Hero */}
                <div className="edm-hero">
                    <Image
                        src={imageSrc}
                        alt={event.title}
                        fill
                        className="edm-hero__image"
                        unoptimized
                        priority
                    />
                    <div className="edm-hero__overlay" />
                    <div className="edm-hero__content">
                        <div className="edm-hero__thumb-wrapper">
                            <Image
                                src={imageSrc}
                                alt=""
                                width={80}
                                height={80}
                                className="edm-hero__thumb"
                                unoptimized
                            />
                        </div>
                        <div className="edm-hero__meta">
                            <span className="edm-eyebrow">EVENT</span>
                            <h2 className="edm-hero__title" id="edm-title">
                                {event.title}
                            </h2>
                            <p className="edm-hero__sub">
                                Hosted by {event.createdByDisplayName}
                                {" · "}
                                {formatLongDate(event.eventDate)}
                                {" · "}
                                {event.attendeeCount.toLocaleString()} attending
                            </p>
                        </div>
                    </div>
                </div>

                {/* Body */}
                <div className="edm-body">
                    {/* Left column */}
                    <div className="edm-left">
                        <section className="edm-section">
                            <span className="edm-eyebrow">ABOUT THIS EVENT</span>
                            <p className="edm-about">
                                {event.description ??
                                    `Join us for ${event.title} featuring ${event.artistName} live at ${event.location}, ${event.city}. An unmissable night of music and energy.`}
                            </p>
                        </section>

                        <section className="edm-section">
                            <div className="edm-section__header">
                                <span className="edm-eyebrow">CROWD PHOTOS</span>
                                <button className="edm-upload-btn">
                                    <Upload size={13} />
                                    Upload
                                </button>
                            </div>
                            <div className="edm-photos">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <div key={i} className="edm-photo-placeholder">
                                        <Camera size={20} />
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="edm-section">
                            <span className="edm-eyebrow">FRIENDS GOING</span>
                            <div className="edm-friends">
                                <div className="edm-friends__avatars">
                                    {FRIEND_AVATARS.map((f) => (
                                        <span
                                            key={f.initials}
                                            className="edm-friends__avatar"
                                            style={{ background: f.bg }}
                                        >
                                            {f.initials}
                                        </span>
                                    ))}
                                </div>
                                <span className="edm-friends__count">
                                    {extraAttendees > 0
                                        ? `+${extraAttendees.toLocaleString()} more attending`
                                        : `${event.attendeeCount} attending`}
                                </span>
                            </div>
                        </section>
                    </div>

                    {/* Right column */}
                    <div className="edm-right">
                        <div className="edm-info-card">
                            <div className="edm-info-card__icon">
                                <MapPin size={16} />
                            </div>
                            <div className="edm-info-card__content">
                                <p className="edm-info-card__label">Venue</p>
                                <p className="edm-info-card__value">{event.location}</p>
                                <p className="edm-info-card__sub">
                                    {event.city}, {event.country}
                                </p>
                                <div className="edm-map-placeholder" />
                            </div>
                        </div>

                        <div className="edm-info-card">
                            <div className="edm-info-card__icon">
                                <Clock size={16} />
                            </div>
                            <div className="edm-info-card__content">
                                <p className="edm-info-card__label">Date</p>
                                <p className="edm-info-card__value">
                                    {formatLongDate(event.eventDate)}
                                </p>
                                <p className="edm-info-card__sub">
                                    Doors {formatTime(event.eventTime)}
                                </p>
                            </div>
                        </div>

                        <div className="edm-info-card">
                            <div className="edm-info-card__icon">
                                <Ticket size={16} />
                            </div>
                            <div className="edm-info-card__content">
                                <p className="edm-info-card__label">Tickets</p>
                                <p className="edm-info-card__value">
                                    {event.ticketsUrl ? "From $24 · limited" : "Free entry"}
                                </p>
                                {event.ticketsUrl && (
                                    <a
                                        href={event.ticketsUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="edm-tickets-link"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        Get tickets →
                                    </a>
                                )}
                            </div>
                        </div>

                        <button
                            className={`edm-cta ${event.isAttendedByCurrentUser ? "edm-cta--attending" : "edm-cta--default"}`}
                            onClick={handleAttend}
                            disabled={isPending}
                        >
                            {event.isAttendedByCurrentUser ? (
                                <>
                                    <Check size={16} strokeWidth={3} />
                                    Attending
                                </>
                            ) : (
                                "Attend Event"
                            )}
                        </button>

                        <Link
                            href={`/events/${event.id}`}
                            className="edm-see-more"
                            onClick={onClose}
                        >
                            See More
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventDetailModal;
