"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
import { uploadCoverPhoto, uploadPhotoFile } from "@/services/event/eventPhotoService";
import { createEvent } from "@/services/event/eventService";

const INITIAL_FORM: FormState = {
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
};

function validateStep(form: FormState, s: StepId): string | null {
    if (s === 1 && !form.title.trim()) return "Event title is required.";
    if (s === 2) {
        if (!form.city.trim() || !form.country.trim())
            return "Please select a location on the map — City and Country are required.";
        if (!form.date) return "Date is required.";
        if (!form.time) return "Start time is required.";
    }
    return null;
}

export default function CreateEventPage() {
    const router = useRouter();
    const [step, setStep] = useState<StepId>(1);
    const [isPublishing, setIsPublishing] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [form, setForm] = useState<FormState>(INITIAL_FORM);

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

    const handlePublish = async () => {
        setFormError(null);
        const step1Err = validateStep(form, 1);
        if (step1Err) { setFormError(step1Err); return; }
        const step2Err = validateStep(form, 2);
        if (step2Err) { setFormError(step2Err); return; }

        setIsPublishing(true);
        try {
            const imageUrl = form.mainPhotoFile
                ? await uploadCoverPhoto(form.mainPhotoFile)
                : undefined;

            const location = [form.venue.trim(), form.address.trim()].filter(Boolean).join(", ") || form.city;

            const event = await createEvent({
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
                await uploadPhotoFile(event.id, file);
            }

            router.push(`/events/${event.id}`);
        } catch (err) {
            setFormError(err instanceof Error ? err.message : "Failed to publish event. Please try again.");
        } finally {
            setIsPublishing(false);
        }
    };

    const goBack = () =>
        step === 1 ? router.push("/") : setStep((s) => (s - 1) as StepId);

    const goForward = () => {
        if (step === 3) { handlePublish(); return; }
        const err = validateStep(form, step);
        if (err) { setFormError(err); return; }
        setFormError(null);
        setStep((s) => (s + 1) as StepId);
    };

    return (
        <div className="ce-wrapper">
            <Header title="New Event" />
            <div className="ce-layout">
                <MenuSidebar />
                <main className="ce-main">
                    <div className="ce-topbar">
                        <button className="ce-back-pill" onClick={goBack}>
                            <ArrowLeft size={14} />
                            <span>Back</span>
                        </button>
                        <span className="ce-topbar__title">New Event</span>
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
                                    disabled={isPublishing}
                                >
                                    {step === 1 ? "Cancel" : "Back"}
                                </button>

                                <div className="ce-footer__actions">
                                    {formError && <div className="ce-error-banner">{formError}</div>}
                                    <button
                                        type="button"
                                        className={`ce-footer__continue${step === 3 ? " ce-footer__continue--publish" : ""}`}
                                        onClick={goForward}
                                        disabled={isPublishing}
                                    >
                                        {isPublishing ? (
                                            <span className="ce-footer__saving">
                                                <Loader2 size={16} className="ce-spinner" />
                                                Publishing…
                                            </span>
                                        ) : step === 3 ? "Publish Event" : "Continue"}
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
