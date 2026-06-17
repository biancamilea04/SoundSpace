"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Pencil, Trash2, ExternalLink } from "lucide-react";
import { EventAttendee, EventData } from "@/types/event";
import { fetchEventAttendees, toggleAttendance, deleteEvent } from "@/services/event/eventService";
import { fetchUserProfile } from "@/services/user/userService";
import EventPageHero from "@/components/events/EventPage/EventPageHero/EventPageHero";
import EventPageOverview from "@/components/events/EventPage/EventPageOverview/EventPageOverview";
import EventPageSidebar from "@/components/events/EventPage/EventPageSidebar/EventPageSidebar";
import "./EventDetailModal.css";

interface EventDetailModalProps {
    event: EventData;
    onClose: () => void;
    onEventUpdated: (updated: EventData) => void;
    onEventDeleted?: (eventId: string) => void;
}

const EventDetailModal = ({ event, onClose, onEventUpdated, onEventDeleted }: EventDetailModalProps) => {
    const [isPending, setIsPending] = useState(false);
    const [attendees, setAttendees] = useState<EventAttendee[]>([]);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const overlayRef = useRef<HTMLDivElement>(null);

    const isOwner = !!currentUserId && currentUserId === event.createdByUserId;

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                if (showDeleteConfirm) {
                    setShowDeleteConfirm(false);
                } else {
                    onClose();
                }
            }
        };
        document.addEventListener("keydown", onKey);
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", onKey);
            document.body.style.overflow = "";
        };
    }, [onClose, showDeleteConfirm]);

    useEffect(() => {
        let cancelled = false;
        fetchEventAttendees(event.id, 10)
            .then((data) => { if (!cancelled) setAttendees(data); })
            .catch(() => {});
        fetchUserProfile()
            .then((profile) => { if (!cancelled) setCurrentUserId(profile.id); })
            .catch(() => {});
        return () => { cancelled = true; };
    }, [event.id]);

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

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await deleteEvent(event.id);
            onEventDeleted?.(event.id);
            onClose();
        } catch {
            setIsDeleting(false);
        }
    };

    return (
        <div className="edm-overlay" ref={overlayRef} onClick={handleOverlayClick}>
            <div
                className="edm-modal"
                role="dialog"
                aria-modal="true"
                aria-label={event.title}
            >
                <EventPageHero
                    event={event}
                    attendeeCount={event.attendeeCount}
                    onClose={onClose}
                />

                <div className="edm-body">
                    <div className="edm-left">
                        <EventPageOverview event={event} />
                    </div>

                    <div className="edm-right">
                        <EventPageSidebar
                            event={event}
                            isAttending={event.isAttendedByCurrentUser}
                            attendeeCount={event.attendeeCount}
                            attendees={attendees}
                            onAttendToggle={handleAttend}
                            isPending={isPending}
                            isSticky={false}
                        />
                        <Link
                                    href={`/events/${event.id}`}
                                    className="edm-owner-btn edm-owner-btn--view"
                                    onClick={onClose}
                                >
                                    <ExternalLink size={15} />
                                    View Full Event
                                </Link>

                        {isOwner && (
                            <div className="edm-owner-actions">                                
                                <Link
                                    href={`/events/${event.id}/edit`}
                                    className="edm-owner-btn edm-owner-btn--edit"
                                    onClick={onClose}
                                >
                                    <Pencil size={15} />
                                    Edit Event
                                </Link>
                                <button
                                    className="edm-owner-btn edm-owner-btn--delete"
                                    onClick={() => setShowDeleteConfirm(true)}
                                >
                                    <Trash2 size={15} />
                                    Delete Event
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {showDeleteConfirm && (
                    <div className="edm-confirm-overlay">
                        <div className="edm-confirm" role="alertdialog" aria-modal="true">
                            <p className="edm-confirm__title">Delete Event</p>
                            <p className="edm-confirm__body">
                                Are you sure you want to delete this event? This action cannot be undone.
                            </p>
                            <div className="edm-confirm__actions">
                                <button
                                    className="edm-confirm__btn edm-confirm__btn--delete"
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                >
                                    {isDeleting ? "Deleting…" : "Delete"}
                                </button>
                                <button
                                    className="edm-confirm__btn edm-confirm__btn--cancel"
                                    onClick={() => setShowDeleteConfirm(false)}
                                    disabled={isDeleting}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EventDetailModal;
