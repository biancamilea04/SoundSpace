"use client";

import { Suspense, useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import Header from "@/components/global/Header/Header";
import MenuSidebar from "@/components/global/MenuSidebar/MenuSidebar";
import EventPageHero from "@/components/events/EventPage/EventPageHero/EventPageHero";
import EventPageActionBar from "@/components/events/EventPage/EventPageActionBar/EventPageActionBar";
import EventPageOverview from "@/components/events/EventPage/EventPageOverview/EventPageOverview";
import EventPageChat from "@/components/events/EventPage/EventPageChat/EventPageChat";
import EventPagePosts from "@/components/events/EventPage/EventPagePosts/EventPagePosts";
import EventPagePhotos from "@/components/events/EventPage/EventPagePhotos/EventPagePhotos";
import EventPageSidebar from "@/components/events/EventPage/EventPageSidebar/EventPageSidebar";
import EventGate from "@/components/events/EventPage/EventGate/EventGate";
import ChatGatePreview from "@/components/events/EventPage/EventGate/ChatGatePreview";
import PostsGatePreview from "@/components/events/EventPage/EventGate/PostsGatePreview";
import { fetchEventById, fetchEventAttendees, toggleAttendance } from "@/services/event/eventService";
import { EventAttendee, EventData } from "@/types/event";
import "./page.css";

type TabId = "overview" | "chat" | "posts" | "photos";

function EventDetailPageContent() {
    const params  = useParams<{ eventId: string }>();
    const eventId = params?.eventId ?? "";

    const [event, setEvent]               = useState<EventData | null>(null);
    const [isLoading, setIsLoading]       = useState(true);
    const [notFound, setNotFound]         = useState(false);
    const [activeTab, setActiveTab]       = useState<TabId>("overview");
    const [isAttending, setIsAttending]   = useState(false);
    const [attendeeCount, setAttendeeCount] = useState(0);
    const [attendees, setAttendees]       = useState<EventAttendee[]>([]);
    const [isBarSticky, setIsBarSticky]   = useState(false);
    const [isPending, setIsPending]       = useState(false);

    const sentinelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!eventId) return;
        let cancelled = false;
        setIsLoading(true);
        setNotFound(false);

        Promise.all([
            fetchEventById(eventId),
            fetchEventAttendees(eventId, 3),
        ])
            .then(([data, topAttendees]) => {
                if (cancelled) return;
                setEvent(data);
                setIsAttending(data.isAttendedByCurrentUser);
                setAttendeeCount(data.attendeeCount);
                setAttendees(topAttendees);
                setIsLoading(false);
            })
            .catch((err: Error) => {
                if (cancelled) return;
                if (err.message === "not_found") setNotFound(true);
                setIsLoading(false);
            });

        return () => { cancelled = true; };
    }, [eventId]);

    useEffect(() => {
        const el = sentinelRef.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            ([entry]) => setIsBarSticky(!entry.isIntersecting),
            { threshold: 0 }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    const handleAttendToggle = async () => {
        if (isPending || !event) return;
        const wasAttending = isAttending;

        setIsAttending(!wasAttending);
        setAttendeeCount((c) => wasAttending ? c - 1 : c + 1);
        setIsPending(true);
        try {
            await toggleAttendance(event.id);
            fetchEventAttendees(event.id, 3).then(setAttendees);
        } catch {
            setIsAttending(wasAttending);
            setAttendeeCount((c) => wasAttending ? c + 1 : c - 1);
        } finally {
            setIsPending(false);
        }
    };

    if (isLoading) {
        return (
            <div className="edp-wrapper">
                <div className="edp-loading">
                    <Loader2 size={28} className="edp-loading__spinner" />
                </div>
            </div>
        );
    }

    if (notFound || !event) {
        return (
            <div className="edp-wrapper">
                <div className="edp-not-found">Event not found.</div>
            </div>
        );
    }

    return (
        <div className="edp-wrapper">
            <Header title={event.title} />
            <div className="edp-layout">
                <MenuSidebar />
                <main className="edp-main">
                    <EventPageHero event={event} attendeeCount={attendeeCount} />

                    <div ref={sentinelRef} className="edp-sentinel" />

                    <EventPageActionBar
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                        isSticky={isBarSticky}
                        isAttending={isAttending}
                        onAttendToggle={handleAttendToggle}
                        isPending={isPending}
                    />

                    <div className="edp-content">
                        <div className="edp-content__left">
                            <div className="edp-tab-content" key={activeTab}>
                                {activeTab === "overview" && (
                                    <EventPageOverview event={event} />
                                )}
                                {activeTab === "chat" && (
                                    <EventGate
                                        isLocked={!isAttending}
                                        onAttend={handleAttendToggle}
                                        isPending={isPending}
                                        description="Attend this event to join the live chat with other attendees"
                                        preview={<ChatGatePreview />}
                                    >
                                        <EventPageChat eventId={eventId} />
                                    </EventGate>
                                )}
                                {activeTab === "posts" && (
                                    <EventGate
                                        isLocked={!isAttending}
                                        onAttend={handleAttendToggle}
                                        isPending={isPending}
                                        description="Attend this event to post and interact with the community"
                                        preview={<PostsGatePreview />}
                                    >
                                        <EventPagePosts eventId={eventId} />
                                    </EventGate>
                                )}
                                {activeTab === "photos" && (
                                    <EventGate
                                        isLocked={!isAttending}
                                        onAttend={handleAttendToggle}
                                        isPending={isPending}
                                        description="Attend this event to upload and browse crowd photos"
                                        preview={<EventPagePhotos eventId={eventId} isPreview />}
                                    >
                                        <EventPagePhotos eventId={eventId} />
                                    </EventGate>
                                )}
                            </div>
                        </div>

                        <EventPageSidebar
                            event={event}
                            isAttending={isAttending}
                            attendeeCount={attendeeCount}
                            attendees={attendees}
                            onAttendToggle={handleAttendToggle}
                            isPending={isPending}
                        />
                    </div>
                </main>
            </div>
        </div>
    );
}

export default function EventDetailPage() {
    return (
        <Suspense fallback={<div className="edp-loading">Loading event…</div>}>
            <EventDetailPageContent />
        </Suspense>
    );
}
