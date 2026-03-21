"use client";

import { useEffect, useState, useRef } from "react";
import {
    HubConnectionBuilder,
    HubConnectionState,
    LogLevel,
    HubConnection,
} from "@microsoft/signalr";
import { NowPlayingData } from "@/types/nowPlaying";

// ── Constants ──────────────────────────────────────────────────────────
const TOKEN_KEY = "auth_token";
const BACKEND_URL =
    process.env.NEXT_PUBLIC_BACKEND_API_URL || "https://localhost:7050";
const SIGNALR_HUB = `${BACKEND_URL}/hubs/spotify`;
const REST_ENDPOINT = "/api/spotify/last-played";
const LOCAL_TICK_MS = 1_000;

// ── Return type ────────────────────────────────────────────────────────
interface UseSpotifyStatusResult {
    nowPlaying: NowPlayingData | null;
    isLoading: boolean;
}

// ── Hook ───────────────────────────────────────────────────────────────
export const useSpotifyStatus = (): UseSpotifyStatusResult => {
    const [nowPlaying, setNowPlaying] = useState<NowPlayingData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Ref kept in sync for the local-tick effect (avoids stale closures)
    const nowPlayingRef = useRef<NowPlayingData | null>(null);
    const connectionRef = useRef<HubConnection | null>(null);

    // ── Primary effect: REST fetch + SignalR connection ────────────────
    useEffect(() => {
        let isMounted = true; // prevents state updates after unmount

        const token = localStorage.getItem(TOKEN_KEY);
        if (!token) {
            setIsLoading(false);
            return;
        }

        // ── 1. Instant fetch (fallback) ────────────────────────────────
        const fetchLastPlayed = async () => {
            try {
                const res = await fetch(REST_ENDPOINT, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!res.ok) {
                    console.error(
                        `[useSpotifyStatus] REST fetch failed: ${res.status}`
                    );
                    return;
                }

                const data: NowPlayingData = await res.json();

                // REST data represents the *last* played track, never live
                const withPausedFlag: NowPlayingData = {
                    ...data,
                    isPlaying: false,
                };

                if (isMounted) {
                    setNowPlaying(withPausedFlag);
                    nowPlayingRef.current = withPausedFlag;
                    setIsLoading(false);
                }
            } catch (err) {
                console.error("[useSpotifyStatus] REST fetch error:", err);
                if (isMounted) setIsLoading(false);
            }
        };

        // ── 2. Live connection (SignalR) ───────────────────────────────
        const connection = new HubConnectionBuilder()
            .withUrl(SIGNALR_HUB, {
                accessTokenFactory: () => token,
            })
            .configureLogging(LogLevel.Information)
            .withAutomaticReconnect()
            .build();

        connectionRef.current = connection;

        // Live overwrite: a new track (or resumed playback) arrives
        connection.on("ReceiveNowPlaying", (data: NowPlayingData | null) => {
            if (!isMounted) return;

            if (data) {
                const liveData: NowPlayingData = { ...data, isPlaying: true };
                setNowPlaying(liveData);
                nowPlayingRef.current = liveData;
            } else {
                setNowPlaying(null);
                nowPlayingRef.current = null;
            }
            setIsLoading(false);
        });

        // Pause event: mark the current track as no longer playing
        connection.on("ReceivePause", () => {
            if (!isMounted) return;

            setNowPlaying((prev) => {
                if (!prev) return prev;
                const paused: NowPlayingData = { ...prev, isPlaying: false };
                nowPlayingRef.current = paused;
                return paused;
            });
        });

        const startConnection = async () => {
            try {
                await connection.start();
                console.log("[useSpotifyStatus] SignalR connected.");
            } catch (err) {
                console.error(
                    "[useSpotifyStatus] SignalR connection error:",
                    err
                );
                if (isMounted) setIsLoading(false);
            }
        };

        // Fire both in parallel – the first one to resolve populates the UI
        fetchLastPlayed();
        startConnection();

        // ── Cleanup (React 18 Strict-Mode safe) ───────────────────────
        return () => {
            isMounted = false;

            connection.off("ReceiveNowPlaying");
            connection.off("ReceivePause");

            // Only attempt to stop if we actually reached the Connected state.
            // This avoids the "connection was stopped during negotiation" error
            // that React 18 Strict Mode causes with rapid mount/unmount cycles.
            if (connection.state === HubConnectionState.Connected) {
                connection.stop().catch((err) =>
                    console.error(
                        "[useSpotifyStatus] Error stopping SignalR:",
                        err
                    )
                );
            }

            connectionRef.current = null;
        };
    }, []);

    // ── Local progress tick (client-side interpolation) ────────────────
    useEffect(() => {
        const tickId = setInterval(() => {
            const current = nowPlayingRef.current;

            if (current && current.isPlaying) {
                const newProgress = Math.min(
                    current.progressMs + LOCAL_TICK_MS,
                    current.durationMs
                );

                const updated: NowPlayingData = {
                    ...current,
                    progressMs: newProgress,
                };

                nowPlayingRef.current = updated;
                setNowPlaying(updated);
            }
        }, LOCAL_TICK_MS);

        return () => clearInterval(tickId);
    }, []);

    return { nowPlaying, isLoading };
};