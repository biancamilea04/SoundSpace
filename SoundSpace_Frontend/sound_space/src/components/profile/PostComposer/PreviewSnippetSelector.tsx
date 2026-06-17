"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { Play, Pause, Scissors } from "lucide-react";
import "./PreviewSnippetSelector.css";

interface PreviewSnippetSelectorProps {
    previewUrl: string;
    onSnippetChange: (startSecond: number, duration: number) => void;
}

const MIN_DURATION = 5;
const CANVAS_HEIGHT = 56;

const PreviewSnippetSelector = ({ previewUrl, onSnippetChange }: PreviewSnippetSelectorProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const amplitudesRef = useRef<number[]>([]);
    const totalDurationRef = useRef<number>(30);
    const dragRef = useRef<"start" | "end" | null>(null);

    const [isLoading, setIsLoading] = useState(true);
    const [isPlaying, setIsPlaying] = useState(false);
    const [startRatio, setStartRatio] = useState(0);
    const [endRatio, setEndRatio] = useState(1);
    const [canvasWidth, setCanvasWidth] = useState(0);

    const getSnippetSeconds = useCallback(
        (sRatio: number, eRatio: number) => {
            const total = totalDurationRef.current;
            return {
                start: sRatio * total,
                duration: (eRatio - sRatio) * total,
            };
        },
        []
    );

    const drawWaveform = useCallback(
        (sRatio: number, eRatio: number) => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext("2d");
            if (!ctx) return;
            const { width, height } = canvas;
            const amps = amplitudesRef.current;
            if (!amps.length) return;

            ctx.clearRect(0, 0, width, height);

            const barWidth = 2;
            const barGap = 1;
            const step = barWidth + barGap;
            const numBars = Math.floor(width / step);
            const mid = height / 2;

            for (let i = 0; i < numBars; i++) {
                const ratio = i / numBars;
                const ampIdx = Math.floor(ratio * amps.length);
                const amp = amps[ampIdx] ?? 0;
                const barH = Math.max(3, amp * (height - 8));
                const x = i * step;
                const inSelection = ratio >= sRatio && ratio <= eRatio;

                ctx.fillStyle = inSelection
                    ? "#1ed760"
                    : "#3f3f46";
                ctx.fillRect(x, mid - barH / 2, barWidth, barH);
            }

            const sx = sRatio * width;
            const ex = eRatio * width;

            ctx.fillStyle = "rgba(30, 215, 96, 0.12)";
            ctx.fillRect(sx, 0, ex - sx, height);
        },
        []
    );

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;
        const observer = new ResizeObserver((entries) => {
            const w = entries[0]?.contentRect.width ?? 0;
            setCanvasWidth(w);
        });
        observer.observe(container);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!canvasWidth) return;
        drawWaveform(startRatio, endRatio);
    }, [canvasWidth, drawWaveform, startRatio, endRatio]);

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            setIsLoading(true);
            try {
                const res = await fetch(previewUrl, { mode: "cors" });
                const buffer = await res.arrayBuffer();
                const audioCtx = new AudioContext();
                const decoded = await audioCtx.decodeAudioData(buffer);
                await audioCtx.close();

                if (cancelled) return;

                totalDurationRef.current = decoded.duration;
                const data = decoded.getChannelData(0);
                const buckets = 300;
                const blockSize = Math.floor(data.length / buckets);
                const amps: number[] = [];
                let max = 0;

                for (let i = 0; i < buckets; i++) {
                    let sum = 0;
                    for (let j = 0; j < blockSize; j++) {
                        sum += Math.abs(data[i * blockSize + j] ?? 0);
                    }
                    const avg = sum / blockSize;
                    amps.push(avg);
                    if (avg > max) max = avg;
                }

                amplitudesRef.current = max > 0 ? amps.map((a) => a / max) : amps;
                setIsLoading(false);
                drawWaveform(0, 1);
                onSnippetChange(0, decoded.duration);
            } catch {
                if (!cancelled) setIsLoading(false);
            }
        };

        load();
        return () => { cancelled = true; };
    }, [previewUrl]);

    const getRatioFromEvent = (e: React.MouseEvent | MouseEvent | React.TouchEvent | TouchEvent): number => {
        const canvas = canvasRef.current;
        if (!canvas) return 0;
        const rect = canvas.getBoundingClientRect();
        const clientX = "touches" in e ? e.touches[0]?.clientX ?? 0 : (e as MouseEvent).clientX;
        return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    };

    const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const ratio = getRatioFromEvent(e);
        const distStart = Math.abs(ratio - startRatio);
        const distEnd = Math.abs(ratio - endRatio);
        dragRef.current = distStart < distEnd ? "start" : "end";
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!dragRef.current) return;
            const ratio = getRatioFromEvent(e);
            const total = totalDurationRef.current;
            const minRatio = MIN_DURATION / total;

            if (dragRef.current === "start") {
                const clamped = Math.min(ratio, endRatio - minRatio);
                setStartRatio(clamped);
                const { start, duration } = getSnippetSeconds(clamped, endRatio);
                onSnippetChange(start, duration);
            } else {
                const clamped = Math.max(ratio, startRatio + minRatio);
                setEndRatio(clamped);
                const { start, duration } = getSnippetSeconds(startRatio, clamped);
                onSnippetChange(start, duration);
            }
        };

        const handleMouseUp = () => { dragRef.current = null; };

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);
        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, [startRatio, endRatio, getSnippetSeconds, onSnippetChange]);

    const toggleAudition = () => {
        if (isPlaying) {
            audioRef.current?.pause();
            setIsPlaying(false);
            return;
        }

        const { start, duration } = getSnippetSeconds(startRatio, endRatio);
        const audio = new Audio(previewUrl);
        audioRef.current = audio;
        audio.currentTime = start;
        audio.play().catch(() => {});
        setIsPlaying(true);

        const stopAt = start + duration;
        const onTimeUpdate = () => {
            if (audio.currentTime >= stopAt) {
                audio.pause();
                setIsPlaying(false);
                audio.removeEventListener("timeupdate", onTimeUpdate);
            }
        };
        audio.addEventListener("timeupdate", onTimeUpdate);
        audio.addEventListener("ended", () => setIsPlaying(false));
    };

    useEffect(() => {
        return () => {
            audioRef.current?.pause();
        };
    }, []);

    const { duration: selectedDuration } = getSnippetSeconds(startRatio, endRatio);
    const totalDuration = totalDurationRef.current;

    return (
        <div className="snippet-selector">
            <div className="snippet-selector__header">
                <Scissors size={13} className="snippet-selector__icon" />
                <span className="snippet-selector__label">Select preview clip</span>
                <span className="snippet-selector__duration">
                    {Math.round(selectedDuration)}s / {Math.round(totalDuration)}s
                </span>
            </div>

            <div className="snippet-selector__waveform-row">
                <button
                    className={`snippet-selector__audition-btn${isPlaying ? " snippet-selector__audition-btn--playing" : ""}`}
                    onClick={toggleAudition}
                    disabled={isLoading}
                    type="button"
                    aria-label={isPlaying ? "Pause audition" : "Play selection"}
                >
                    {isPlaying ? <Pause size={12} fill="currentColor" /> : <Play size={12} fill="currentColor" />}
                </button>

                <div ref={containerRef} className="snippet-selector__canvas-wrap">
                    {isLoading ? (
                        <div className="snippet-selector__skeleton" />
                    ) : (
                        <>
                            <canvas
                                ref={canvasRef}
                                width={canvasWidth}
                                height={CANVAS_HEIGHT}
                                className="snippet-selector__canvas"
                                onMouseDown={handleCanvasMouseDown}
                            />
                            <div
                                className="snippet-selector__handle snippet-selector__handle--start"
                                style={{ left: `${startRatio * 100}%` }}
                                onMouseDown={(e) => { e.stopPropagation(); dragRef.current = "start"; }}
                            />
                            <div
                                className="snippet-selector__handle snippet-selector__handle--end"
                                style={{ left: `${endRatio * 100}%` }}
                                onMouseDown={(e) => { e.stopPropagation(); dragRef.current = "end"; }}
                            />
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PreviewSnippetSelector;
