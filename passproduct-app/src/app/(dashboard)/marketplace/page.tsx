"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import {
  Search,
  SlidersHorizontal,
  Grid3X3,
  List,
  Map,
  ChevronDown,
  ChevronRight,
  X,
  Sparkles,
  Shield,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useMarketplaceStore } from "@/store";
import { Button, Card, SkeletonCard, Select } from "@/components/ui";
import { ListingCard, SellerProfileModal } from "@/components/marketplace";
import { mockCategories, categoryGroups } from "@/lib/mock-data";
import { FilterOptions, SellerProfile } from "@/types";

// Lazy load MapView - solo se carga cuando el usuario selecciona vista mapa
const MapView = dynamic(
  () => import("@/components/marketplace/map-view").then((mod) => mod.MapView),
  {
    ssr: false,
    loading: () => (
      <div className="h-[500px] bg-surface-1 rounded-2xl flex items-center justify-center animate-pulse">
        <div className="text-foreground-muted text-sm">Cargando mapa...</div>
      </div>
    ),
  }
);

const sortOptions = [
  { value: "date_desc", label: "Más recientes" },
  { value: "date_asc", label: "Más antiguos" },
  { value: "price_asc", label: "Precio: menor a mayor" },
  { value: "price_desc", label: "Precio: mayor a menor" },
];

