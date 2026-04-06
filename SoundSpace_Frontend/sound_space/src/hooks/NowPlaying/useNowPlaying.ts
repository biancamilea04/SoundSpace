"use client";

import { useEffect, useState, useRef } from "react";
import {
    HubConnectionBuilder,
    HubConnectionState,
    LogLevel,
    HubConnection,
} from "@microsoft/signalr";
import { NowPlayingData } from "@/types/nowPlaying";
import { getAccessTokenCookie } from "@/services/auth/authService";
import { apiFetch } from "@/lib/apiClient";

const BACKEND_URL =
    process.env.NEXT_PUBLIC_BACKEND_API_URL || "https://localhost:7050";
const SIGNALR_HUB = `${BACKEND_URL}/hubs/spotify`;
const REST_ENDPOINT = "/api/spotify/last-played";
const LOCAL_TICK_MS = 1_000;

interface UseSpotifyStatusResult {
    nowPlaying: NowPlayingData | null;
    isLoading: boolean;
}

export const useSpotifyStatus = (): UseSpotifyStatusResult => {
    const [nowPlaying, setNowPlaying] = useState<NowPlayingData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const nowPlayingRef = useRef<NowPlayingData | null>(null);
    const connectionRef = useRef<HubConnection | null>(null);

    useEffect(() => {
        let isMounted = true;

        const token = getAccessTokenCookie();
        if (!token) {
            setIsLoading(false);
            return;
        }

        const fetchLastPlayed = async () => {
            try {
                const res = await apiFetch(REST_ENDPOINT);

                if (!res.ok) {
                    console.error(
                        `[useSpotifyStatus] REST fetch failed: ${res.status}`
                    );
                    return;
                }

                const data: NowPlayingData = await res.json();

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

        const connection = new HubConnectionBuilder()
            .withUrl(SIGNALR_HUB, {
                accessTokenFactory: () => token,
            })
            .configureLogging(LogLevel.Information)
            .withAutomaticReconnect()
            .build();

        connectionRef.current = connection;

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

        fetchLastPlayed();
        startConnection();

        return () => {
            isMounted = false;

            connection.off("ReceiveNowPlaying");
            connection.off("ReceivePause");

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