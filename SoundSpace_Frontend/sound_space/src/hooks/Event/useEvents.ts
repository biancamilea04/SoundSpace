"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { EventData } from "@/types/event";
import {
    fetchCreatedEvents,
    fetchFriendsEvents,
    fetchMyEvents,
    fetchPopularEvents,
    fetchRecommendedEvents,
} from "@/services/event/eventService";

interface UseEventRowResult {
    events: EventData[];
    isLoading: boolean;
    error: string | null;
    updateEvent: (updated: EventData) => void;
    addEvent: (event: EventData) => void;
    removeEvent: (id: string) => void;
}

function useEventRow(fetcher: () => Promise<EventData[]>): UseEventRowResult {
    const [events, setEvents] = useState<EventData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const hasFetched = useRef(false);

    const load = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await fetcher();
            setEvents(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load events");
        } finally {
            setIsLoading(false);
        }
    }, [fetcher]);

    useEffect(() => {
        if (hasFetched.current) return;
        hasFetched.current = true;
        load();
    }, [load]);

    const updateEvent = useCallback((updated: EventData) => {
        setEvents((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
    }, []);

    const addEvent = useCallback((event: EventData) => {
        setEvents((prev) => [event, ...prev]);
    }, []);

    const removeEvent = useCallback((id: string) => {
        setEvents((prev) => prev.filter((e) => e.id !== id));
    }, []);

    return { events, isLoading, error, updateEvent, addEvent, removeEvent };
}

export const usePopularEvents    = () => useEventRow(fetchPopularEvents);
export const useRecommendedEvents = () => useEventRow(fetchRecommendedEvents);
export const useFriendsEvents    = () => useEventRow(fetchFriendsEvents);
export const useMyEvents         = () => useEventRow(fetchMyEvents);
export const useCreatedEvents    = () => useEventRow(fetchCreatedEvents);
