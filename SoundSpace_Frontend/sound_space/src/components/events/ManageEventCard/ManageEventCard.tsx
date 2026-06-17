"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { MapPin, Pencil, Trash2 } from "lucide-react";
import { EventData } from "@/types/event";
import { deleteEvent } from "@/services/event/eventService";
import "./ManageEventCard.css";

interface ManageEventCardProps {
    event: EventData;
    onEventRemoved: (id: string) => void;
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

const ManageEventCard = ({ event, onEventRemoved }: ManageEventCardProps) => {
    const router = useRouter();
    const [isConfirming, setIsConfirming] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const fallbackImage = `https://eu.ui-avatars.com/api/?name=${encodeURIComponent(event.artistName ?? event.title)}&background=1ed760&color=000&size=300&bold=true`;
    const imageSrc = event.imageUrl ?? event.artistImageUrl ?? fallbackImage;

    const handleEdit = () => router.push(`/events/${event.id}/edit`);

    const handleDeleteConfirm = async () => {
        setIsDeleting(true);
        try {
            await deleteEvent(event.id);
            onEventRemoved(event.id);
        } catch {
            setIsConfirming(false);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="mec">
            <div className="mec__image-wrapper">
                <Image
                    src={imageSrc}
                    alt={event.title}
                    fill
                    sizes="(max-width: 768px) 160px, 200px"
                    className="mec__image"
                    unoptimized
                />
            </div>

            <div className="mec__body">
                <p className="mec__artist">{event.artistName}</p>
                <h3 className="mec__title">{event.title}</h3>
                <p className="mec__date">
                    {formatEventDate(event.eventDate)} · {formatEventTime(event.eventTime)}
                </p>
                <p className="mec__location">
                    <MapPin size={12} className="mec__location-icon" />
                    {event.city}, {event.country}
                </p>

                {isConfirming ? (
                    <div className="mec__confirm">
                        <span className="mec__confirm-text">Delete this event?</span>
                        <div className="mec__confirm-row">
                            <button
                                type="button"
                                className="mec__confirm-cancel"
                                onClick={() => setIsConfirming(false)}
                                disabled={isDeleting}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="mec__confirm-delete"
                                onClick={handleDeleteConfirm}
                                disabled={isDeleting}
                            >
                                {isDeleting ? "Deleting…" : "Delete"}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="mec__actions">
                        <button
                            type="button"
                            className="mec__action-btn mec__action-btn--edit"
                            onClick={handleEdit}
                        >
                            <Pencil size={12} />
                            Edit
                        </button>
                        <button
                            type="button"
                            className="mec__action-btn mec__action-btn--delete"
                            onClick={() => setIsConfirming(true)}
                        >
                            <Trash2 size={12} />
                            Delete
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageEventCard;
