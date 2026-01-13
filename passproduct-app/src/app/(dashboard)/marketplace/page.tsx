"use client";

import { useEffect, useState } from "react";
import {
  Search,
  SlidersHorizontal,
  Grid3X3,
  List,
  ChevronDown,
  X,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useMarketplaceStore } from "@/store";
import { Button, Card, SkeletonCard, Select } from "@/components/ui";
import { ListingCard } from "@/components/marketplace/listing-card";
import { mockCategories } from "@/lib/mock-data";
import { FilterOptions } from "@/types";

const sortOptions = [
  { value: "date_desc", label: "Más recientes" },
  { value: "date_asc", label: "Más antiguos" },
  { value: "price_asc", label: "Precio: menor a mayor" },
  { value: "price_desc", label: "Precio: mayor a menor" },
];

export default function MarketplacePage() {
  const { listings, isLoading, filters, fetchListings, setFilters } =
    useMarketplaceStore();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Local filter state
  const [localFilters, setLocalFilters] = useState<FilterOptions>({});

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const handleFilterChange = (key: keyof FilterOptions, value: unknown) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    fetchListings(newFilters);
  };

  const clearFilters = () => {
    setLocalFilters({});
    fetchListings({});
  };

  const activeFilterCount = Object.values(localFilters).filter(
    (v) => v !== undefined && v !== ""
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Marketplace</h1>
          <p className="text-foreground-muted mt-1">
            {listings.length} anuncios disponibles
          </p>
        </div>
      </div>

      {/* Search & Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-subtle" />
          <input
            type="text"
            placeholder="Buscar productos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-4 bg-surface-1 border border-border rounded-xl text-sm text-foreground placeholder:text-foreground-subtle focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none transition-all"
          />
        </div>

        {/* Filter & Sort */}
        <div className="flex gap-2">
          <Button
            variant="secondary"
            leftIcon={<SlidersHorizontal className="h-4 w-4" />}
            onClick={() => setShowFilters(!showFilters)}
          >
            Filtros
            {activeFilterCount > 0 && (
              <span className="ml-1 h-5 w-5 rounded-full bg-accent text-[10px] text-[#0C0C0E] flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </Button>

          <Select
            options={sortOptions}
            value={localFilters.sortBy || "date_desc"}
            onChange={(e) =>
              handleFilterChange("sortBy", e.target.value as FilterOptions["sortBy"])
            }
            className="w-44"
          />

          {/* View mode toggle */}
          <div className="hidden sm:flex items-center gap-1 p-1 bg-surface-1 border border-border rounded-lg">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-md transition-colors ${
                viewMode === "grid"
                  ? "bg-surface-2 text-foreground"
                  : "text-foreground-subtle hover:text-foreground"
              }`}
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-md transition-colors ${
                viewMode === "list"
                  ? "bg-surface-2 text-foreground"
                  : "text-foreground-subtle hover:text-foreground"
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <Card padding="md" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-foreground">Filtros</h3>
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-foreground-muted hover:text-foreground flex items-center gap-1"
                  >
                    <X className="h-3 w-3" />
                    Limpiar filtros
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Category */}
                <Select
                  label="Categoría"
                  options={[
                    { value: "", label: "Todas las categorías" },
                    ...mockCategories.map((cat) => ({
                      value: cat.id,
                      label: `${cat.icon} ${cat.name}`,
                    })),
                  ]}
                  value={localFilters.categoryId || ""}
                  onChange={(e) =>
                    handleFilterChange("categoryId", e.target.value || undefined)
                  }
                />

                {/* Price range */}
                <div>
                  <label className="block text-sm font-medium text-foreground-muted mb-2">
                    Precio mínimo
                  </label>
                  <input
                    type="number"
                    placeholder="0 €"
                    className="w-full h-10 px-4 bg-surface-1 border border-border rounded-xl text-sm"
                    value={localFilters.minPrice || ""}
                    onChange={(e) =>
                      handleFilterChange(
                        "minPrice",
                        e.target.value ? parseInt(e.target.value) : undefined
                      )
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground-muted mb-2">
                    Precio máximo
                  </label>
                  <input
                    type="number"
                    placeholder="Sin límite"
                    className="w-full h-10 px-4 bg-surface-1 border border-border rounded-xl text-sm"
                    value={localFilters.maxPrice || ""}
                    onChange={(e) =>
                      handleFilterChange(
                        "maxPrice",
                        e.target.value ? parseInt(e.target.value) : undefined
                      )
                    }
                  />
                </div>

                {/* Verified only */}
                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={localFilters.hasVerifiedPurchase || false}
                      onChange={(e) =>
                        handleFilterChange(
                          "hasVerifiedPurchase",
                          e.target.checked || undefined
                        )
                      }
                      className="h-4 w-4 rounded border-border bg-surface-1 text-accent focus:ring-accent"
                    />
                    <span className="text-sm text-foreground-muted">
                      Solo verificados
                    </span>
                  </label>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Categories Quick Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <Button
          variant={!localFilters.categoryId ? "primary" : "ghost"}
          size="sm"
          onClick={() => handleFilterChange("categoryId", undefined)}
        >
          Todos
        </Button>
        {mockCategories.map((cat) => (
          <Button
            key={cat.id}
            variant={localFilters.categoryId === cat.id ? "primary" : "ghost"}
            size="sm"
            onClick={() =>
              handleFilterChange(
                "categoryId",
                localFilters.categoryId === cat.id ? undefined : cat.id
              )
            }
          >
            {cat.icon} {cat.name}
          </Button>
        ))}
      </div>

      {/* Listings Grid */}
      <div
        className={
          viewMode === "grid"
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            : "space-y-4"
        }
      >
        <AnimatePresence mode="popLayout">
          {isLoading ? (
            // Loading skeletons
            Array.from({ length: 6 }).map((_, i) => (
              <motion.div
                key={`skeleton-${i}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <SkeletonCard />
              </motion.div>
            ))
          ) : listings.length > 0 ? (
            // Listings
            listings.map((listing, index) => (
              <motion.div
                key={listing.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <ListingCard listing={listing} viewMode={viewMode} />
              </motion.div>
            ))
          ) : (
            // Empty state
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full"
            >
              <Card padding="lg" className="text-center py-16">
                <div className="h-16 w-16 rounded-2xl bg-surface-2 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="h-8 w-8 text-foreground-subtle" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No hay resultados
                </h3>
                <p className="text-foreground-muted mb-6 max-w-sm mx-auto">
                  No encontramos anuncios con estos filtros. Prueba a ajustar tus
                  criterios de búsqueda.
                </p>
                <Button variant="secondary" onClick={clearFilters}>
                  Limpiar filtros
                </Button>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
