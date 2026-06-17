"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import type { LucideIcon } from "lucide-react";
import {
    Info,
    MapPin,
    Image as ImageIcon,
    Music,
    Calendar,
    Clock,
    Upload,
    X,
    Plus,
    Loader2,
    Link,
} from "lucide-react";
import type { LocationResult } from "@/components/map/MapWithSearch";
import { searchArtists, ArtistSearchResult } from "@/services/artist/artistService";
import { useDebounce } from "@/hooks/useDebounce";
import "./EventForm.css";

const MapWithSearch = dynamic(
    () => import("@/components/map/MapWithSearch"),
    { ssr: false, loading: () => <div className="ce-map-leaflet ce-map-leaflet--loading" /> },
);

export interface FormState {
    title: string;
    description: string;
    artistName: string;
    artistSpotifyId: string | null;
    artistImageUrl: string | null;
    address: string;
    latitude: number | null;
    longitude: number | null;
    venue: string;
    city: string;
    country: string;
    date: string;
    time: string;
    ticketsUrl: string;
    mainPhotoFile: File | null;
    existingImageUrl: string | null;
    galleryFiles: File[];
}

export type StepId = 1 | 2 | 3;
export type Updater = (patch: Partial<FormState>) => void;

export interface StepConfig {
    id: StepId;
    label: string;
    hint: string;
    Icon: LucideIcon;
}

export const STEPS: StepConfig[] = [
    { id: 1, label: "Details",         hint: "Title, description, artist", Icon: Info      },
    { id: 2, label: "Location & Time", hint: "Venue, map, date",           Icon: MapPin    },
    { id: 3, label: "Media",           hint: "Cover & gallery",            Icon: ImageIcon },
];

