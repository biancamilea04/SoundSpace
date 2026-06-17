"use client";

import { useState } from "react";
import { EventData } from "@/types/event";
import { toggleAttendance } from "@/services/event/eventService";
import "./AttendButton.css";

interface AttendButtonProps {
    event: EventData;
    onEventUpdated: (updated: EventData) => void;
}

const AttendButton = ({ event, onEventUpdated }: AttendButtonProps) => {
    const [isPending, setIsPending] = useState(false);

    const handleClick = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isPending) return;

        const wasAttending = event.isAttendedByCurrentUser;

        onEventUpdated({
            ...event,
            isAttendedByCurrentUser: !wasAttending,
            attendeeCount: wasAttending ? event.attendeeCount - 1 : event.attendeeCount + 1,
        });

        setIsPending(true);
        try {
            const result = await toggleAttendance(event.id);
            onEventUpdated({
                ...event,
                isAttendedByCurrentUser: result.isAttending,
                attendeeCount: result.isAttending
                    ? event.attendeeCount + 1
                    : event.attendeeCount - 1,
            });
        } catch {
            onEventUpdated(event);
        } finally {
            setIsPending(false);
        }
    };

    return (
        <button
            className={`attend-btn ${event.isAttendedByCurrentUser ? "attend-btn--attending" : "attend-btn--default"}`}
            onClick={handleClick}
            disabled={isPending}
            aria-label={event.isAttendedByCurrentUser ? "Leave event" : "Attend event"}
        >
            {event.isAttendedByCurrentUser ? "Attending" : "Attend"}
        </button>
    );
};

export default AttendButton;
