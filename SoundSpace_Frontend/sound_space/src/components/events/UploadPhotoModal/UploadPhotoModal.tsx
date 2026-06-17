"use client";

import { useState, useRef, useEffect } from "react";
import { X, Upload, Link as LinkIcon, Loader2 } from "lucide-react";
import { uploadPhotoFile, uploadPhotoFromUrl } from "@/services/event/eventPhotoService";
import { EventPhoto } from "@/types/event";
import "./UploadPhotoModal.css";

type UploadTab = "file" | "url";

interface UploadPhotoModalProps {
    eventId: string;
    onClose: () => void;
    onUploaded: (photo: EventPhoto) => void;
}

const UploadPhotoModal = ({ eventId, onClose, onUploaded }: UploadPhotoModalProps) => {
    const [tab, setTab] = useState<UploadTab>("file");

    const [file, setFile] = useState<File | null>(null);
    const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);

    const [imageUrl, setImageUrl] = useState("");

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const overlayRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
        document.addEventListener("keydown", handleKey);
        return () => document.removeEventListener("keydown", handleKey);
    }, [onClose]);

    useEffect(() => {
        return () => {
            if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl);
        };
    }, [filePreviewUrl]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        if (!selected) return;

        if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl);
        setFile(selected);
        setFilePreviewUrl(URL.createObjectURL(selected));
        setError(null);
    };

    const handleTabChange = (next: UploadTab) => {
        setTab(next);
        setError(null);
    };

    const handleSubmit = async () => {
        if (isSubmitting) return;
        setError(null);

        if (tab === "file" && !file) { setError("Please select a file."); return; }
        if (tab === "url" && !imageUrl.trim()) { setError("Please enter a URL."); return; }

        setIsSubmitting(true);
        try {
            let photo: EventPhoto;
            if (tab === "file") {
                photo = await uploadPhotoFile(eventId, file!);
            } else {
                photo = await uploadPhotoFromUrl(eventId, imageUrl.trim());
            }
            onUploaded(photo);
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Upload failed. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === overlayRef.current) onClose();
    };

    const urlPreviewSrc = tab === "url" && imageUrl.trim() ? imageUrl.trim() : null;
    const canSubmit = !isSubmitting && (tab === "file" ? !!file : !!imageUrl.trim());

    return (
        <div className="upm-overlay" ref={overlayRef} onClick={handleOverlayClick}>
            <div className="upm-modal" role="dialog" aria-modal="true" aria-label="Upload Photo">
                <div className="upm-header">
                    <h2 className="upm-title">Upload Photo</h2>
                    <button className="upm-close" onClick={onClose} aria-label="Close modal">
                        <X size={20} />
                    </button>
                </div>

                <div className="upm-tabs" role="tablist">
                    <button
                        role="tab"
                        aria-selected={tab === "file"}
                        className={`upm-tab${tab === "file" ? " upm-tab--active" : ""}`}
                        onClick={() => handleTabChange("file")}
                    >
                        <Upload size={13} />
                        From Device
                    </button>
                    <button
                        role="tab"
                        aria-selected={tab === "url"}
                        className={`upm-tab${tab === "url" ? " upm-tab--active" : ""}`}
                        onClick={() => handleTabChange("url")}
                    >
                        <LinkIcon size={13} />
                        From URL
                    </button>
                </div>

                <div className="upm-body">
                    {tab === "file" ? (
                        <label className="upm-dropzone">
                            <input
                                type="file"
                                accept=".jpg,.jpeg,.png,.webp"
                                onChange={handleFileChange}
                                className="upm-file-input"
                            />
                            {filePreviewUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={filePreviewUrl} alt="Selected file preview" className="upm-preview-img" />
                            ) : (
                                <div className="upm-drop-hint">
                                    <Upload size={30} className="upm-drop-icon" />
                                    <span className="upm-drop-label">Click to choose a photo</span>
                                    <span className="upm-drop-sub">JPG, PNG or WEBP · max 5 MB</span>
                                </div>
                            )}
                        </label>
                    ) : (
                        <div className="upm-url-panel">
                            <input
                                className="upm-url-input"
                                type="url"
                                placeholder="https://example.com/photo.jpg"
                                value={imageUrl}
                                onChange={(e) => { setImageUrl(e.target.value); setError(null); }}
                                autoFocus
                            />
                            {urlPreviewSrc && (
                                <div className="upm-url-preview">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={urlPreviewSrc}
                                        alt="URL preview"
                                        className="upm-preview-img"
                                        onError={() => setError("Could not load preview for this URL. The upload may still work.")}
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    {error && <p className="upm-error" role="alert">{error}</p>}
                </div>

                <div className="upm-footer">
                    <button className="upm-btn upm-btn--cancel" onClick={onClose} disabled={isSubmitting}>
                        Cancel
                    </button>
                    <button
                        className="upm-btn upm-btn--submit"
                        onClick={handleSubmit}
                        disabled={!canSubmit}
                    >
                        {isSubmitting ? (
                            <><Loader2 size={14} className="upm-spinner" /> Uploading…</>
                        ) : (
                            "Upload"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UploadPhotoModal;
