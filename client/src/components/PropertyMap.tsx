import { useRef, useEffect } from "react";
import { MapView } from "./Map";

interface PropertyMapProps {
  latitude: number;
  longitude: number;
  title: string;
}

export default function PropertyMap({
  latitude,
  longitude,
  title,
}: PropertyMapProps) {
  const mapRef = useRef<google.maps.Map | null>(null);
  const circleRef = useRef<google.maps.Circle | null>(null);

  const handleMapReady = (map: google.maps.Map) => {
    mapRef.current = map;

    const center = { lat: latitude, lng: longitude };

    // Adicionar círculo de 5 km
    circleRef.current = new google.maps.Circle({
      map: map,
      center: center,
      radius: 5000, // 5 km em metros
      fillColor: "#4F46E5",
      fillOpacity: 0.1,
      strokeColor: "#4F46E5",
      strokeOpacity: 0.8,
      strokeWeight: 2,
    });

    // Adicionar marcador no centro (sem mostrar localização exata)
    new google.maps.marker.AdvancedMarkerElement({
      map: map,
      position: center,
      title: title,
    });

    // Adicionar label de região
    const infoWindow = new google.maps.InfoWindow({
      content: `<div style="color: #1F2937; font-weight: 500; padding: 8px;">Região do imóvel<br/>(raio de 5 km)</div>`,
      position: center,
    });
    infoWindow.open(map);
  };

  return (
    <div className="w-full">
      <MapView
        initialCenter={{ lat: latitude, lng: longitude }}
        initialZoom={13}
        onMapReady={handleMapReady}
        className="w-full h-96 rounded-lg border border-border overflow-hidden"
      />
    </div>
  );
}