function MarketplaceContent() {
  const searchParams = useSearchParams();
  const urlSearchQuery = searchParams.get("search") || "";
  
  const { listings, isLoading, filters, fetchListings, setFilters } =
    useMarketplaceStore();
  const [viewMode, setViewMode] = useState<"grid" | "list" | "map">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState(urlSearchQuery);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  // Seller profile modal state
  const [selectedSeller, setSelectedSeller] = useState<SellerProfile | null>(null);
  const [isSellerModalOpen, setIsSellerModalOpen] = useState(false);

  const handleSellerClick = (seller: SellerProfile) => {
    setSelectedSeller(seller);
    setIsSellerModalOpen(true);
  };

  // Local filter state
  const [localFilters, setLocalFilters] = useState<FilterOptions>({});

  // Sincronizar searchQuery con la URL
  useEffect(() => {
    setSearchQuery(urlSearchQuery);
  }, [urlSearchQuery]);

  // Cargar listings con búsqueda inicial de URL
  useEffect(() => {
    if (urlSearchQuery) {
      fetchListings({ search: urlSearchQuery });
    } else {
      fetchListings();
    }
  }, [fetchListings, urlSearchQuery]);

  const handleFilterChange = (key: keyof FilterOptions, value: unknown) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    fetchListings(newFilters);
  };

  const clearFilters = () => {
    setLocalFilters({});
    setExpandedGroup(null);
    fetchListings({});
  };

  const activeFilterCount = Object.values(localFilters).filter(
    (v) => v !== undefined && v !== "" && v !== false
  ).length;

  // Obtener categorías de un grupo
  const getCategoriesForGroup = (groupId: string) => {
    const group = categoryGroups.find((g) => g.id === groupId);
    if (!group) return [];
    return mockCategories.filter((cat) => group.categoryIds.includes(cat.id));
  };

  // Seleccionar grupo de categorías
  const handleGroupSelect = (groupId: string) => {
    if (expandedGroup === groupId) {
      setExpandedGroup(null);
      handleFilterChange("categoryId", undefined);
    } else {
      setExpandedGroup(groupId);
      // Seleccionar todas las categorías del grupo
      const group = categoryGroups.find((g) => g.id === groupId);
      if (group) {
        handleFilterChange("categoryGroupId", groupId);
        handleFilterChange("categoryId", undefined);
      }
    }
  };

  // Filtrar listings según filtros locales (para la vista de mapa)
  const filteredListings = useMemo(() => {
    return listings.filter((listing) => {
      // Filtrar por búsqueda
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          listing.title.toLowerCase().includes(query) ||
          listing.product?.brand?.toLowerCase().includes(query) ||
          listing.product?.model?.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Filtrar por garantía
      if (localFilters.hasWarranty) {
        const hasValidWarranty = listing.product?.warrantyEndDate
          ? new Date(listing.product.warrantyEndDate) > new Date()
          : false;
        if (!hasValidWarranty) return false;
      }

      return true;
    });
  }, [listings, searchQuery, localFilters.hasWarranty]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Marketplace</h1>
          <p className="text-foreground-muted mt-1">
            {filteredListings.length} anuncios disponibles
          </p>
        </div>
      </div>

      {/* Search & Filters Bar */}
      <div className="relative flex items-center gap-2 sm:gap-3">
        {/* Mobile Search - Collapsed (circle button) */}
        {!isSearchExpanded && (
          <button
            type="button"
            onClick={() => setIsSearchExpanded(true)}
            className="md:hidden h-10 w-10 flex-shrink-0 rounded-full bg-surface-1 border border-border flex items-center justify-center hover:bg-surface-2 transition-colors"
            aria-label="Buscar"
          >
            <Search className="h-4 w-4 text-foreground-subtle" />
          </button>
        )}

        {/* Mobile Search - Expanded (animated overlay) */}
        <AnimatePresence>
          {isSearchExpanded && (
            <motion.form
              initial={{ width: 40, opacity: 0.5 }}
              animate={{ width: "100%", opacity: 1 }}
              exit={{ width: 40, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="md:hidden absolute inset-0 z-10 flex items-center bg-background"
              onSubmit={(e) => {
                e.preventDefault();
                fetchListings({ ...localFilters, search: searchQuery });
                setIsSearchExpanded(false);
              }}
            >
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-subtle" />
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-full h-10 pl-10 pr-10 bg-surface-1 border border-border rounded-xl text-sm text-foreground placeholder:text-foreground-subtle focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => {
                    setIsSearchExpanded(false);
                    if (!searchQuery) {
                      fetchListings({ ...localFilters, search: undefined });
                    }
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-surface-2 rounded-full transition-colors"
                >
                  <X className="h-4 w-4 text-foreground-muted" />
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Desktop Search - Always visible */}
        <form
          className="hidden md:flex relative flex-1 max-w-xl"
          onSubmit={(e) => {
            e.preventDefault();
            fetchListings({ ...localFilters, search: searchQuery });
          }}
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-subtle" />
          <input
            type="text"
            placeholder="Buscar productos... (Enter para buscar)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-4 bg-surface-1 border border-border rounded-xl text-sm text-foreground placeholder:text-foreground-subtle focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                fetchListings({ ...localFilters, search: undefined });
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-surface-2 rounded-full transition-colors"
            >
              <X className="h-3 w-3 text-foreground-muted" />
            </button>
          )}
        </form>

        {/* Filter & Sort & View Mode - Fill available space on mobile */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-1 md:flex-none md:ml-auto">
          <Button
            variant="secondary"
            leftIcon={<SlidersHorizontal className="h-4 w-4" />}
            onClick={() => setShowFilters(!showFilters)}
            className="!px-2.5 sm:!px-4"
          >
            <span className="hidden sm:inline">Filtros</span>
            {activeFilterCount > 0 && (
              <span className="sm:ml-1.5 h-5 w-5 rounded-full bg-accent text-[10px] text-[#0C0C0E] flex items-center justify-center font-medium">
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
            className="flex-1 min-w-0 md:flex-none md:w-44"
          />

          {/* View mode toggle */}
          <div className="flex items-center gap-0.5 sm:gap-1 p-0.5 sm:p-1 h-10 bg-surface-1 border border-border rounded-lg">
            <button
              onClick={() => setViewMode("grid")}
              className={`h-full px-2 sm:px-2.5 rounded-md transition-colors flex items-center justify-center ${
                viewMode === "grid"
                  ? "bg-surface-2 text-foreground"
                  : "text-foreground-subtle hover:text-foreground"
              }`}
              title="Vista mosaico"
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`h-full px-2 sm:px-2.5 rounded-md transition-colors flex items-center justify-center ${
                viewMode === "list"
                  ? "bg-surface-2 text-foreground"
                  : "text-foreground-subtle hover:text-foreground"
              }`}
              title="Vista lista"
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("map")}
              className={`h-full px-2 sm:px-2.5 rounded-md transition-colors flex items-center justify-center ${
                viewMode === "map"
                  ? "bg-surface-2 text-foreground"
                  : "text-foreground-subtle hover:text-foreground"
              }`}
              title="Vista mapa"
            >
              <Map className="h-4 w-4" />
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
                {/* Category Select */}
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

                {/* Checkboxes */}
                <div className="space-y-3">
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
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={localFilters.hasWarranty || false}
                      onChange={(e) =>
                        handleFilterChange(
                          "hasWarranty",
                          e.target.checked || undefined
                        )
                      }
                      className="h-4 w-4 rounded border-border bg-surface-1 text-accent focus:ring-accent"
                    />
                    <span className="text-sm text-foreground-muted flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      Con garantía
                    </span>
                  </label>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Categories Groups Quick Filter */}
      <div className="space-y-2">
        {/* Grupos principales */}
        <div className="flex gap-2 overflow-x-auto overflow-y-hidden touch-pan-x pb-2 scrollbar-hide">
          <button
            onClick={() => {
              setExpandedGroup(null);
              handleFilterChange("categoryId", undefined);
              handleFilterChange("categoryGroupId", undefined);
            }}
            className={`flex-shrink-0 px-4 py-2.5 rounded-full text-sm font-medium transition-all ${
              !localFilters.categoryId && !expandedGroup
                ? "bg-accent text-[#0C0C0E]"
                : "bg-surface-2 text-foreground-muted hover:bg-surface-1 hover:text-foreground"
            }`}
          >
            Todos
          </button>
          {categoryGroups.map((group) => (
            <button
              key={group.id}
              onClick={() => handleGroupSelect(group.id)}
              title={group.name}
              className={`group/cat relative flex-shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-medium transition-all ${
                expandedGroup === group.id
                  ? "bg-accent text-[#0C0C0E]"
                  : "bg-surface-2 text-foreground-muted hover:bg-surface-1 hover:text-foreground"
              }`}
            >
              <span className="text-base">{group.icon}</span>
              <span className="hidden sm:inline max-w-[80px] truncate">{group.name}</span>
              <ChevronDown
                className={`h-3 w-3 transition-transform ${
                  expandedGroup === group.id ? "rotate-180" : ""
                }`}
              />
              {/* Tooltip en móvil */}
              <span className="sm:hidden absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-surface-1 border border-border rounded text-xs whitespace-nowrap opacity-0 group-hover/cat:opacity-100 pointer-events-none transition-opacity z-50">
                {group.name}
              </span>
            </button>
          ))}
        </div>

        {/* Subcategorías del grupo expandido */}
        <AnimatePresence>
          {expandedGroup && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="flex gap-2 overflow-x-auto overflow-y-hidden touch-pan-x pb-2 pl-4 scrollbar-hide">
                <button
                  onClick={() => handleFilterChange("categoryId", undefined)}
                  className={`flex-shrink-0 px-4 py-2.5 rounded-full text-sm font-medium transition-all ${
                    !localFilters.categoryId
                      ? "bg-accent/20 text-accent border border-accent/30"
                      : "bg-surface-2 text-foreground-muted hover:bg-surface-1 hover:text-foreground"
                  }`}
                >
                  Todas
                </button>
                {getCategoriesForGroup(expandedGroup).map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() =>
                      handleFilterChange(
                        "categoryId",
                        localFilters.categoryId === cat.id ? undefined : cat.id
                      )
                    }
                    title={cat.name}
                    className={`group/subcat relative flex-shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-medium transition-all ${
                      localFilters.categoryId === cat.id
                        ? "bg-accent/20 text-accent border border-accent/30"
                        : "bg-surface-2 text-foreground-muted hover:bg-surface-1 hover:text-foreground"
                    }`}
                  >
                    <span className="text-base">{cat.icon}</span>
                    <span className="hidden sm:inline max-w-[100px] truncate">{cat.name}</span>
                    {/* Tooltip en móvil */}
                    <span className="sm:hidden absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-surface-1 border border-border rounded text-xs whitespace-nowrap opacity-0 group-hover/subcat:opacity-100 pointer-events-none transition-opacity z-50">
                      {cat.name}
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Map View */}
      {viewMode === "map" ? (
        <MapView listings={filteredListings} />
      ) : (
        /* Listings Grid/List */
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
            ) : filteredListings.length > 0 ? (
              // Listings
              filteredListings.map((listing, index) => (
                <motion.div
                  key={listing.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <ListingCard
                    listing={listing}
                    viewMode={viewMode}
                    onSellerClick={handleSellerClick}
                  />
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
      )}

      {/* Seller Profile Modal */}
      <SellerProfileModal
        isOpen={isSellerModalOpen}
        onClose={() => {
          setIsSellerModalOpen(false);
          setSelectedSeller(null);
        }}
        seller={selectedSeller}
        onContact={() => {
          // TODO: Navigate to chat with seller
          setIsSellerModalOpen(false);
        }}
      />
    </div>
  );
}

// Wrap in Suspense for useSearchParams
export default function MarketplacePage() {
  return (
    <Suspense fallback={
      <div className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    }>
      <MarketplaceContent />
    </Suspense>
  );
}
