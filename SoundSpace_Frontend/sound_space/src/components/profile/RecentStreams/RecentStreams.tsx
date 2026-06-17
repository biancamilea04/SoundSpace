"use client";

import Image from "next/image";
import { RecentStream } from "@/types/recentStream";
import "./RecentStreams.css";

function formatRelativeTime(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const minutes = Math.floor(diff / 60_000);
    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}

interface RecentStreamsProps {
    streams: RecentStream[];
    isLoading?: boolean;
    showTimestamp?: boolean;
}

export const RecentStreams = ({ streams, isLoading, showTimestamp = false }: RecentStreamsProps) => {
    if (isLoading) {
        return (
            <div className="recent-streams">
                <h3 className="recent-streams__title">Recent Streams</h3>
                <span className="recent-streams__loading">Loading...</span>
            </div>
        );
    }

    if (streams.length === 0) {
        return (
            <div className="recent-streams">
                <h3 className="recent-streams__title">Recent Streams</h3>
                <span className="recent-streams__loading">No recent streams found. You may need to log out and log in again to grant permissions.</span>
            </div>
        );
    }

    return (
        <div className="recent-streams">
            <h3 className="recent-streams__title">Recent Streams</h3>
            <div className="recent-streams__list">
                {streams.map((stream, idx) => (
                    <div key={`${stream.title}-${idx}`} className="recent-streams__item">
                        {stream.imageUrl ? (
                            <Image
                                src={stream.imageUrl}
                                alt={`${stream.title} album art`}
                                width={40}
                                height={40}
                                className="recent-streams__album-art"
                            />
                        ) : (
                            <div className="recent-streams__album-art recent-streams__album-art--fallback">
                                {stream.title?.charAt(0) ?? '?'}
                            </div>
                        )}
                        <div className="recent-streams__info">
                            <a
                                href={stream.spotifyUrl || "#"}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="recent-streams__track-name-link"
                            >
                                {stream.title}
                            </a>
                            <a
                                href={stream.artistUrl || "#"}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="recent-streams__artist-link"
                            >
                                {stream.artistName}
                            </a>
                        </div>
                        {showTimestamp && stream.playedAt && (
                            <span className="recent-streams__timestamp">
                                {formatRelativeTime(stream.playedAt)}
                            </span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RecentStreams;

