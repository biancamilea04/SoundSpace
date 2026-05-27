"use client";

import { useState, useEffect, useCallback } from "react";
import { Camera, Upload, Loader2 } from "lucide-react";
import UploadPhotoModal from "@/components/events/UploadPhotoModal/UploadPhotoModal";
import { fetchEventPhotos } from "@/services/event/eventPhotoService";
import { isGuid } from "@/lib/idUtils";
import { EventPhoto } from "@/types/event";
import "./EventPagePhotos.css";

// Backend base URL used to turn a relative FilePath into a full <img> src.
// e.g.  /uploads/events/abc.jpg  →  http://localhost:5000/uploads/events/abc.jpg
const BACKEND = process.env.NEXT_PUBLIC_BACKEND_API_URL ?? "";

interface EventPagePhotosProps {
    eventId: string;
    /** When true the component shows placeholder tiles without fetching data.
     *  Used for the locked EventGate preview so we don't make real API calls. */
    isPreview?: boolean;
}

const EventPagePhotos = ({ eventId, isPreview = false }: EventPagePhotosProps) => {
    const isRealEvent = isGuid(eventId);
    const shouldFetch = !isPreview && isRealEvent;
    const [photos, setPhotos] = useState<EventPhoto[]>([]);
    const [isLoading, setIsLoading] = useState(shouldFetch);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const loadPhotos = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await fetchEventPhotos(eventId);
            setPhotos(data);
        } catch {
            // Fail silently — an empty grid is a better UX than an error banner here.
        } finally {
            setIsLoading(false);
        }
    }, [eventId]);

    useEffect(() => {
        if (!shouldFetch) {
            setPhotos([]);
            setIsLoading(false);
            return;
        }
        void loadPhotos();
    }, [shouldFetch, loadPhotos]);

    // Prepend the newly uploaded photo so it appears first without a full reload.
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
                        disabled={isPreview || !isRealEvent}
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
                                      {/* Full image URL = backend origin + relative FilePath from DB */}
                                      {/* eslint-disable-next-line @next/next/no-img-element */}
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
