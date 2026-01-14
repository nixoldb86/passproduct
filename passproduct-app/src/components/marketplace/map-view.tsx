"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { Listing } from "@/types";
import { formatPrice } from "@/lib/utils";
import { Shield } from "lucide-react";
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
    let size = 50;
    let fontSize = 11;
    if (count > 10) {
      size = 60;
      fontSize = 12;
    }
    if (count > 20) {
      size = 70;
      fontSize = 13;
    }
    if (count > 50) {
      size = 80;
      fontSize = 14;
    }
    
    return L.divIcon({
      html: `
        <div class="cluster-circle" style="width: ${size}px; height: ${size}px;">
          <span class="cluster-price" style="font-size: ${fontSize}px;">desde<br/>${formatPrice(minPrice)}</span>
        </div>
      `,
      className: "custom-cluster-icon",
      iconSize: L.point(size, size),
      iconAnchor: L.point(size / 2, size / 2),
    });
  }, [L]);

  if (!isMounted || !L) {
    return (
      <div className="h-[500px] bg-surface-1 rounded-2xl border border-border flex items-center justify-center">
        <div className="text-foreground-muted">Cargando mapa...</div>
      </div>
    );
  }

  return (
    <div className="relative h-[500px] rounded-2xl overflow-hidden border border-border">
      {/* Estilos de Leaflet y clusters */}
      <style jsx global>{`
        .leaflet-container {
          height: 100%;
          width: 100%;
          background: #f5f5f5;
        }
        .leaflet-popup-content-wrapper {
          background: var(--color-surface-1, #1a1a1a);
          color: var(--color-foreground, #fff);
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.3);
          border: 1px solid rgba(255,255,255,0.1);
        }
        .leaflet-popup-tip {
          background: var(--color-surface-1, #1a1a1a);
          border-left: 1px solid rgba(255,255,255,0.1);
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        .leaflet-popup-content {
          margin: 12px 14px;
        }
        .leaflet-popup-close-button {
          color: #888 !important;
        }
        
        /* Círculo de precio individual */
        .price-circle {
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #E4C767 0%, #D4AF37 100%);
          color: #0C0C0E;
          border-radius: 50%;
          font-weight: 700;
          box-shadow: 0 3px 10px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.3);
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
          border: 2px solid rgba(255,255,255,0.3);
        }
        .price-circle:hover {
          transform: scale(1.15);
          box-shadow: 0 5px 15px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.3);
        }
        
        /* Círculo de cluster */
        .custom-cluster-icon {
          background: transparent !important;
        }
        .cluster-circle {
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #E4C767 0%, #D4AF37 100%);
          color: #0C0C0E;
          border-radius: 50%;
          font-weight: 700;
          box-shadow: 0 4px 15px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.3);
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
          border: 3px solid rgba(255,255,255,0.4);
          text-align: center;
        }
        .cluster-circle:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 20px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.3);
        }
        .cluster-price {
          line-height: 1.1;
        }
        
        /* Controles de zoom */
        .leaflet-control-zoom {
          border: none !important;
          box-shadow: 0 2px 10px rgba(0,0,0,0.15) !important;
        }
        .leaflet-control-zoom a {
          background: white !important;
          color: #333 !important;
          border: 1px solid #ddd !important;
          width: 32px !important;
          height: 32px !important;
          line-height: 30px !important;
        }
        .leaflet-control-zoom a:hover {
          background: #f5f5f5 !important;
        }
        .leaflet-control-zoom-in {
          border-radius: 8px 8px 0 0 !important;
        }
        .leaflet-control-zoom-out {
          border-radius: 0 0 8px 8px !important;
        }
      `}</style>

      <MapContainer
        center={mapCenter}
        zoom={6}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MarkerClusterGroup
          chunkedLoading
          iconCreateFunction={createClusterCustomIcon}
          maxClusterRadius={60}
          spiderfyOnMaxZoom={true}
          showCoverageOnHover={false}
          zoomToBoundsOnClick={true}
          disableClusteringAtZoom={12}
        >
          {listingsWithCoords.map((listing) => (
            <PriceMarker key={listing.id} listing={listing} L={L} />
          ))}
        </MarkerClusterGroup>
      </MapContainer>

      {/* Leyenda */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-surface-1/95 backdrop-blur-sm border border-border rounded-xl p-3">
        <p className="text-sm font-medium text-foreground">
          {listings.length} anuncios
        </p>
        <p className="text-xs text-foreground-muted mt-1">
          Haz zoom para ver todos los precios
        </p>
      </div>
    </div>
  );
}

// Componente separado para el marcador con precio circular
function PriceMarker({ 
  listing, 
  L 
}: { 
  listing: Listing & { lat: number; lng: number };
  L: typeof import("leaflet");
}) {
  // Calcular tamaño del círculo basado en el precio
  const price = listing.price;
  let size = 44;
  let fontSize = 10;
  
  if (price >= 1000) {
    size = 52;
    fontSize = 9;
  } else if (price >= 500) {
    size = 48;
    fontSize = 10;
  } else if (price < 100) {
    size = 40;
    fontSize = 11;
  }

  // Crear icono circular con el precio
  const priceIcon = L.divIcon({
    className: "price-marker-container",
    html: `<div class="price-circle" style="width: ${size}px; height: ${size}px; font-size: ${fontSize}px;">${formatPrice(price)}</div>`,
    iconSize: L.point(size, size),
    iconAnchor: L.point(size / 2, size / 2),
  });

  // Guardar el precio en las opciones del marker para el cluster
  const markerOptions = {
    icon: priceIcon,
    price: price,
  };

  const hasWarranty = listing.product?.warrantyEndDate
    ? new Date(listing.product.warrantyEndDate) > new Date()
    : false;

  return (
    <Marker 
      position={[listing.lat, listing.lng]} 
      icon={priceIcon}
      // @ts-expect-error - price is custom option for clustering
      price={price}
    >
      <Popup>
        <div className="min-w-[200px]">
          <h4 className="font-semibold text-sm mb-1">{listing.title}</h4>
          <p className="text-xs text-foreground-muted mb-2">{listing.location}</p>
          <div className="flex items-center justify-between">
            <span className="font-bold text-accent text-lg">{formatPrice(listing.price)}</span>
            {hasWarranty && (
              <span className="flex items-center gap-1 text-xs text-jade">
                <Shield className="h-3 w-3" />
                Garantía
              </span>
            )}
          </div>
          <a
            href={`/marketplace/${listing.id}`}
            className="block mt-3 text-center text-xs bg-accent text-[#0C0C0E] py-2 px-3 rounded-lg font-medium hover:bg-accent/90 transition-colors"
          >
            Ver anuncio
          </a>
        </div>
      </Popup>
    </Marker>
  );
}
