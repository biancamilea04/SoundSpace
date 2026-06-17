"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import { GeoSearchControl, OpenStreetMapProvider } from "leaflet-geosearch";
import "leaflet/dist/leaflet.css";
import "leaflet-geosearch/dist/geosearch.css";
import "./MapWithSearch.css";

delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export interface LocationResult {
    lat: number;
    lng: number;
    label: string;
    city: string;
    country: string;
}

interface NominatimAddress {
    city?: string;
    town?: string;
    village?: string;
    county?: string;
    country?: string;
    [key: string]: string | undefined;
}

interface GeoSearchEvent {
    location: {
        x: number;
        y: number;
        label: string;
        raw: { address?: NominatimAddress };
    };
}

interface SearchControlProps {
    onSelect: (result: LocationResult) => void;
}

function SearchControl({ onSelect }: SearchControlProps) {
    const map = useMap();

    useEffect(() => {
        const provider = new OpenStreetMapProvider();

        const control = GeoSearchControl({
            provider,
            style: "bar",
            showMarker: false,
            showPopup: false,
            autoClose: true,
            retainZoomLevel: false,
            animateZoom: true,
            keepResult: true,
            searchLabel: "Search for an address…",
        });

        map.addControl(control);

        const handleShow = (event: unknown) => {
            const e = event as GeoSearchEvent;
            const addr = e.location.raw.address ?? {};
            onSelect({
                lat: e.location.y,
                lng: e.location.x,
                label: e.location.label,
                city: addr.city ?? addr.town ?? addr.village ?? addr.county ?? "",
                country: addr.country ?? "",
            });
        };

        map.on("geosearch/showlocation", handleShow);

        return () => {
            map.removeControl(control);
            map.off("geosearch/showlocation", handleShow);
        };
    }, [map, onSelect]);

    return null;
}

interface DraggableMarkerProps {
    position: [number, number];
    onDragEnd: (lat: number, lng: number) => void;
}

function DraggableMarker({ position, onDragEnd }: DraggableMarkerProps) {
    const markerRef = useRef<L.Marker>(null);

    const handlers = useMemo(
        () => ({
            dragend() {
                const pos = markerRef.current?.getLatLng();
                if (pos) onDragEnd(pos.lat, pos.lng);
            },
        }),
        [onDragEnd],
    );

    return (
        <Marker
            draggable
            position={position}
            ref={markerRef}
            eventHandlers={handlers}
        />
    );
}

export interface MapWithSearchProps {
    lat: number | null;
    lng: number | null;
    onLocationSelect: (result: LocationResult) => void;
    onMarkerDrag?: (lat: number, lng: number) => void;
    className?: string;
}

export default function MapWithSearch({
    lat,
    lng,
    onLocationSelect,
    onMarkerDrag,
    className,
}: MapWithSearchProps) {
    const hasPin = lat !== null && lng !== null;
    const wrapperClassName = ["map-with-search", className].filter(Boolean).join(" ");
    const [pin, setPin] = useState<[number, number] | null>(
        hasPin ? [lat, lng] : null,
    );

    useEffect(() => {
        setPin(lat !== null && lng !== null ? [lat, lng] : null);
    }, [lat, lng]);

    const handleSelect = useCallback(
        (result: LocationResult) => {
            setPin([result.lat, result.lng]);
            onLocationSelect(result);
        },
        [onLocationSelect],
    );

    const handleDrag = useCallback(
        (dLat: number, dLng: number) => {
            setPin([dLat, dLng]);
            onMarkerDrag?.(dLat, dLng);
        },
        [onMarkerDrag],
    );

    const defaultCenter: [number, number] = pin ?? [48, 10];
    const defaultZoom = pin ? 13 : 4;

    return (
        <div className={wrapperClassName}>
            <MapContainer
                center={defaultCenter}
                zoom={defaultZoom}
                className="map-with-search__map"
                scrollWheelZoom={false}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <SearchControl onSelect={handleSelect} />

                {pin && (
                    <DraggableMarker position={pin} onDragEnd={handleDrag} />
                )}
            </MapContainer>
        </div>
    );
}
