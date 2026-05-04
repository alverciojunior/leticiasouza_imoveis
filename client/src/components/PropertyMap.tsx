import { useEffect, useRef } from "react";

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
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<google.maps.Map | null>(null);
  const circleRef = useRef<google.maps.Circle | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    const center = { lat: latitude, lng: longitude };

    // Criar mapa
    map.current = new google.maps.Map(mapContainer.current, {
      zoom: 13,
      center: center,
      mapTypeControl: true,
      fullscreenControl: true,
      streetViewControl: false,
      styles: [
        {
          featureType: "poi",
          elementType: "labels",
          stylers: [{ visibility: "off" }],
        },
      ],
    });

    // Adicionar círculo de 5 km
    circleRef.current = new google.maps.Circle({
      map: map.current,
      center: center,
      radius: 5000, // 5 km em metros
      fillColor: "#4F46E5",
      fillOpacity: 0.1,
      strokeColor: "#4F46E5",
      strokeOpacity: 0.8,
      strokeWeight: 2,
    });

    // Adicionar marcador no centro (sem mostrar localização exata)
    new google.maps.Marker({
      position: center,
      map: map.current,
      title: title,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: "#4F46E5",
        fillOpacity: 1,
        strokeColor: "#FFFFFF",
        strokeWeight: 2,
      },
    });

    // Adicionar label de região
    const infoWindow = new google.maps.InfoWindow({
      content: `<div style="color: #1F2937; font-weight: 500; padding: 8px;">Região do imóvel<br/>(raio de 5 km)</div>`,
      position: center,
    });
    infoWindow.open(map.current);
  }, [latitude, longitude, title]);

  return (
    <div className="w-full">
      <div
        ref={mapContainer}
        className="w-full h-96 rounded-lg border border-border overflow-hidden"
      />
    </div>
  );
}
