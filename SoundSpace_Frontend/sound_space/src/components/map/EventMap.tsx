"use client";

import { useEffect, useMemo, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./EventMap.css";

delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function FlyToController({ lat, lng }: { lat: number; lng: number }) {
    const map = useMap();
    useEffect(() => {
        map.flyTo([lat, lng], 13, { duration: 1 });
    }, [lat, lng, map]);
    return null;
}

function DraggableMarker({
    lat,
    lng,
    onPositionChange,
}: {
    lat: number;
    lng: number;
    onPositionChange: (lat: number, lng: number) => void;
}) {
    const markerRef = useRef<L.Marker>(null);
    const handlers = useMemo(
        () => ({
            dragend() {
                const pos = markerRef.current?.getLatLng();
                if (pos) onPositionChange(pos.lat, pos.lng);
            },
        }),
        [onPositionChange],
    );

    return (
        <Marker
            draggable
            position={[lat, lng]}
            ref={markerRef}
            eventHandlers={handlers}
        />
    );
}

function ReadOnlyMarker({ lat, lng }: { lat: number; lng: number }) {
    return <Marker position={[lat, lng]} />;
}

export interface EventMapProps {
    lat: number | null;
    lng: number | null;
    defaultCenter?: [number, number];
    zoom?: number;
    draggable?: boolean;
    onPositionChange?: (lat: number, lng: number) => void;
    className?: string;
}

export default function EventMap({
    lat,
    lng,
    defaultCenter = [48, 10],
    zoom = 13,
    draggable = false,
    onPositionChange,
    className,
}: EventMapProps) {
    const hasPosition = lat !== null && lng !== null;
    const center: [number, number] = hasPosition ? [lat, lng] : defaultCenter;
    const initialZoom = hasPosition ? zoom : 4;
    const mapClassName = ["event-map", className].filter(Boolean).join(" ");

    return (
        <MapContainer
            center={center}
            zoom={initialZoom}
            className={mapClassName}
            scrollWheelZoom={false}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {hasPosition && <FlyToController lat={lat} lng={lng} />}

            {hasPosition && draggable && onPositionChange && (
                <DraggableMarker lat={lat} lng={lng} onPositionChange={onPositionChange} />
            )}

            {hasPosition && !draggable && (
                <ReadOnlyMarker lat={lat} lng={lng} />
            )}
        </MapContainer>
    );
}
