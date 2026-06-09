"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import Header from "@/components/global/Header/Header";
import MenuSidebar from "@/components/global/MenuSidebar/MenuSidebar";
import {
    FormState,
    StepId,
    Updater,
    STEPS,
    Step1,
    Step2,
    Step3,
} from "@/components/events/EventForm/EventFormSteps";
import { fetchEventById, updateEvent } from "@/services/event/eventService";
import { uploadCoverPhoto, uploadPhotoFile } from "@/services/event/eventPhotoService";

function validateStep(form: FormState, s: StepId): string | null {
    if (s === 1 && !form.title.trim()) return "Event title is required.";
    if (s === 2) {
        if (!form.city.trim() || !form.country.trim())
            return "City and Country are required.";
        if (!form.date) return "Date is required.";
        if (!form.time) return "Start time is required.";
    }
    return null;
}

export default function EditEventPage() {
    const { eventId } = useParams<{ eventId: string }>();
    const router = useRouter();

    const [step, setStep] = useState<StepId>(1);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoadingEvent, setIsLoadingEvent] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [formError, setFormError] = useState<string | null>(null);

    const [form, setForm] = useState<FormState>({
        title: "",
        description: "",
        artistName: "",
        artistSpotifyId: null,
        artistImageUrl: null,
        address: "",
        latitude: null,
        longitude: null,
        venue: "",
        city: "",
        country: "",
        date: "",
        time: "",
        ticketsUrl: "",
        mainPhotoFile: null,
        existingImageUrl: null,
        galleryFiles: [],
    });

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            try {
                const event = await fetchEventById(eventId);
                if (cancelled) return;
                const [datePart] = event.eventDate.split("T");
                const timePart = event.eventTime.substring(0, 5);
                setForm({
                    title: event.title,
                    description: event.description ?? "",
                    artistName: event.artistName ?? "",
                    artistSpotifyId: event.artistSpotifyId,
                    artistImageUrl: event.artistImageUrl,
                    address: event.location,
                    latitude: event.latitude,
                    longitude: event.longitude,
                    venue: "",
                    city: event.city,
                    country: event.country,
                    date: datePart,
                    time: timePart,
                    ticketsUrl: event.ticketsUrl ?? "",
                    mainPhotoFile: null,
                    existingImageUrl: event.imageUrl,
                    galleryFiles: [],
                });
            } catch {
                if (!cancelled) setLoadError("Event not found or you don't have access.");
            } finally {
                if (!cancelled) setIsLoadingEvent(false);
            }
        };
        load();
        return () => { cancelled = true; };
    }, [eventId]);

    useEffect(() => { setFormError(null); }, [step]);

    const update: Updater = useCallback(
        (patch) => setForm((prev) => ({ ...prev, ...patch })),
        [],
    );

    const isStepAccessible = (id: StepId): boolean => {
        if (id === 1) return true;
        if (id === 2) return validateStep(form, 1) === null;
        return validateStep(form, 1) === null && validateStep(form, 2) === null;
    };

    const handleSave = async () => {
        setFormError(null);
        const step1Err = validateStep(form, 1);
        if (step1Err) { setFormError(step1Err); return; }
        const step2Err = validateStep(form, 2);
        if (step2Err) { setFormError(step2Err); return; }

        setIsSaving(true);
        try {
            let imageUrl: string | undefined = form.existingImageUrl ?? undefined;
            if (form.mainPhotoFile) {
                imageUrl = await uploadCoverPhoto(form.mainPhotoFile);
            }

            const location = [form.venue.trim(), form.address.trim()].filter(Boolean).join(", ") || form.city;

            await updateEvent(eventId, {
                title: form.title.trim(),
                imageUrl,
                artistName: form.artistName.trim() || undefined,
                artistSpotifyId: form.artistSpotifyId ?? undefined,
                artistImageUrl: form.artistImageUrl ?? undefined,
                location,
                city: form.city.trim(),
                country: form.country.trim(),
                eventDate: new Date(form.date).toISOString(),
                eventTime: `${form.time}:00`,
                description: form.description.trim() || undefined,
                ticketsUrl: form.ticketsUrl.trim() || undefined,
                latitude: form.latitude ?? undefined,
                longitude: form.longitude ?? undefined,
            });

            for (const file of form.galleryFiles) {
                await uploadPhotoFile(eventId, file);
            }

            router.push(`/events/${eventId}`);
        } catch (err) {
            const msg = err instanceof Error ? err.message : "";
            if (msg === "not_owner") {
                setFormError("You are not the creator of this event");
            } else {
                setFormError("Failed to save changes. Please try again");
            }
        } finally {
            setIsSaving(false);
        }
    };

    const goBack = () =>
        step === 1 ? router.push(`/events/${eventId}`) : setStep((s) => (s - 1) as StepId);

    const goForward = () => {
        if (step === 3) { handleSave(); return; }
        const err = validateStep(form, step);
        if (err) { setFormError(err); return; }
        setFormError(null);
        setStep((s) => (s + 1) as StepId);
    };

    if (isLoadingEvent) {
        return (
            <div className="ce-wrapper">
                <Header title="Edit Event" />
                <div className="ce-layout">
                    <MenuSidebar />
                    <main className="ce-main ce-main--centered">
                        <Loader2 size={28} className="ce-spinner ce-spinner--muted" />
                    </main>
                </div>
            </div>
        );
    }

    if (loadError) {
        return (
            <div className="ce-wrapper">
                <Header title="Edit Event" />
                <div className="ce-layout">
                    <MenuSidebar />
                    <main className="ce-main ce-main--centered">
                        <p className="ce-error-text">{loadError}</p>
                    </main>
                </div>
            </div>
        );
    }

    return (
        <div className="ce-wrapper">
            <Header title="Edit Event" />
            <div className="ce-layout">
                <MenuSidebar />
                <main className="ce-main">
                    <div className="ce-topbar">
                        <button className="ce-back-pill" onClick={goBack}>
                            <ArrowLeft size={14} />
                            <span>Back</span>
                        </button>
                        <span className="ce-topbar__title">Edit Event</span>
                        <div className="ce-topbar__spacer" />
                    </div>

                    <div className="ce-body">
                        <aside className="ce-stepnav">
                            {STEPS.map(({ id, label, hint, Icon }) => {
                                const isActive   = step === id;
                                const isDone     = step > id;
                                const accessible = isStepAccessible(id);
                                return (
                                    <button
                                        key={id}
                                        type="button"
                                        className={[
                                            "ce-stepnav__row",
                                            isActive    ? "ce-stepnav__row--active" : "",
                                            isDone      ? "ce-stepnav__row--done"   : "",
                                            !accessible ? "ce-stepnav__row--locked" : "",
                                        ].filter(Boolean).join(" ")}
                                        disabled={!accessible}
                                        onClick={() => setStep(id)}
                                    >
                                        <span className="ce-stepnav__text">
                                            <span className="ce-stepnav__label">{label}</span>
                                            <span className="ce-stepnav__hint">{hint}</span>
                                        </span>
                                        <Icon size={15} className="ce-stepnav__trail" />
                                    </button>
                                );
                            })}
                        </aside>

                        <div className="ce-content">
                            {step === 1 && <Step1 form={form} update={update} />}
                            {step === 2 && <Step2 form={form} update={update} />}
                            {step === 3 && <Step3 form={form} update={update} />}

                            <div className="ce-footer">
                                <button
                                    type="button"
                                    className="ce-footer__cancel"
                                    onClick={goBack}
                                    disabled={isSaving}
                                >
                                    {step === 1 ? "Cancel" : "Back"}
                                </button>

                                <div className="ce-footer__actions">
                                    {formError && <div className="ce-error-banner">{formError}</div>}
                                    <button
                                        type="button"
                                        className={`ce-footer__continue${step === 3 ? " ce-footer__continue--publish" : ""}`}
                                        onClick={goForward}
                                        disabled={isSaving}
                                    >
                                        {isSaving ? (
                                            <span className="ce-footer__saving">
                                                <Loader2 size={16} className="ce-spinner" />
                                                Saving…
                                            </span>
                                        ) : step === 3 ? "Save Changes" : "Continue"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