export function Step1({ form, update }: { form: FormState; update: Updater }) {
    const [artistQuery, setArtistQuery] = useState(form.artistName);
    const [results, setResults] = useState<ArtistSearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const artistRef = useRef<HTMLDivElement>(null);
    const debouncedQuery = useDebounce(artistQuery, 400);

    useEffect(() => { setArtistQuery(form.artistName); }, [form.artistName]);

    useEffect(() => {
        if (debouncedQuery.trim().length < 2) {
            setResults([]);
            setIsOpen(false);
            return;
        }
        let cancelled = false;
        setIsSearching(true);
        searchArtists(debouncedQuery).then((r) => {
            if (!cancelled) { setResults(r); setIsOpen(true); }
        }).finally(() => { if (!cancelled) setIsSearching(false); });
        return () => { cancelled = true; };
    }, [debouncedQuery]);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (artistRef.current && !artistRef.current.contains(e.target as Node))
                setIsOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const handleInputChange = (value: string) => {
        setArtistQuery(value);
        update({ artistName: value, artistSpotifyId: null, artistImageUrl: null });
    };

    const handleSelect = (artist: ArtistSearchResult) => {
        setArtistQuery(artist.name);
        update({ artistName: artist.name, artistSpotifyId: artist.spotifyId, artistImageUrl: artist.imageUrl });
        setIsOpen(false);
    };

    return (
        <div className="ce-card">
            <div className="ce-section-header">
                <h2 className="ce-h2">Details</h2>
            </div>

            <div className="ce-fields">
                <label className="ce-field">
                    <span className="ce-field__label">Title <span className="ce-required">*</span></span>
                    <input
                        className="ce-input"
                        type="text"
                        value={form.title}
                        onChange={(e) => update({ title: e.target.value })}
                    />
                </label>

                <label className="ce-field">
                    <span className="ce-field__label">Description</span>
                    <textarea
                        className="ce-textarea"
                        rows={5}
                        value={form.description}
                        onChange={(e) => update({ description: e.target.value })}
                    />
                </label>

                <div className="ce-field">
                    <span className="ce-field__label">Artist (optional)</span>
                    <div className="ce-input-icon-wrapper" ref={artistRef}>
                        {isSearching
                            ? <Loader2 size={15} className="ce-input-icon-wrapper__icon ce-spinner" />
                            : <Music size={15} className="ce-input-icon-wrapper__icon" />
                        }
                        <input
                            className="ce-input ce-input--padded"
                            type="text"
                            placeholder="Search an artist"
                            value={artistQuery}
                            autoComplete="off"
                            onFocus={() => results.length > 0 && setIsOpen(true)}
                            onChange={(e) => handleInputChange(e.target.value)}
                        />
                        {isOpen && results.length > 0 && (
                            <div className="ce-artist-dropdown" role="listbox" aria-label="Artist results">
                                {results.map((artist) => {
                                    const isSelected = artist.name.toLowerCase() === form.artistName.trim().toLowerCase();
                                    return (
                                        <button
                                            key={artist.spotifyId ?? artist.name}
                                            type="button"
                                            role="option"
                                            aria-selected={isSelected}
                                            className={`ce-artist-option${isSelected ? " ce-artist-option--selected" : ""}`}
                                            onClick={() => handleSelect(artist)}
                                        >
                                            {artist.imageUrl && (
                                                <img src={artist.imageUrl} alt="" className="ce-artist-option__img" />
                                            )}
                                            <span className="ce-artist-option__info">
                                                <span className="ce-artist-option__name">{artist.name}</span>
                                                {artist.genres.length > 0 && (
                                                    <span className="ce-artist-option__genre">
                                                        {artist.genres.slice(0, 2).join(" · ")}
                                                    </span>
                                                )}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                <label className="ce-field">
                    <span className="ce-field__label">Tickets URL (optional)</span>
                    <div className="ce-input-icon-wrapper">
                        <Link size={15} className="ce-input-icon-wrapper__icon" />
                        <input
                            className="ce-input ce-input--padded"
                            type="url"
                            placeholder="https://…"
                            value={form.ticketsUrl}
                            onChange={(e) => update({ ticketsUrl: e.target.value })}
                        />
                    </div>
                </label>
            </div>
        </div>
    );
}

export function Step2({ form, update }: { form: FormState; update: Updater }) {
    const handleLocationSelect = useCallback(
        (result: LocationResult) => {
            const parts = result.label.split(",").map((p) => p.trim()).filter(Boolean);
            const fallbackCountry = parts.at(-1) ?? "";
            const fallbackCity = parts.length >= 2 ? parts.at(-2) ?? "" : parts[0] ?? "";
            update({
                address: result.label,
                latitude: result.lat,
                longitude: result.lng,
                city: result.city?.trim() || fallbackCity,
                country: result.country?.trim() || fallbackCountry,
            });
        },
        [update],
    );

    const handleMarkerDrag = useCallback(
        (lat: number, lng: number) => update({ latitude: lat, longitude: lng }),
        [update],
    );

    return (
        <div className="ce-card">
            <div className="ce-section-header">
                <h2 className="ce-h2">Location &amp; Time</h2>
            </div>

            <div className="ce-fields">
                <div className="ce-field">
                    <span className="ce-field__label">Address &amp; Map <span className="ce-required">*</span></span>
                    <div className="ce-map-leaflet">
                        <MapWithSearch
                            lat={form.latitude}
                            lng={form.longitude}
                            onLocationSelect={handleLocationSelect}
                            onMarkerDrag={handleMarkerDrag}
                        />
                    </div>
                    {form.address && (
                        <span className="ce-map-address">
                            {form.address}
                        </span>
                    )}
                </div>

                <div className="ce-grid-2">
                    <label className="ce-field">
                        <span className="ce-field__label">Venue</span>
                        <input
                            className="ce-input"
                            type="text"
                            placeholder="Location name"
                            value={form.venue}
                            onChange={(e) => update({ venue: e.target.value })}
                        />
                    </label>
                    <label className="ce-field">
                        <span className="ce-field__label">City <span className="ce-required">*</span></span>
                        <input
                            className="ce-input"
                            type="text"
                            placeholder="Auto-filled from map search"
                            value={form.city}
                            onChange={(e) => update({ city: e.target.value })}
                        />
                    </label>
                </div>

                <label className="ce-field">
                    <span className="ce-field__label">Country <span className="ce-required">*</span></span>
                    <input
                        className="ce-input"
                        type="text"
                        placeholder="Auto-filled from map search"
                        value={form.country}
                        onChange={(e) => update({ country: e.target.value })}
                    />
                </label>

                <div className="ce-grid-2">
                    <label className="ce-field">
                        <span className="ce-field__label">Date <span className="ce-required">*</span></span>
                        <div className="ce-input-icon-wrapper">
                            <Calendar size={15} className="ce-input-icon-wrapper__icon" />
                            <input
                                className="ce-input ce-input--padded"
                                type="date"
                                value={form.date}
                                onChange={(e) => update({ date: e.target.value })}
                            />
                        </div>
                    </label>
                    <label className="ce-field">
                        <span className="ce-field__label">Start Time <span className="ce-required">*</span></span>
                        <div className="ce-input-icon-wrapper">
                            <Clock size={15} className="ce-input-icon-wrapper__icon" />
                            <input
                                className="ce-input ce-input--padded"
                                type="time"
                                value={form.time}
                                onChange={(e) => update({ time: e.target.value })}
                            />
                        </div>
                    </label>
                </div>
            </div>
        </div>
    );
}

export function UploadTile({
    file,
    aspectClass,
    typeName,
    formatHint,
    onFile,
    onClear,
    hidePreview = false,
}: {
    file: File | null;
    aspectClass: string;
    typeName: string;
    formatHint: string;
    onFile: (f: File) => void;
    onClear: () => void;
    hidePreview?: boolean;
}) {
    const [preview, setPreview] = useState<string | null>(null);

    useEffect(() => {
        if (!file) { setPreview(null); return; }
        const url = URL.createObjectURL(file);
        setPreview(url);
        return () => URL.revokeObjectURL(url);
    }, [file]);

    return (
        <label className={`ce-upload-tile ${aspectClass}${file && !hidePreview ? " ce-upload-tile--filled" : ""}`}>
            <input
                type="file"
                accept="image/*"
                className="ce-visually-hidden"
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    const f = e.target.files?.[0];
                    if (f) onFile(f);
                    e.target.value = "";
                }}
            />
            {preview && !hidePreview ? (
                <>
                    <img src={preview} alt={typeName} className="ce-upload-tile__preview" />
                    <button
                        type="button"
                        className="ce-upload-tile__clear"
                        onClick={(e) => { e.preventDefault(); onClear(); }}
                    >
                        <X size={11} />
                    </button>
                </>
            ) : (
                <div className="ce-upload-tile__empty">
                    <Upload size={22} className="ce-upload-tile__icon" />
                    <span className="ce-upload-tile__cta">Drop or click to upload</span>
                    <span className="ce-upload-tile__format">{formatHint}</span>
                    <span className="ce-upload-tile__name">{typeName}</span>
                </div>
            )}
        </label>
    );
}

export function GalleryItem({ file, onRemove }: { file: File; onRemove: () => void }) {
    const [preview, setPreview] = useState<string | null>(null);
    useEffect(() => {
        const url = URL.createObjectURL(file);
        setPreview(url);
        return () => URL.revokeObjectURL(url);
    }, [file]);

    return (
        <div className="ce-gallery__photo">
            {preview && <img src={preview} alt="" className="ce-gallery__img" />}
            <button type="button" className="ce-gallery__remove" onClick={onRemove}>
                <X size={11} />
            </button>
        </div>
    );
}

export function MainPhotoPreview({
    file,
    existingUrl,
    onClear,
}: {
    file: File | null;
    existingUrl?: string | null;
    onClear: () => void;
}) {
    const [filePreview, setFilePreview] = useState<string | null>(null);

    useEffect(() => {
        if (!file) { setFilePreview(null); return; }
        const url = URL.createObjectURL(file);
        setFilePreview(url);
        return () => URL.revokeObjectURL(url);
    }, [file]);

    const src = filePreview ?? existingUrl ?? null;

    return (
        <div className="ce-photo-preview" aria-label="Main photo preview">
            {src ? (
                <>
                    <img src={src} alt="Main photo preview" className="ce-photo-preview__img" />
                    <button
                        type="button"
                        className="ce-photo-preview__clear"
                        onClick={() => onClear()}
                        aria-label="Clear photo"
                    >
                        <X size={11} />
                    </button>
                </>
            ) : (
                <div className="ce-photo-preview__empty">Preview</div>
            )}
        </div>
    );
}

export function Step3({ form, update }: { form: FormState; update: Updater }) {
    return (
        <div className="ce-card">
            <div className="ce-section-header">
                <h2 className="ce-h2">Media</h2>
            </div>

            <div className="ce-fields">
                <div className="ce-media-tiles">
                    <UploadTile
                        file={form.mainPhotoFile}
                        aspectClass="ce-upload-tile--square"
                        typeName=""
                        formatHint="JPG · PNG · WEBP"
                        onFile={(f) => update({ mainPhotoFile: f })}
                        onClear={() => update({ mainPhotoFile: null, existingImageUrl: null })}
                        hidePreview={true}
                    />
                    <MainPhotoPreview
                        file={form.mainPhotoFile}
                        existingUrl={form.existingImageUrl}
                        onClear={() => update({ mainPhotoFile: null, existingImageUrl: null })}
                    />
                </div>

                <div className="ce-field">
                    <span className="ce-field__label">Gallery</span>
                    <div className="ce-gallery">
                        {form.galleryFiles.map((file, i) => (
                            <GalleryItem
                                key={i}
                                file={file}
                                onRemove={() =>
                                    update({ galleryFiles: form.galleryFiles.filter((_, j) => j !== i) })
                                }
                            />
                        ))}
                        <label className="ce-gallery__add">
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                className="ce-visually-hidden"
                                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                    const files = Array.from(e.target.files ?? []);
                                    if (files.length)
                                        update({ galleryFiles: [...form.galleryFiles, ...files] });
                                    e.target.value = "";
                                }}
                            />
                            <Plus size={18} />
                            <span>Add photos</span>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
}
