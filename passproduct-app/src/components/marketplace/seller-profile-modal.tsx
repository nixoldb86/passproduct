"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, Star, Clock, Shield, CheckCircle, MessageCircle, MapPin, Calendar, Package, TrendingUp, ShoppingBag, Tag, ChevronRight, UserPlus, UserMinus, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { SellerProfile, Listing } from "@/types";
import { Button, Card, Badge } from "@/components/ui";
import { formatDate, formatPrice } from "@/lib/utils";
import { getActiveListingsBySellerId, getSoldListingsBySellerId } from "@/lib/mock-data";
import { useFollowStore } from "@/store";

type TabType = "profile" | "active" | "sold";

interface SellerProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  seller: SellerProfile | null;
  onContact?: () => void;
  currentListingId?: string; // Para excluir el listing actual de la lista
}

export function SellerProfileModal({ isOpen, onClose, seller, onContact, currentListingId }: SellerProfileModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>("profile");
  const { following, followUser, unfollowUser, isFollowing, fetchFollowing, getFollowersCount } = useFollowStore();
  
  // Cargar follows al montar
  useEffect(() => {
    fetchFollowing();
  }, [fetchFollowing]);

  // Estado de si sigo a este vendedor
  const amFollowing = seller ? isFollowing(seller.id) : false;
  const followersCount = seller ? getFollowersCount(seller.id) : 0;

  const handleToggleFollow = async () => {
    if (!seller) return;
    if (amFollowing) {
      await unfollowUser(seller.id);
    } else {
      await followUser(seller.id);
    }
  };

  // Obtener listings del vendedor
  const activeListings = useMemo(() => {
    if (!seller) return [];
    const listings = getActiveListingsBySellerId(seller.id);
    // Excluir el listing actual si se proporciona
    return currentListingId 
      ? listings.filter(l => l.id !== currentListingId)
      : listings;
  }, [seller, currentListingId]);

  const soldListings = useMemo(() => {
    if (!seller) return [];
    return getSoldListingsBySellerId(seller.id);
  }, [seller]);

  if (!seller) return null;

  const getLastActiveText = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 5) return "En línea ahora";
    if (minutes < 60) return `Activo hace ${minutes} min`;
    if (hours < 24) return `Activo hace ${hours}h`;
    if (days === 1) return "Activo ayer";
    return `Activo hace ${days} días`;
  };

  const isOnline = new Date().getTime() - new Date(seller.lastActive).getTime() < 15 * 60 * 1000;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-md sm:max-h-[90vh] bg-background rounded-2xl shadow-xl z-50 flex flex-col overflow-hidden"
          >
            {/* Header con foto de perfil */}
            <div className="relative bg-gradient-to-br from-accent/20 to-accent/5 p-6 pb-12">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-lg bg-black/20 text-white hover:bg-black/30 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="relative">
                  <div className="h-20 w-20 rounded-full overflow-hidden border-4 border-white shadow-lg">
                    <Image
                      src={seller.avatarUrl}
                      alt={`${seller.firstName} ${seller.lastName}`}
                      width={80}
                      height={80}
                      className="object-cover"
                    />
                  </div>
                  {/* Online indicator */}
                  {isOnline && (
                    <div className="absolute bottom-1 right-1 h-4 w-4 rounded-full bg-jade border-2 border-white" />
                  )}
                </div>

                {/* Nombre y ubicación */}
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-foreground">
                    {seller.firstName} {seller.lastName.charAt(0)}.
                  </h2>
                  <div className="flex items-center gap-1 text-foreground-muted text-sm">
                    <MapPin className="h-3.5 w-3.5" />
                    {seller.location}
                  </div>
                  <p className="text-xs text-foreground-subtle mt-1">
                    {getLastActiveText(seller.lastActive)}
                  </p>
                </div>
              </div>
            </div>

            {/* Stats Row */}
            <div className="flex justify-around -mt-6 px-4 relative z-10">
              <Card padding="sm" className="flex-1 mx-1 text-center shadow-md">
                <div className="flex items-center justify-center gap-1 text-amber-500 mb-1">
                  <Star className="h-4 w-4 fill-current" />
                  <span className="font-bold text-lg">{seller.rating.toFixed(1)}</span>
                </div>
                <p className="text-xs text-foreground-muted">{seller.reviewCount} reseñas</p>
              </Card>

              <Card padding="sm" className="flex-1 mx-1 text-center shadow-md">
                <div className="flex items-center justify-center gap-1 text-jade mb-1">
                  <Package className="h-4 w-4" />
                  <span className="font-bold text-lg">{seller.totalSales}</span>
                </div>
                <p className="text-xs text-foreground-muted">ventas</p>
              </Card>

              <Card padding="sm" className="flex-1 mx-1 text-center shadow-md">
                <div className="flex items-center justify-center gap-1 text-info mb-1">
                  <Clock className="h-4 w-4" />
                  <span className="font-bold text-sm">{seller.responseTime}</span>
                </div>
                <p className="text-xs text-foreground-muted">respuesta</p>
              </Card>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-border px-4">
              <button
                onClick={() => setActiveTab("profile")}
                className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
                  activeTab === "profile" ? "text-accent" : "text-foreground-muted hover:text-foreground"
                }`}
              >
                Perfil
                {activeTab === "profile" && (
                  <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
                )}
              </button>
              <button
                onClick={() => setActiveTab("active")}
                className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
                  activeTab === "active" ? "text-accent" : "text-foreground-muted hover:text-foreground"
                }`}
              >
                En venta ({activeListings.length})
                {activeTab === "active" && (
                  <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
                )}
              </button>
              <button
                onClick={() => setActiveTab("sold")}
                className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
                  activeTab === "sold" ? "text-accent" : "text-foreground-muted hover:text-foreground"
                }`}
              >
                Vendidos ({seller.totalSales})
                {activeTab === "sold" && (
                  <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
                )}
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <AnimatePresence mode="wait">
                {/* Tab: Profile */}
                {activeTab === "profile" && (
                  <motion.div
                    key="profile"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    {/* Bio */}
                    {seller.bio && (
                      <div className="p-3 bg-surface-1 rounded-xl">
                        <p className="text-sm text-foreground-muted italic">"{seller.bio}"</p>
                      </div>
                    )}

                    {/* Verificaciones */}
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-foreground-muted">Verificaciones</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {seller.isVerified && (
                          <div className="flex items-center gap-2 p-2.5 bg-jade/10 rounded-lg">
                            <CheckCircle className="h-4 w-4 text-jade" />
                            <span className="text-sm text-jade">Cuenta verificada</span>
                          </div>
                        )}
                        {seller.isIdentityVerified && (
                          <div className="flex items-center gap-2 p-2.5 bg-jade/10 rounded-lg">
                            <Shield className="h-4 w-4 text-jade" />
                            <span className="text-sm text-jade">DNI verificado</span>
                          </div>
                        )}
                        {seller.isEmailVerified && (
                          <div className="flex items-center gap-2 p-2.5 bg-jade/10 rounded-lg">
                            <CheckCircle className="h-4 w-4 text-jade" />
                            <span className="text-sm text-jade">Email verificado</span>
                          </div>
                        )}
                        {seller.isPhoneVerified && (
                          <div className="flex items-center gap-2 p-2.5 bg-jade/10 rounded-lg">
                            <CheckCircle className="h-4 w-4 text-jade" />
                            <span className="text-sm text-jade">Teléfono verificado</span>
                          </div>
                        )}
                        {!seller.isVerified && !seller.isIdentityVerified && !seller.isEmailVerified && !seller.isPhoneVerified && (
                          <div className="flex items-center gap-2 p-2.5 bg-surface-1 rounded-lg col-span-2">
                            <Shield className="h-4 w-4 text-foreground-subtle" />
                            <span className="text-sm text-foreground-muted">Sin verificaciones adicionales</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Detalles */}
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-foreground-muted">Detalles</h3>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-3 bg-surface-1 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-foreground-subtle" />
                            <span className="text-sm text-foreground-muted">Miembro desde</span>
                          </div>
                          <span className="text-sm font-medium text-foreground">
                            {formatDate(seller.memberSince, { month: "long", year: "numeric" })}
                          </span>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-surface-1 rounded-lg">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-foreground-subtle" />
                            <span className="text-sm text-foreground-muted">Productos activos</span>
                          </div>
                          <span className="text-sm font-medium text-foreground">
                            {activeListings.length}
                          </span>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-surface-1 rounded-lg">
                          <div className="flex items-center gap-2">
                            <ShoppingBag className="h-4 w-4 text-foreground-subtle" />
                            <span className="text-sm text-foreground-muted">Ventas completadas</span>
                          </div>
                          <span className="text-sm font-medium text-jade">
                            {seller.totalSales}
                          </span>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-surface-1 rounded-lg">
                          <div className="flex items-center gap-2">
                            <MessageCircle className="h-4 w-4 text-foreground-subtle" />
                            <span className="text-sm text-foreground-muted">Tasa de respuesta</span>
                          </div>
                          <span className={`text-sm font-medium ${
                            seller.responseRate >= 90 ? "text-jade" : 
                            seller.responseRate >= 70 ? "text-amber-500" : "text-error"
                          }`}>
                            {seller.responseRate}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Rating visual */}
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-foreground-muted">Valoración</h3>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-6 w-6 ${
                              star <= Math.floor(seller.rating)
                                ? "text-amber-400 fill-amber-400"
                                : star <= seller.rating
                                ? "text-amber-400 fill-amber-400/50"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                        <span className="ml-2 text-lg font-semibold text-foreground">
                          {seller.rating.toFixed(1)}
                        </span>
                        <span className="text-sm text-foreground-muted">
                          ({seller.reviewCount} opiniones)
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Tab: Active Listings */}
                {activeTab === "active" && (
                  <motion.div
                    key="active"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-3"
                  >
                    {activeListings.length > 0 ? (
                      activeListings.map((listing) => (
                        <ListingCard key={listing.id} listing={listing} onClose={onClose} />
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <ShoppingBag className="h-12 w-12 text-foreground-subtle mx-auto mb-3" />
                        <p className="text-foreground-muted">
                          No hay otros productos en venta
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Tab: Sold Listings */}
                {activeTab === "sold" && (
                  <motion.div
                    key="sold"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-3"
                  >
                    {seller.totalSales > 0 ? (
                      <>
                        {/* Mensaje explicativo */}
                        <div className="p-3 bg-jade/10 rounded-xl">
                          <p className="text-sm text-jade">
                            {seller.firstName} ha completado {seller.totalSales} ventas exitosas
                          </p>
                        </div>
                        
                        {/* Mostrar listings vendidos si los hay en mock */}
                        {soldListings.length > 0 ? (
                          soldListings.map((listing) => (
                            <ListingCard key={listing.id} listing={listing} onClose={onClose} isSold />
                          ))
                        ) : (
                          /* Historial resumido cuando no hay detalle de vendidos */
                          <div className="space-y-2">
                            <div className="flex items-center justify-between p-3 bg-surface-1 rounded-lg">
                              <span className="text-sm text-foreground-muted">Total de ventas</span>
                              <span className="font-semibold text-foreground">{seller.totalSales}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-surface-1 rounded-lg">
                              <span className="text-sm text-foreground-muted">Valoración media</span>
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                                <span className="font-semibold text-foreground">{seller.rating.toFixed(1)}</span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-surface-1 rounded-lg">
                              <span className="text-sm text-foreground-muted">Reseñas positivas</span>
                              <span className="font-semibold text-jade">{seller.reviewCount}</span>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <Tag className="h-12 w-12 text-foreground-subtle mx-auto mb-3" />
                        <p className="text-foreground-muted">
                          Aún no ha realizado ventas
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border bg-surface-1 space-y-3">
              {/* Seguidores */}
              <div className="flex items-center justify-center gap-4 text-sm text-foreground-muted">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span><strong className="text-foreground">{followersCount}</strong> seguidores</span>
                </div>
              </div>
              
              {/* Botones */}
              <div className="flex gap-2">
                <Button
                  onClick={handleToggleFollow}
                  variant={amFollowing ? "secondary" : "outline"}
                  className={`flex-1 ${amFollowing ? "border-accent text-accent" : ""}`}
                  leftIcon={amFollowing ? <UserMinus className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                >
                  {amFollowing ? "Siguiendo" : "Seguir"}
                </Button>
                <Button 
                  onClick={onContact} 
                  className="flex-1" 
                  leftIcon={<MessageCircle className="h-4 w-4" />}
                >
                  Contactar
                </Button>
              </div>
              
              {amFollowing && (
                <p className="text-xs text-center text-foreground-subtle">
                  Recibirás notificaciones cuando {seller.firstName} publique
                </p>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Componente para mostrar cada listing en las listas
function ListingCard({ listing, onClose, isSold = false }: { listing: Listing; onClose: () => void; isSold?: boolean }) {
  const router = useRouter();

  const handleClick = () => {
    onClose(); // Cerrar el modal primero
    // Pequeño delay para que se vea la animación de cierre
    setTimeout(() => {
      router.push(`/marketplace/${listing.id}`);
    }, 150);
  };

  return (
    <button
      onClick={handleClick}
      className="w-full flex gap-3 p-3 bg-surface-1 rounded-xl hover:bg-surface-2 transition-colors group text-left"
    >
      {/* Imagen */}
      <div className="relative h-16 w-16 rounded-lg overflow-hidden flex-shrink-0 bg-surface-2">
        {listing.photos[0] ? (
          <Image
            src={listing.photos[0]}
            alt={listing.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-2xl">
            {listing.category?.icon || "📦"}
          </div>
        )}
        {isSold && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white text-xs font-medium">VENDIDO</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground line-clamp-1 group-hover:text-accent transition-colors">
          {listing.title}
        </p>
        <p className="text-xs text-foreground-muted mt-0.5">
          {listing.category?.icon} {listing.category?.name}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span className={`text-sm font-semibold ${isSold ? "text-foreground-muted line-through" : "text-accent"}`}>
            {formatPrice(listing.price)}
          </span>
          {listing.hasVerifiedPurchase && (
            <Badge variant="verified" size="sm">
              <CheckCircle className="h-2.5 w-2.5" />
            </Badge>
          )}
        </div>
      </div>

      {/* Flecha */}
      <div className="flex items-center text-foreground-subtle group-hover:text-accent transition-colors">
        <ChevronRight className="h-5 w-5" />
      </div>
    </button>
  );
}
