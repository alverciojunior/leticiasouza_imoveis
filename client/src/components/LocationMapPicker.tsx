import { useState, useCallback, useRef, useEffect } from "react";
import { MapView } from "./Map";
import { Button } from "@/components/ui/button";
import { X, MapPin } from "lucide-react";

interface LocationMapPickerProps {
  latitude: number;
  longitude: number;
  onLocationChange: (lat: number, lng: number) => void;
  onClose: () => void;
}

export default function LocationMapPicker({
  latitude,
  longitude,
  onLocationChange,
  onClose,
}: LocationMapPickerProps) {
  const [selectedLat, setSelectedLat] = useState(latitude);
  const [selectedLng, setSelectedLng] = useState(longitude);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const markerRef = useRef<any>(null);
  const mapRef = useRef<any>(null);

  const handleMapReady = useCallback((map: any) => {
    setMapInstance(map);
    mapRef.current = map;

    // Criar marcador inicial
    if (window.google?.maps?.marker?.AdvancedMarkerElement) {
      const initialMarker = new window.google.maps.marker.AdvancedMarkerElement({
        map: map,
        position: { lat: selectedLat, lng: selectedLng },
        title: "Localização do imóvel",
      });
      markerRef.current = initialMarker;
    }

    // Adicionar listener de clique no mapa
    map.addListener("click", (event: any) => {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();

      setSelectedLat(lat);
      setSelectedLng(lng);

      // Atualizar marcador
      if (markerRef.current) {
        markerRef.current.position = { lat, lng };
      } else if (window.google?.maps?.marker?.AdvancedMarkerElement) {
        const newMarker = new window.google.maps.marker.AdvancedMarkerElement({
          map: map,
          position: { lat, lng },
          title: "Localização do imóvel",
        });
        markerRef.current = newMarker;
      }
    });
  }, [selectedLat, selectedLng]);

  // Atualizar marcador quando as coordenadas mudam manualmente
  useEffect(() => {
    if (markerRef.current) {
      markerRef.current.position = { lat: selectedLat, lng: selectedLng };
    }
  }, [selectedLat, selectedLng]);

  const handleConfirm = () => {
    onLocationChange(selectedLat, selectedLng);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-background">
          <div className="flex items-center gap-2">
            <MapPin className="text-accent" size={24} />
            <h2 className="font-display text-2xl font-bold text-foreground">
              Selecionar Localização
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-secondary rounded transition-colors"
          >
            <X size={24} className="text-foreground" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-secondary/30 rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-2">
              💡 Clique no mapa para selecionar a localização do imóvel
            </p>
            <div className="bg-background rounded-lg overflow-hidden border border-border">
              <MapView
                initialCenter={{ lat: selectedLat, lng: selectedLng }}
                initialZoom={15}
                onMapReady={handleMapReady}
                className="w-full h-[400px]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Latitude
              </label>
              <input
                type="number"
                step="0.0001"
                value={selectedLat}
                onChange={(e) => {
                  const newLat = Number(e.target.value);
                  setSelectedLat(newLat);
                  // Centralizar mapa na nova coordenada
                  if (mapRef.current) {
                    mapRef.current.setCenter({ lat: newLat, lng: selectedLng });
                  }
                }}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                placeholder="Ex: -20.6596"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Longitude
              </label>
              <input
                type="number"
                step="0.0001"
                value={selectedLng}
                onChange={(e) => {
                  const newLng = Number(e.target.value);
                  setSelectedLng(newLng);
                  // Centralizar mapa na nova coordenada
                  if (mapRef.current) {
                    mapRef.current.setCenter({ lat: selectedLat, lng: newLng });
                  }
                }}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                placeholder="Ex: -48.7669"
              />
            </div>
          </div>

          <div className="bg-accent/10 rounded-lg p-4">
            <p className="text-sm text-foreground">
              <strong>Coordenadas selecionadas:</strong>
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Latitude: {selectedLat.toFixed(4)} | Longitude: {selectedLng.toFixed(4)}
            </p>
          </div>

          <div className="flex gap-3 pt-4 border-t border-border">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirm}
              className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              Confirmar Localização
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
