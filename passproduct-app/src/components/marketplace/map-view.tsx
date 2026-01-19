"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { Listing } from "@/types";
import { formatPrice } from "@/lib/utils";
import dynamic from "next/dynamic";

// Importar Leaflet dinámicamente para evitar SSR issues
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);
const MarkerClusterGroup = dynamic(
  () => import("react-leaflet-cluster").then((mod) => mod.default),
  { ssr: false }
);

interface MapViewProps {
  listings: Listing[];
}

// Ubicaciones de ciudades españolas para demo
const cityCoordinates: Record<string, [number, number]> = {
  "Madrid": [40.4168, -3.7038],
  "Barcelona": [41.3851, 2.1734],
  "Valencia": [39.4699, -0.3763],
  "Sevilla": [37.3891, -5.9845],
  "Bilbao": [43.2630, -2.9350],
  "Málaga": [36.7213, -4.4214],
  "Zaragoza": [41.6488, -0.8891],
  "Murcia": [37.9922, -1.1307],
  "Palma": [39.5696, 2.6502],
  "Las Palmas": [28.1235, -15.4363],
};

export function MapView({ listings }: MapViewProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [L, setL] = useState<typeof import("leaflet") | null>(null);

  useEffect(() => {
    setIsMounted(true);
    import("leaflet").then((leaflet) => {
      setL(leaflet.default);
    });
  }, []);

  // Añadir coordenadas a los listings basándose en su ubicación
  const listingsWithCoords = useMemo(() => {
    return listings.map((listing) => {
      const cityName = listing.location || "Madrid";
      let coords = cityCoordinates[cityName];
      
      if (!coords) {
        const baseLat = 40.4168;
        const baseLng = -3.7038;
        coords = [
          baseLat + (Math.random() - 0.5) * 0.5,
          baseLng + (Math.random() - 0.5) * 0.8,
        ];
      } else {
        coords = [
          coords[0] + (Math.random() - 0.5) * 0.02,
          coords[1] + (Math.random() - 0.5) * 0.02,
        ];
      }

      return {
        ...listing,
        lat: coords[0],
        lng: coords[1],
      };
    });
  }, [listings]);

  // Centro del mapa (España)
  const mapCenter: [number, number] = [40.0, -3.5];

  // Función para crear icono de cluster personalizado
  const createClusterCustomIcon = useCallback((cluster: { getChildCount: () => number; getAllChildMarkers: () => { options: { price: number } }[] }) => {
    if (!L) return L?.divIcon({ html: "" });
    
    const markers = cluster.getAllChildMarkers();
    const prices = markers.map((m: { options: { price: number } }) => m.options.price || 0);
    const minPrice = Math.min(...prices);
    const count = cluster.getChildCount();
    
    // Tamaño del círculo basado en cantidad de markers
    let size = 42;
    if (count > 10) size = 48;
    if (count > 20) size = 54;
    
    return L.divIcon({
      html: `<div class="cluster-dot">${formatPrice(minPrice)}</div>`,
      className: "custom-cluster-icon",
      iconSize: L.point(size, size),
      iconAnchor: L.point(size / 2, size / 2),
    });
  }, [L]);

  if (!isMounted || !L) {
    return (
      <div className="h-[500px] bg-surface-1 rounded-2xl flex items-center justify-center">
        <div className="text-foreground-muted text-sm">Cargando mapa...</div>
      </div>
    );
  }

  return (
    <div className="relative h-[500px] rounded-2xl overflow-hidden">
      {/* Estilos minimalistas */}
      <style jsx global>{`
        .leaflet-container {
          height: 100%;
          width: 100%;
          background: #fafafa;
          font-family: inherit;
        }
        
        /* Ocultar controles de atribución */
        .leaflet-control-attribution {
          display: none;
        }
        
        /* Popup minimalista */
        .leaflet-popup-content-wrapper {
          background: #fff;
          color: #111;
          border-radius: 12px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.12);
          padding: 0;
        }
        .leaflet-popup-tip {
          background: #fff;
        }
        .leaflet-popup-content {
          margin: 0;
          min-width: 160px;
        }
        .leaflet-popup-close-button {
          display: none;
        }
        
        /* Precio individual - pill minimalista */
        .price-pill {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: #111;
          color: #fff;
          padding: 6px 10px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
          cursor: pointer;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
          white-space: nowrap;
        }
        .price-pill:hover {
          transform: scale(1.08);
          box-shadow: 0 4px 12px rgba(0,0,0,0.25);
        }
        
        /* Cluster - círculo con precio mínimo */
        .custom-cluster-icon {
          background: transparent !important;
        }
        .cluster-dot {
          display: flex;
          align-items: center;
          justify-content: center;
          background: #111;
          color: #fff;
          padding: 8px 12px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
          box-shadow: 0 2px 10px rgba(0,0,0,0.25);
          cursor: pointer;
          transition: transform 0.15s ease;
          white-space: nowrap;
        }
        .cluster-dot:hover {
          transform: scale(1.08);
        }
        
        /* Controles de zoom minimalistas */
        .leaflet-control-zoom {
          border: none !important;
          box-shadow: 0 1px 4px rgba(0,0,0,0.08) !important;
          border-radius: 8px !important;
          overflow: hidden;
        }
        .leaflet-control-zoom a {
          background: #fff !important;
          color: #333 !important;
          border: none !important;
          width: 28px !important;
          height: 28px !important;
          line-height: 26px !important;
          font-size: 14px !important;
        }
        .leaflet-control-zoom a:hover {
          background: #f5f5f5 !important;
        }
        .leaflet-control-zoom-in {
          border-radius: 8px 8px 0 0 !important;
          border-bottom: 1px solid #eee !important;
        }
        .leaflet-control-zoom-out {
          border-radius: 0 0 8px 8px !important;
        }
      `}</style>

      <MapContainer
        center={mapCenter}
        zoom={6}
        scrollWheelZoom={true}
        zoomControl={true}
        style={{ height: "100%", width: "100%" }}
      >
        {/* Mapa minimalista CartoDB Positron */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />

        <MarkerClusterGroup
          chunkedLoading
          iconCreateFunction={createClusterCustomIcon}
          maxClusterRadius={50}
          spiderfyOnMaxZoom={true}
          showCoverageOnHover={false}
          zoomToBoundsOnClick={true}
          disableClusteringAtZoom={13}
        >
          {listingsWithCoords.map((listing) => (
            <PriceMarker key={listing.id} listing={listing} L={L} />
          ))}
        </MarkerClusterGroup>
      </MapContainer>

      {/* Contador minimalista */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-sm">
        <span className="text-sm font-medium text-gray-800">
          {listings.length} anuncios
        </span>
      </div>
    </div>
  );
}

// Componente separado para el marcador con precio
function PriceMarker({ 
  listing, 
  L 
}: { 
  listing: Listing & { lat: number; lng: number };
  L: typeof import("leaflet");
}) {
  const price = listing.price;

  // Crear icono pill con el precio
  const priceIcon = L.divIcon({
    className: "price-marker-container",
    html: `<div class="price-pill">${formatPrice(price)}</div>`,
    iconSize: L.point(70, 28),
    iconAnchor: L.point(35, 14),
  });

  return (
    <Marker 
      position={[listing.lat, listing.lng]} 
      icon={priceIcon}
      // @ts-expect-error - price is custom option for clustering
      price={price}
    >
      <Popup>
        <a href={`/marketplace/${listing.id}`} className="block p-3 hover:bg-gray-50 transition-colors rounded-xl">
          <p className="font-semibold text-sm text-gray-900 mb-0.5">{listing.title}</p>
          <p className="text-xs text-gray-500 mb-2">{listing.location}</p>
          <p className="font-bold text-base text-gray-900">{formatPrice(listing.price)}</p>
        </a>
      </Popup>
    </Marker>
  );
}
