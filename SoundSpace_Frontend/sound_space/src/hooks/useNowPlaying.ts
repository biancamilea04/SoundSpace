"use client";

import { useEffect, useState, useRef } from "react";
import { HubConnectionBuilder, LogLevel, HubConnection } from "@microsoft/signalr";
import { NowPlayingData } from "@/types/nowPlaying";

const TOKEN_KEY = "auth_token";
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:5033";
const LOCAL_TICK_MS = 1000;

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
        const token = localStorage.getItem(TOKEN_KEY);
        if (!token) {
            setIsLoading(false);
            return;
        }

        const connection = new HubConnectionBuilder()
            .withUrl(`${BACKEND_URL}/hubs/spotify`, {
                accessTokenFactory: () => token
            })
            .configureLogging(LogLevel.Information)
            .withAutomaticReconnect()
            .build();

        connectionRef.current = connection;

        connection.on("ReceiveNowPlaying", (data: NowPlayingData | null) => {
            setNowPlaying(data);
            nowPlayingRef.current = data;
            setIsLoading(false);
        });

        const startConnection = async () => {
            try {
                await connection.start();
            } catch (err) {
                console.error("[SignalR] Connection error:", err);
                setIsLoading(false);
            }
        };

        startConnection();

        return () => {
            if (connectionRef.current) {
                connectionRef.current.off("ReceiveNowPlaying");
                connectionRef.current.stop();
            }
        };
    }, []);

    useEffect(() => {
        const tickId = setInterval(() => {
            const current = nowPlayingRef.current;

            if (current && current.isPlaying) {
                const newProgress = Math.min(current.progressMs + LOCAL_TICK_MS, current.durationMs);

                const updatedData = {
                    ...current,
                    progressMs: newProgress
                };

                nowPlayingRef.current = updatedData;
                setNowPlaying(updatedData);
            }
        }, LOCAL_TICK_MS);

        return () => clearInterval(tickId);
    }, []);

    return { nowPlaying, isLoading };
};