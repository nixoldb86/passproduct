import { useState, useCallback } from 'react';

interface MarketPriceResult {
  success: boolean;
  product: {
    brand: string;
    model: string;
    variant?: string;
    purchasePrice?: number;
  };
  marketAnalysis: {
    totalListingsFound: number;
    relevantListings: number;
    outlierRemoved: number;
    priceRange: {
      min: number;
      max: number;
      average: number;
    };
    recommendedPrices: {
      minimo: number;    // El precio más bajo del mercado ("Si quieres vender rápido, baja a este precio")
      ideal: number;     // El promedio del mercado ("Este es el precio de mercado justo")
      rapido: number;    // 90% del promedio ("Para vender más rápido sin malvender")
    };
    percentageRetained?: number;
    marketTrend: 'stable' | 'rising' | 'falling';
    notes: string;
  };
  listings: Array<{
    id: string;
    titulo: string;
    precio: number;
    descripcion: string;
    ciudad_o_zona: string;
    url_anuncio: string;
    imagen: string;
    is_shippable: boolean;
  }>;
}

interface UseMarketPricesReturn {
  isLoading: boolean;
  error: string | null;
  result: MarketPriceResult | null;
  fetchMarketPrices: (params: {
    brand: string;
    model: string;
    variant?: string;
    purchasePrice?: number;
  }) => Promise<MarketPriceResult | null>;
  clearResult: () => void;
}

export function useMarketPrices(): UseMarketPricesReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MarketPriceResult | null>(null);

  const fetchMarketPrices = useCallback(async (params: {
    brand: string;
    model: string;
    variant?: string;
    purchasePrice?: number;
  }): Promise<MarketPriceResult | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/market-prices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Error al obtener precios de mercado');
      }

      setResult(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearResult = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return {
    isLoading,
    error,
    result,
    fetchMarketPrices,
    clearResult,
  };
}

// Utilidad para formatear precios
export function formatMarketPrice(price: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

// Componente de etiqueta de tendencia
export function getMarketTrendLabel(trend: 'stable' | 'rising' | 'falling'): {
  label: string;
  color: string;
  emoji: string;
} {
  switch (trend) {
    case 'rising':
      return { label: 'Subiendo', color: 'text-green-500', emoji: '📈' };
    case 'falling':
      return { label: 'Bajando', color: 'text-red-500', emoji: '📉' };
    default:
      return { label: 'Estable', color: 'text-gray-500', emoji: '➡️' };
  }
}
