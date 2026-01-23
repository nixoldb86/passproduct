"use client";

import { useState, useEffect, useRef } from "react";
import { MapPin, Loader2, X } from "lucide-react";

interface AddressSuggestion {
  place_id: number;
  display_name: string;
  address: {
    road?: string;
    house_number?: string;
    postcode?: string;
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    state?: string;
    country?: string;
  };
}

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onAddressSelect?: (address: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  }) => void;
  placeholder?: string;
  label?: string;
  country?: string; // Código país para filtrar (ej: "es" para España)
}

export function AddressAutocomplete({
  value,
  onChange,
  onAddressSelect,
  placeholder = "Escribe tu dirección...",
  label = "Dirección",
  country = "es",
}: AddressAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Buscar direcciones con Nominatim (OpenStreetMap) - GRATIS
  const searchAddresses = async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      // Nominatim API - gratuita, sin límite razonable de uso
      // Documentación: https://nominatim.org/release-docs/develop/api/Search/
      const params = new URLSearchParams({
        q: query,
        format: "json",
        addressdetails: "1",
        limit: "5",
        countrycodes: country,
        "accept-language": "es",
      });

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?${params}`,
        {
          headers: {
            // Nominatim requiere un User-Agent identificativo
            "User-Agent": "PassProduct/1.0 (checkout-address-autocomplete)",
          },
        }
      );

      if (response.ok) {
        const data: AddressSuggestion[] = await response.json();
        setSuggestions(data);
        setShowSuggestions(data.length > 0);
      }
    } catch (error) {
      console.error("Error buscando direcciones:", error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounce de búsqueda (300ms)
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      if (value.length >= 3) {
        searchAddresses(value);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [value]);

  // Cerrar sugerencias al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Manejar selección de dirección
  const handleSelectAddress = (suggestion: AddressSuggestion) => {
    const addr = suggestion.address;
    
    // Construir la calle completa
    const streetParts = [addr.road, addr.house_number].filter(Boolean);
    const street = streetParts.join(" ") || suggestion.display_name.split(",")[0];
    
    // Obtener la ciudad (puede estar en diferentes campos)
    const city = addr.city || addr.town || addr.village || addr.municipality || "";
    
    // Obtener código postal
    const postalCode = addr.postcode || "";
    
    // País
    const countryName = addr.country || "España";

    // Actualizar el input con la dirección formateada
    onChange(street);
    setShowSuggestions(false);
    setSuggestions([]);
    setSelectedIndex(-1);

    // Notificar al padre para auto-rellenar otros campos
    if (onAddressSelect) {
      onAddressSelect({
        street,
        city,
        postalCode,
        country: countryName,
      });
    }
  };

  // Manejar navegación con teclado
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSelectAddress(suggestions[selectedIndex]);
        }
        break;
      case "Escape":
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Formatear dirección para mostrar en sugerencias
  const formatSuggestion = (suggestion: AddressSuggestion) => {
    const parts = suggestion.display_name.split(",");
    // Mostrar máximo 3 partes relevantes
    return parts.slice(0, 3).join(",").trim();
  };

  return (
    <div ref={containerRef} className="relative">
      {label && (
        <label className="block text-sm font-medium text-foreground-muted mb-1.5">
          {label}
        </label>
      )}
      
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-subtle">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <MapPin className="h-4 w-4" />
          )}
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2.5 bg-surface-1 border border-border rounded-xl text-foreground placeholder:text-foreground-subtle focus:outline-none focus:ring-2 focus:ring-accent/50"
          autoComplete="off"
        />
        
        {value && (
          <button
            type="button"
            onClick={() => {
              onChange("");
              setSuggestions([]);
              setShowSuggestions(false);
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-subtle hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Dropdown de sugerencias */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-surface-1 border border-border rounded-xl shadow-lg overflow-hidden">
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion.place_id}
              type="button"
              onClick={() => handleSelectAddress(suggestion)}
              className={`w-full px-4 py-3 text-left text-sm transition-colors flex items-start gap-3 ${
                index === selectedIndex
                  ? "bg-accent/10 text-foreground"
                  : "text-foreground-muted hover:bg-surface-2 hover:text-foreground"
              }`}
            >
              <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span className="line-clamp-2">{formatSuggestion(suggestion)}</span>
            </button>
          ))}
          
          {/* Atribución requerida por Nominatim */}
          <div className="px-4 py-2 text-[10px] text-foreground-subtle bg-surface-2 border-t border-border">
            Datos de © OpenStreetMap
          </div>
        </div>
      )}
    </div>
  );
}
