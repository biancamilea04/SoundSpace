"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search } from "lucide-react";
import Header from "@/components/global/Header/Header";
import MenuSidebar from "@/components/global/MenuSidebar/MenuSidebar";
import EventRow from "@/components/events/EventRow/EventRow";
import EventDetailModal from "@/components/events/EventDetailModal/EventDetailModal";
import {
    usePopularEvents,
    useRecommendedEvents,
    useFriendsEvents,
    useMyEvents,
} from "@/hooks/Event/useEvents";
import { EventData } from "@/types/event";
import "./page.css";

const SECTION_FILTERS = [
    { id: "all", label: "All" },
    { id: "popular", label: "Popular Events" },
    { id: "artists", label: "Events from Your Artists" },
    { id: "friends", label: "Friends are Going" },
    { id: "mine", label: "Your Events" },
] as const;

type SectionFilterId = (typeof SECTION_FILTERS)[number]["id"];

function applySearch(events: EventData[], query: string): EventData[] {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return events;

    return events.filter((event) => {
        const haystack = [
            event.title,
            event.artistName,
            event.location,
            event.city,
            event.country,
        ];
        return haystack.some((value) => value?.toLowerCase().includes(normalized));
    });
}

function EventsContent() {
    const router = useRouter();
    const [selectedSection, setSelectedSection] = useState<SectionFilterId>("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);

    const popular    = usePopularEvents();
    const recommended = useRecommendedEvents();
    const friends    = useFriendsEvents();
    const mine       = useMyEvents();

    const updateEvent = (updated: EventData) => {
        popular.updateEvent(updated);
        recommended.updateEvent(updated);
        friends.updateEvent(updated);
        mine.updateEvent(updated);
        setSelectedEvent((prev) => (prev?.id === updated.id ? updated : prev));
    };

    const handleEventDeleted = (eventId: string) => {
        popular.removeEvent(eventId);
        recommended.removeEvent(eventId);
        friends.removeEvent(eventId);
        mine.removeEvent(eventId);
        setSelectedEvent(null);
    };

    const filteredPopular    = useMemo(() => applySearch(popular.events, searchQuery),     [popular.events, searchQuery]);
    const filteredArtists    = useMemo(() => applySearch(recommended.events, searchQuery), [recommended.events, searchQuery]);
    const filteredFriends    = useMemo(() => applySearch(friends.events, searchQuery),     [friends.events, searchQuery]);
    const filteredMine       = useMemo(() => applySearch(mine.events, searchQuery),        [mine.events, searchQuery]);

    const showAll = selectedSection === "all";

    return (
        <div className="ep-wrapper">
            <Header title="Events" />
            <div className="ep-layout">
                <MenuSidebar />
                <main className="ep-main">
                    {/* Hero */}
                    <section className="ep-hero">
                        <div className="ep-hero__text">
                            <h1 className="ep-hero__title">All Around The World</h1>
                            <p className="ep-hero__subtitle">
                                Discover live events, concerts, and festivals near you
                            </p>
                        </div>
                        <div className="ep-filterbar__actions">
                            <label className="ep-search">
                                <Search size={16} className="ep-search__icon" />
                                <input
                                    type="search"
                                    className="ep-search__input"
                                    placeholder="Search events"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </label>
                            <button className="ep-create-btn" onClick={() => router.push("/events/create")}>
                                <Plus size={16} />
                                Create Event
                            </button>
                        </div>
                    </section>

                    {/* Filter bar */}
                    <div className="ep-filterbar">
                        <div className="ep-pills">
                            {SECTION_FILTERS.map((section) => (
                                <button
                                    key={section.id}
                                    className={`ep-pill ${selectedSection === section.id ? "ep-pill--active" : ""}`}
                                    onClick={() => setSelectedSection(section.id)}
                                >
                                    {section.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Sections */}
                    {(showAll || selectedSection === "popular") && (
                        <EventRow
                            title="Popular Events"
                            events={filteredPopular}
                            isLoading={popular.isLoading}
                            onEventUpdated={updateEvent}
                            onEventClick={setSelectedEvent}
                        />
                    )}
                    {(showAll || selectedSection === "artists") && (
                        <EventRow
                            title="Events from Your Artists"
                            events={filteredArtists}
                            isLoading={recommended.isLoading}
                            onEventUpdated={updateEvent}
                            onEventClick={setSelectedEvent}
                        />
                    )}
                    {(showAll || selectedSection === "friends") && (
                        <EventRow
                            title="Friends are Going"
                            events={filteredFriends}
                            isLoading={friends.isLoading}
                            onEventUpdated={updateEvent}
                            onEventClick={setSelectedEvent}
                        />
                    )}
                    {(showAll || selectedSection === "mine") && (
                        <EventRow
                            title="Your Events"
                            events={filteredMine}
                            isLoading={mine.isLoading}
                            onEventUpdated={updateEvent}
                            onEventClick={setSelectedEvent}
                        />
                    )}
                </main>
            </div>

            {selectedEvent && (
                <EventDetailModal
                    event={selectedEvent}
                    onClose={() => setSelectedEvent(null)}
                    onEventUpdated={updateEvent}
                    onEventDeleted={handleEventDeleted}
                />
            )}

        </div>
    );
}

export default function EventsPage() {
    return (
        <Suspense fallback={<div>Loading Events…</div>}>
            <EventsContent />
        </Suspense>
    );
}
