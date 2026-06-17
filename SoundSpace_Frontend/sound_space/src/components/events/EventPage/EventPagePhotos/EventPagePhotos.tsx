"use client";

import { useState, useEffect, useCallback } from "react";
import { Camera, Upload, Loader2 } from "lucide-react";
import UploadPhotoModal from "@/components/events/UploadPhotoModal/UploadPhotoModal";
import { fetchEventPhotos } from "@/services/event/eventPhotoService";
import { EventPhoto } from "@/types/event";
import "./EventPagePhotos.css";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_API_URL ?? "";

interface EventPagePhotosProps {
    eventId: string;
    isPreview?: boolean;
}

const EventPagePhotos = ({ eventId, isPreview = false }: EventPagePhotosProps) => {
    const [photos, setPhotos] = useState<EventPhoto[]>([]);
    const [isLoading, setIsLoading] = useState(!isPreview);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const loadPhotos = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await fetchEventPhotos(eventId);
            setPhotos(data);
        } catch {
        } finally {
            setIsLoading(false);
        }
    }, [eventId]);

    useEffect(() => {
        if (isPreview) return;
        void loadPhotos();
    }, [isPreview, loadPhotos]);

    const handleUploaded = (photo: EventPhoto) => {
        setPhotos((prev) => [photo, ...prev]);
    };

    return (
        <>
            <div className="epph">
                <div className="epph__toolbar">
                    <button
                        className="epph__upload-btn"
                        onClick={() => setIsModalOpen(true)}
                        disabled={isPreview}
                    >
                        <Upload size={14} />
                        Upload Photo
                    </button>
                </div>

                {isLoading ? (
                    <div className="epph__loading">
                        <Loader2 size={24} className="epph__spinner" />
                    </div>
                ) : (
                    <div className="epph__grid">
                        {photos.length > 0
                            ? photos.map((photo) => (
                                  <div key={photo.id} className="epph__tile">
                                      <img
                                          src={`${BACKEND}${photo.filePath}`}
                                          alt={`Photo by ${photo.uploaderDisplayName}`}
                                          className="epph__img"
                                      />
                                  </div>
                              ))
                            : Array.from({ length: 8 }).map((_, i) => (
                                  <div key={i} className="epph__tile epph__tile--placeholder">
                                      <Camera size={22} className="epph__placeholder-icon" />
                                  </div>
                              ))}
                    </div>
                )}
            </div>

            {isModalOpen && (
                <UploadPhotoModal
                    eventId={eventId}
                    onClose={() => setIsModalOpen(false)}
                    onUploaded={handleUploaded}
                />
            )}
        </>
    );
};

export default EventPagePhotos;
