"use client";

import { useEffect, useMemo } from "react";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const DEFAULT_CENTER: [number, number] = [26.8206, 30.8025]; // Egypt

function markerIcon() {
  return L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });
}

function Recenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], Math.max(map.getZoom(), 14), { animate: true });
  }, [lat, lng, map]);
  return null;
}

function ClickHandler({
  onPick,
}: {
  onPick?: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onPick?.(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

interface OsmMapPickerProps {
  lat?: number | null;
  lng?: number | null;
  onChange?: (lat: number, lng: number) => void;
  height?: number;
  zoom?: number;
  interactive?: boolean;
  className?: string;
}

export function OsmMapPicker({
  lat,
  lng,
  onChange,
  height = 220,
  zoom = 14,
  interactive = true,
  className,
}: OsmMapPickerProps) {
  const hasCoords =
    lat != null && lng != null && Number.isFinite(lat) && Number.isFinite(lng);
  const center = useMemo<[number, number]>(
    () => (hasCoords ? [lat as number, lng as number] : DEFAULT_CENTER),
    [hasCoords, lat, lng]
  );
  const icon = useMemo(() => markerIcon(), []);

  return (
    <div
      className={className}
      style={{ height }}
    >
      <MapContainer
        center={center}
        zoom={hasCoords ? zoom : 6}
        scrollWheelZoom={interactive}
        style={{ height: "100%", width: "100%", borderRadius: "0.75rem" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {hasCoords && (
          <>
            <Marker position={[lat as number, lng as number]} icon={icon} />
            <Recenter lat={lat as number} lng={lng as number} />
          </>
        )}
        {interactive && onChange ? <ClickHandler onPick={onChange} /> : null}
      </MapContainer>
    </div>
  );
}
