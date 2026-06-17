"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { EventData, EventPhoto } from "@/types/event";
import { fetchEventPhotos } from "@/services/event/eventPhotoService";
import "./EventPageOverview.css";

const EventMap = dynamic(() => import("@/components/map/EventMap"), { ssr: false });

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_API_URL ?? "";
const MOSAIC_COUNT = 8;

interface EventPageOverviewProps {
    event: EventData;
}

const EventPageOverview = ({ event }: EventPageOverviewProps) => {
    const [photos, setPhotos] = useState<EventPhoto[]>([]);

    useEffect(() => {
        let cancelled = false;
        fetchEventPhotos(event.id)
            .then((data) => { if (!cancelled) setPhotos(data); })
            .catch(() => {});
        return () => { cancelled = true; };
    }, [event.id]);

    return (
        <div className="epo">
            <section className="epo__section">
                <span className="epo__eyebrow">ABOUT THIS EVENT</span>
                <p className="epo__description">
                    {event.description ??
                        `Join us for ${event.title}${event.artistName ? ` featuring ${event.artistName}` : ""} live at ${event.location}, ${event.city}. An unmissable night of music and energy.`}
                </p>
            </section>

            {event.latitude !== null && event.longitude !== null && (
                <section className="epo__section">
                    <span className="epo__eyebrow">LOCATION</span>
                    <div className="epo__map-container">
                        <EventMap lat={event.latitude} lng={event.longitude} />
                    </div>
                </section>
            )}

            {/* Featured photos mosaic */}
            {photos.length > 0 && (
                <section className="epo__section">
                    <span className="epo__eyebrow">PHOTOS</span>
                    <div className="epo__photos-grid">
                        {photos.slice(0, MOSAIC_COUNT).map((photo) => (
                            <div key={photo.id} className="epo__photo-tile">
                                <img
                                    src={`${BACKEND}${photo.filePath}`}
                                    alt={`Photo by ${photo.uploaderDisplayName}`}
                                    className="epo__photo-img"
                                />
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
};

export default EventPageOverview;
