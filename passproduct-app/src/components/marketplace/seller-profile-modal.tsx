"use client";

import { X, Star, Clock, Shield, CheckCircle, MessageCircle, MapPin, Calendar, Package, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { SellerProfile } from "@/types";
import { Button, Card, Badge } from "@/components/ui";
import { formatDate } from "@/lib/utils";

interface SellerProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  seller: SellerProfile | null;
  onContact?: () => void;
}

export function SellerProfileModal({ isOpen, onClose, seller, onContact }: SellerProfileModalProps) {
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

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
                  {seller.hasPhoneVerified && (
                    <div className="flex items-center gap-2 p-2.5 bg-jade/10 rounded-lg">
                      <CheckCircle className="h-4 w-4 text-jade" />
                      <span className="text-sm text-jade">Teléfono verificado</span>
                    </div>
                  )}
                  {!seller.isVerified && !seller.isIdentityVerified && (
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
                      {seller.totalProducts}
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
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border bg-surface-1">
              <Button onClick={onContact} className="w-full" leftIcon={<MessageCircle className="h-4 w-4" />}>
                Contactar con {seller.firstName}
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
