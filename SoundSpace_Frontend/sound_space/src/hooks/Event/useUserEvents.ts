"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { EventData } from "@/types/event";
import { fetchUserEvents } from "@/services/event/eventService";

export interface UseUserEventsResult {
    events: EventData[];
    isLoading: boolean;
    error: string | null;
}

export function useUserEvents(userId: string | undefined): UseUserEventsResult {
    const [events, setEvents] = useState<EventData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fetchedFor = useRef<string | null>(null);

    const load = useCallback(async (id: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await fetchUserEvents(id);
            setEvents(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load events");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!userId || fetchedFor.current === userId) return;
        fetchedFor.current = userId;
        load(userId);
    }, [userId, load]);

    return { events, isLoading, error };
}
