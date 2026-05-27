"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { EventData } from "@/types/event";
import "./EventPageHero.css";

interface EventPageHeroProps {
    event: EventData;
    attendeeCount: number;
}

function formatHeroDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

const EventPageHero = ({ event, attendeeCount }: EventPageHeroProps) => {
    const fallbackImage = `https://eu.ui-avatars.com/api/?name=${encodeURIComponent(event.artistName)}&background=1ed760&color=000&size=800&bold=true`;
    const imageSrc = event.imageUrl ?? event.artistImageUrl ?? fallbackImage;

    const displayCount =
        attendeeCount >= 1000
            ? `${(attendeeCount / 1000).toFixed(1)}k`
            : attendeeCount.toLocaleString();

    return (
        <section className="eph">
            <Image
                src={imageSrc}
                alt={event.title}
                fill
                priority
                unoptimized
                className="eph__bg"
            />

            <div className="eph__overlay" />

            <Link href="/events" className="eph__back-btn">
                <ArrowLeft size={13} />
                Back
            </Link>

            <div className="eph__content">
                <Image
                    src={imageSrc}
                    alt=""
                    width={220}
                    height={220}
                    unoptimized
                    className="eph__thumb"
                />

                <div className="eph__meta">
                    <span className="eph__eyebrow">EVENT</span>
                    <h1 className="eph__title">{event.title}</h1>
                    <p className="eph__sub">
                        Hosted by <strong>{event.createdByDisplayName}</strong>
                        {" · "}
                        {formatHeroDate(event.eventDate)}
                        {" · "}
                        {displayCount} attending
                    </p>
                </div>
            </div>
        </section>
    );
};

export default EventPageHero;
