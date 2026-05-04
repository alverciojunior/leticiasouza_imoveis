import { useEffect, useRef, useState } from "react";

interface PropertyMapProps {
  latitude: number;
  longitude: number;
  title: string;
}

declare global {
  interface Window {
    google?: any;
  }
}

export default function PropertyMap({
  latitude,
  longitude,
  title,
}: PropertyMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const circleRef = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    // Verificar se Google Maps já está carregado
    if (window.google && window.google.maps) {
      setMapLoaded(true);
      return;
    }

    // Carregar Google Maps API
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "AIzaSyDummyKey"}`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      setMapLoaded(true);
    };
    script.onerror = () => {
      console.error("Failed to load Google Maps API");
    };
    document.head.appendChild(script);

    return () => {
      // Cleanup se necessário
    };
  }, []);

  useEffect(() => {
    if (!mapLoaded || !mapContainer.current || !window.google) return;

    const center = { lat: latitude, lng: longitude };

    // Criar mapa
    map.current = new window.google.maps.Map(mapContainer.current, {
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
    circleRef.current = new window.google.maps.Circle({
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
    new window.google.maps.Marker({
      position: center,
      map: map.current,
      title: title,
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: "#4F46E5",
        fillOpacity: 1,
        strokeColor: "#FFFFFF",
        strokeWeight: 2,
      },
    });

    // Adicionar label de região
    const infoWindow = new window.google.maps.InfoWindow({
      content: `<div style="color: #1F2937; font-weight: 500; padding: 8px;">Região do imóvel<br/>(raio de 5 km)</div>`,
      position: center,
    });
    infoWindow.open(map.current);
  }, [mapLoaded, latitude, longitude, title]);

  return (
    <div className="w-full">
      {!mapLoaded && (
        <div className="w-full h-96 rounded-lg border border-border overflow-hidden flex items-center justify-center bg-secondary/30">
          <p className="text-muted-foreground">Carregando mapa...</p>
        </div>
      )}
      <div
        ref={mapContainer}
        className="w-full h-96 rounded-lg border border-border overflow-hidden"
        style={{ display: mapLoaded ? "block" : "none" }}
      />
    </div>
  );
}
