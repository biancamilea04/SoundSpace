"use client";

import { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";
import { createEvent } from "@/services/event/eventService";
import { EventData } from "@/types/event";
import "./CreateEventModal.css";

interface CreateEventModalProps {
    onClose: () => void;
    onCreated: (event: EventData) => void;
}

interface FormFields {
    title: string;
    artistName: string;
    artistSpotifyId: string;
    location: string;
    city: string;
    country: string;
    eventDate: string;
    eventTime: string;
    description: string;
    ticketsUrl: string;
    artistProfileUrl: string;
    imageUrl: string;
}

const EMPTY: FormFields = {
    title: "", artistName: "", artistSpotifyId: "",
    location: "", city: "", country: "",
    eventDate: "", eventTime: "",
    description: "", ticketsUrl: "", artistProfileUrl: "", imageUrl: "",
};

const CreateEventModal = ({ onClose, onCreated }: CreateEventModalProps) => {
    const [fields, setFields] = useState<FormFields>(EMPTY);
    const [errors, setErrors] = useState<Partial<FormFields>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const overlayRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [onClose]);

    const set = (field: keyof FormFields) =>
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
            setFields((prev) => ({ ...prev, [field]: e.target.value }));

    function validate(): boolean {
        const next: Partial<FormFields> = {};
        if (!fields.title.trim()) next.title = "Title is required";
        if (!fields.artistName.trim()) next.artistName = "Artist is required";
        if (!fields.location.trim()) next.location = "Location is required";
        if (!fields.city.trim()) next.city = "City is required";
        if (!fields.country.trim()) next.country = "Country is required";
        if (!fields.eventDate) next.eventDate = "Date is required";
        if (!fields.eventTime) next.eventTime = "Time is required";
        setErrors(next);
        return Object.keys(next).length === 0;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate() || isSubmitting) return;

        setIsSubmitting(true);
        try {
            const ev = await createEvent({
                title: fields.title.trim(),
                artistName: fields.artistName.trim(),
                artistSpotifyId: fields.artistSpotifyId.trim() || undefined,
                location: fields.location.trim(),
                city: fields.city.trim(),
                country: fields.country.trim(),
                eventDate: new Date(fields.eventDate).toISOString(),
                eventTime: fields.eventTime + ":00",
                description: fields.description.trim() || undefined,
                ticketsUrl: fields.ticketsUrl.trim() || undefined,
                artistProfileUrl: fields.artistProfileUrl.trim() || undefined,
                imageUrl: fields.imageUrl.trim() || undefined,
            });
            onCreated(ev);
            onClose();
        } catch {
            setErrors({ title: "Failed to create event. Please try again." });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === overlayRef.current) onClose();
    };

    return (
        <div className="cem-overlay" ref={overlayRef} onClick={handleOverlayClick}>
            <div className="cem-modal" role="dialog" aria-modal="true" aria-label="Create Event">
                <div className="cem-header">
                    <h2 className="cem-title">Create Event</h2>
                    <button className="cem-close" onClick={onClose} aria-label="Close modal">
                        <X size={20} />
                    </button>
                </div>

                <form className="cem-form" onSubmit={handleSubmit} noValidate>
                    <div className="cem-row">
                        <Field label="Event Title *" error={errors.title}>
                            <input className="cem-input" placeholder="e.g. World Tour 2025" value={fields.title} onChange={set("title")} />
                        </Field>
                    </div>

                    <div className="cem-row cem-row--2col">
                        <Field label="Artist Name *" error={errors.artistName}>
                            <input className="cem-input" placeholder="e.g. Radiohead" value={fields.artistName} onChange={set("artistName")} />
                        </Field>
                        <Field label="Artist Spotify ID">
                            <input className="cem-input" placeholder="Spotify artist ID" value={fields.artistSpotifyId} onChange={set("artistSpotifyId")} />
                        </Field>
                    </div>

                    <div className="cem-row">
                        <Field label="Venue / Location *" error={errors.location}>
                            <input className="cem-input" placeholder="e.g. Madison Square Garden" value={fields.location} onChange={set("location")} />
                        </Field>
                    </div>

                    <div className="cem-row cem-row--2col">
                        <Field label="City *" error={errors.city}>
                            <input className="cem-input" placeholder="e.g. New York" value={fields.city} onChange={set("city")} />
                        </Field>
                        <Field label="Country *" error={errors.country}>
                            <input className="cem-input" placeholder="e.g. USA" value={fields.country} onChange={set("country")} />
                        </Field>
                    </div>

                    <div className="cem-row cem-row--2col">
                        <Field label="Date *" error={errors.eventDate}>
                            <input className="cem-input" type="date" value={fields.eventDate} onChange={set("eventDate")} />
                        </Field>
                        <Field label="Time *" error={errors.eventTime}>
                            <input className="cem-input" type="time" value={fields.eventTime} onChange={set("eventTime")} />
                        </Field>
                    </div>

                    <div className="cem-row">
                        <Field label="Description">
                            <textarea
                                className="cem-input cem-textarea"
                                placeholder="Describe the event..."
                                rows={3}
                                value={fields.description}
                                onChange={set("description")}
                            />
                        </Field>
                    </div>

                    <div className="cem-row cem-row--2col">
                        <Field label="Tickets URL">
                            <input className="cem-input" type="url" placeholder="https://..." value={fields.ticketsUrl} onChange={set("ticketsUrl")} />
                        </Field>
                        <Field label="Artist Profile URL">
                            <input className="cem-input" type="url" placeholder="https://..." value={fields.artistProfileUrl} onChange={set("artistProfileUrl")} />
                        </Field>
                    </div>

                    <div className="cem-row">
                        <Field label="Event Image URL">
                            <input className="cem-input" type="url" placeholder="https://..." value={fields.imageUrl} onChange={set("imageUrl")} />
                        </Field>
                    </div>

                    <div className="cem-actions">
                        <button type="button" className="cem-btn cem-btn--cancel" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="cem-btn cem-btn--submit" disabled={isSubmitting}>
                            {isSubmitting ? "Creating…" : "Create Event"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

interface FieldProps {
    label: string;
    error?: string;
    children: React.ReactNode;
}

const Field = ({ label, error, children }: FieldProps) => (
    <div className="cem-field">
        <label className="cem-label">{label}</label>
        {children}
        {error && <span className="cem-error">{error}</span>}
    </div>
);

export default CreateEventModal;
