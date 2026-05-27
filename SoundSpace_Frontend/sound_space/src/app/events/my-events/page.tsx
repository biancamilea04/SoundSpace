"use client";

import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Header from "@/components/global/Header/Header";
import MenuSidebar from "@/components/global/MenuSidebar/MenuSidebar";
import EventCard from "@/components/events/EventCard/EventCard";
import { useMyEvents } from "@/hooks/Event/useEvents";
import "./page.css";

function MyEventsContent() {
    const { events, isLoading, updateEvent } = useMyEvents();

    return (
        <div className="my-events__wrapper">
            <Header title="My Events" />
            <div className="my-events__layout">
                <MenuSidebar />
                <main className="my-events__main">
                    <div className="my-events__topbar">
                        <Link href="/events" className="my-events__back">
                            <ArrowLeft size={16} />
                            All Events
                        </Link>
                        <h1 className="my-events__heading">My Events</h1>
                    </div>

                    {isLoading && (
                        <div className="my-events__grid">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <div key={i} className="my-events__skeleton" />
                            ))}
                        </div>
                    )}

                    {!isLoading && events.length === 0 && (
                        <div className="my-events__empty">
                            <p className="my-events__empty-text">You haven&apos;t joined any events yet.</p>
                            <Link href="/events" className="my-events__browse-btn">
                                Browse Events
                            </Link>
                        </div>
                    )}

                    {!isLoading && events.length > 0 && (
                        <div className="my-events__grid">
                            {events.map((event) => (
                                <EventCard
                                    key={event.id}
                                    event={event}
                                    onEventUpdated={updateEvent}
                                />
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

export default function MyEventsPage() {
    return (
        <Suspense fallback={<div>Loading…</div>}>
            <MyEventsContent />
        </Suspense>
    );
}
