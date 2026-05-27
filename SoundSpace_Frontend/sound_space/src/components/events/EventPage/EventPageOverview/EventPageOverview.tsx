"use client";

import Image from "next/image";
import { EventData } from "@/types/event";
import "./EventPageOverview.css";

interface EventPageOverviewProps {
    event: EventData;
    attendeeCount: number;
}

function formatStatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" }).toUpperCase();
}

function formatStatTime(timeStr: string): string {
    const [h, m] = timeStr.split(":");
    const d = new Date();
    d.setHours(Number(h), Number(m));
    return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

const EventPageOverview = ({ event, attendeeCount }: EventPageOverviewProps) => {
    const displayCount =
        attendeeCount >= 1000
            ? `${(attendeeCount / 1000).toFixed(1)}k`
            : String(attendeeCount);

    return (
        <div className="epo">
            {/* Description */}
            <section className="epo__section">
                <span className="epo__eyebrow">ABOUT THIS EVENT</span>
                <p className="epo__description">
                    {event.description ??
                        `Join us for an unforgettable night with ${event.artistName} at ${event.location} in ${event.city}. Be there for a night you won't forget.`}
                </p>
            </section>

            {/* 4-up stat grid */}
            <section className="epo__section">
                <div className="epo__stats">
                    <div className="epo__stat">
                        <span className="epo__stat-value">{displayCount}</span>
                        <span className="epo__stat-label">Attending</span>
                    </div>
                    <div className="epo__stat">
                        <span className="epo__stat-value">{formatStatDate(event.eventDate)}</span>
                        <span className="epo__stat-label">Date</span>
                    </div>
                    <div className="epo__stat">
                        <span className="epo__stat-value">{formatStatTime(event.eventTime)}</span>
                        <span className="epo__stat-label">Doors Open</span>
                    </div>
                    <div className="epo__stat">
                        <span className="epo__stat-value">{event.city}</span>
                        <span className="epo__stat-label">City</span>
                    </div>
                </div>
            </section>

            {/* Featured photos mosaic */}
            <section className="epo__section">
                <span className="epo__eyebrow">FEATURED PHOTOS</span>
                <div className="epo__photos-grid">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="epo__photo-tile">
                            <Image
                                src={`https://picsum.photos/seed/${event.id}-${i}/400/400`}
                                alt=""
                                fill
                                unoptimized
                                className="epo__photo-img"
                            />
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default EventPageOverview;
