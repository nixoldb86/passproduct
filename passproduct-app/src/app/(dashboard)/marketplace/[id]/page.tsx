"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  Truck,
  Check,
  Shield,
  Tag,
  Calendar,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Flag,
  ChevronLeft,
  ChevronRight,
  Lock,
  Clock,
  Package,
  Star,
  AlertCircle,
  Mail,
  Phone,
  User,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button, Card, Badge, SkeletonProductDetail } from "@/components/ui";
import { SellerProfileModal } from "@/components/marketplace";
import { useChatStore } from "@/store";
import { formatPrice, formatDate } from "@/lib/utils";
import { Listing, SellerProfile } from "@/types";

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const { startConversation } = useChatStore();
  const [listing, setListing] = useState<Listing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isSellerModalOpen, setIsSellerModalOpen] = useState(false);
  const [isContacting, setIsContacting] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);
  
  // Check if current user is the owner of this listing
  const isOwner = user && listing?.seller?.clerkId === user.id;

  useEffect(() => {
    const fetchListing = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/db/listings/${params.id}`);
        const data = await response.json();
        
        if (data.success && data.listing) {
          setListing(data.listing);
        } else {
          setListing(null);
        }
      } catch (error) {
        console.error("Error fetching listing:", error);
        setListing(null);
      }
      setIsLoading(false);
    };
    fetchListing();
  }, [params.id]);

  const handleContact = async (initialMessage?: string) => {
    if (!listing) return;
    
    setIsContacting(true);
    setContactError(null);
    
    try {
      const conversation = await startConversation(listing.id, initialMessage);
      if (conversation) {
        router.push(`/chat?id=${conversation.id}`);
      }
    } catch (error) {
      setContactError(error instanceof Error ? error.message : "Error al contactar");
    } finally {
      setIsContacting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto">
        <SkeletonProductDetail />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="max-w-5xl mx-auto text-center py-20">
        <Package className="h-16 w-16 text-foreground-subtle mx-auto mb-4" />
        <h1 className="text-xl font-semibold text-foreground mb-2">
          Anuncio no encontrado
        </h1>
        <p className="text-foreground-muted mb-6">
          Este anuncio no existe o ha sido eliminado.
        </p>
        <Link href="/marketplace">
          <Button variant="secondary">Volver al marketplace</Button>
        </Link>
      </div>
    );
  }

  const nextImage = () => {
    setSelectedImage((prev) =>
      prev < listing.photos.length - 1 ? prev + 1 : 0
    );
  };

  const prevImage = () => {
    setSelectedImage((prev) =>
      prev > 0 ? prev - 1 : listing.photos.length - 1
    );
  };

  // Calculate fees for display
  const shippingCost = listing.shippingEnabled ? listing.shippingCost || 0 : 0;
  const protectionFee = Math.min(listing.price * 0.02, 25);
  const total = listing.price + shippingCost + protectionFee;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Back button */}
      <Link
        href="/marketplace"
        className="inline-flex items-center gap-2 text-foreground-muted hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Volver al marketplace</span>
      </Link>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Left column - Images (3 cols) */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="lg:col-span-3"
        >
          {/* Main image with navigation */}
          <div className="relative aspect-[4/3] rounded-2xl bg-surface-1 border border-border overflow-hidden mb-4 group">
            {listing.photos[selectedImage] ? (
              <Image
                src={listing.photos[selectedImage]}
                alt={listing.title}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-6xl">{listing.category?.icon || "📦"}</span>
              </div>
            )}

            {/* Navigation arrows */}
            {listing.photos.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}

            {/* Image counter */}
            {listing.photos.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/50 text-white text-sm">
                {selectedImage + 1} / {listing.photos.length}
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {listing.photos.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {listing.photos.map((photo, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`relative h-20 w-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors ${
                    selectedImage === i
                      ? "border-accent"
                      : "border-transparent hover:border-border"
                  }`}
                >
                  <Image
                    src={photo}
                    alt={`Thumbnail ${i + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Description */}
          <Card padding="md" className="mt-6">
            <h3 className="font-medium text-foreground mb-3">Descripción</h3>
            <p className="text-foreground-muted whitespace-pre-line">
              {listing.description}
            </p>
          </Card>

          {/* Verification Section */}
          <Card padding="md" className="mt-4">
            <h3 className="font-medium text-foreground mb-4">
              Verificación del vendedor
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center ${
                    listing.hasVerifiedPurchase
                      ? "bg-jade/15 text-jade"
                      : "bg-surface-2 text-foreground-subtle"
                  }`}
                >
                  <Check className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm text-foreground">Ticket verificado</p>
                  <p className="text-xs text-foreground-subtle">
                    {listing.hasVerifiedPurchase
                      ? "El vendedor ha subido prueba de compra"
                      : "No verificado"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center ${
                    listing.hasValidWarranty
                      ? "bg-jade/15 text-jade"
                      : "bg-surface-2 text-foreground-subtle"
                  }`}
                >
                  <Shield className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm text-foreground">Garantía activa</p>
                  <p className="text-xs text-foreground-subtle">
                    {listing.hasValidWarranty
                      ? "El producto tiene garantía vigente"
                      : "Sin garantía activa"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center ${
                    listing.hasVerifiedIdentifier
                      ? "bg-jade/15 text-jade"
                      : "bg-surface-2 text-foreground-subtle"
                  }`}
                >
                  <Lock className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm text-foreground">Identificador verificado</p>
                  <p className="text-xs text-foreground-subtle">
                    {listing.hasVerifiedIdentifier
                      ? "IMEI/Serial comprobado (no expuesto)"
                      : "No verificado"}
                  </p>
                </div>
              </div>

              {/* Separador */}
              <div className="border-t border-border my-3 pt-3">
                <p className="text-xs text-foreground-subtle mb-3">Verificaciones del vendedor</p>
              </div>

              <div className="flex items-center gap-3">
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center ${
                    listing.seller?.isIdentityVerified
                      ? "bg-jade/15 text-jade"
                      : "bg-surface-2 text-foreground-subtle"
                  }`}
                >
                  <User className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm text-foreground">Identidad verificada</p>
                  <p className="text-xs text-foreground-subtle">
                    {listing.seller?.isIdentityVerified
                      ? "DNI/Pasaporte verificado"
                      : "No verificado"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center ${
                    listing.seller?.isEmailVerified
                      ? "bg-jade/15 text-jade"
                      : "bg-surface-2 text-foreground-subtle"
                  }`}
                >
                  <Mail className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm text-foreground">Email verificado</p>
                  <p className="text-xs text-foreground-subtle">
                    {listing.seller?.isEmailVerified
                      ? "Dirección de email confirmada"
                      : "No verificado"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center ${
                    listing.seller?.isPhoneVerified
                      ? "bg-jade/15 text-jade"
                      : "bg-surface-2 text-foreground-subtle"
                  }`}
                >
                  <Phone className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm text-foreground">Teléfono verificado</p>
                  <p className="text-xs text-foreground-subtle">
                    {listing.seller?.isPhoneVerified
                      ? "Número de teléfono confirmado"
                      : "No verificado"}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Right column - Details & Purchase (2 cols) */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="lg:col-span-2 space-y-4"
        >
          {/* Title & Actions */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="info" size="md">
                {listing.category?.icon} {listing.category?.name}
              </Badge>
              {listing.isBoosted && (
                <Badge variant="warning" size="md">
                  Destacado
                </Badge>
              )}
            </div>
            <h1 className="text-2xl font-semibold text-foreground">
              {listing.title}
            </h1>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            {listing.hasVerifiedPurchase && (
              <Badge variant="verified" size="md">
                <Check className="h-3 w-3" />
                Compra verificada
              </Badge>
            )}
            {listing.hasValidWarranty && (
              <Badge variant="warranty" size="md">
                <Shield className="h-3 w-3" />
                Garantía activa
              </Badge>
            )}
            {listing.hasVerifiedIdentifier && (
              <Badge variant="serial" size="md">
                ID verificado
              </Badge>
            )}
            {listing.seller?.isIdentityVerified && (
              <Badge variant="verified" size="md">
                <User className="h-3 w-3" />
                Vendedor verificado
              </Badge>
            )}
            {listing.seller?.isEmailVerified && (
              <Badge variant="info" size="md">
                <Mail className="h-3 w-3" />
                Email verificado
              </Badge>
            )}
            {listing.seller?.isPhoneVerified && (
              <Badge variant="info" size="md">
                <Phone className="h-3 w-3" />
                Teléfono verificado
              </Badge>
            )}
          </div>

          {/* Location & Shipping */}
          <div className="flex flex-wrap gap-4 text-sm text-foreground-muted">
            {listing.location && (
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                {listing.location}
              </span>
            )}
            {listing.shippingEnabled && (
              <span className="flex items-center gap-1.5 text-jade">
                <Truck className="h-4 w-4" />
                Envío disponible
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {formatDate(listing.publishedAt || listing.createdAt)}
            </span>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-foreground-subtle">
            <span className="flex items-center gap-1.5">
              <Eye className="h-4 w-4" />
              {listing.viewCount} visitas
            </span>
            <span className="flex items-center gap-1.5">
              <Heart className="h-4 w-4" />
              {listing.favoriteCount} favoritos
            </span>
          </div>

          {/* Price Card */}
          <Card padding="md" className="bg-gradient-to-br from-surface-1 to-surface-2">
            <div className="space-y-3">
              <div className="flex items-end justify-between">
                <span className="text-foreground-muted">Precio</span>
                <span className="text-3xl font-semibold text-foreground tabular-nums">
                  {formatPrice(listing.price)}
                </span>
              </div>
              {listing.shippingEnabled && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground-muted">Envío</span>
                  <span className="text-foreground">
                    {listing.shippingCost
                      ? formatPrice(listing.shippingCost)
                      : "Gratis"}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between text-sm">
                <span className="text-foreground-muted">Protección comprador</span>
                <span className="text-foreground">
                  {formatPrice(protectionFee)}
                </span>
              </div>
              <div className="border-t border-border pt-3 flex items-center justify-between">
                <span className="font-medium text-foreground">Total</span>
                <span className="text-xl font-semibold text-accent tabular-nums">
                  {formatPrice(total)}
                </span>
              </div>
            </div>
          </Card>

          {/* Protection Info */}
          <Card padding="sm" className="bg-jade/5 border-jade/20">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-jade flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-jade">
                  Protección comprador
                </p>
                <p className="text-xs text-jade/80 mt-1">
                  Tu pago se retiene hasta que confirmes la recepción. Si algo no
                  va bien, abrimos una disputa.
                </p>
              </div>
            </div>
          </Card>

          {/* Actions */}
          <div className="space-y-3">
            {isOwner ? (
              /* Owner view - cannot buy own product */
              <Card padding="sm" className="bg-amber-500/10 border-amber-500/30">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-amber-400">
                      Este es tu anuncio
                    </p>
                    <p className="text-xs text-amber-400/80">
                      No puedes comprar tu propio producto
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="flex-1"
                    onClick={() => router.push(`/wallet/${listing?.productId}`)}
                  >
                    Ver en mi wallet
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1"
                  >
                    Editar anuncio
                  </Button>
                </div>
              </Card>
            ) : (
              /* Buyer view - normal purchase flow */
              <>
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={() => handleContact("Hola, me interesa tu producto. ¿Está disponible?")}
                  isLoading={isContacting}
                >
                  Comprar ahora
                </Button>
                <Button
                  variant="secondary"
                  className="w-full"
                  size="lg"
                  leftIcon={<MessageCircle className="h-4 w-4" />}
                  onClick={() => handleContact()}
                  isLoading={isContacting}
                >
                  Contactar vendedor
                </Button>
                {contactError && (
                  <p className="text-sm text-error text-center">{contactError}</p>
                )}
              </>
            )}
          </div>

          {/* Secondary Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="flex-1"
              leftIcon={
                <Heart
                  className={`h-4 w-4 ${isFavorite ? "fill-error text-error" : ""}`}
                />
              }
              onClick={() => setIsFavorite(!isFavorite)}
            >
              {isFavorite ? "Guardado" : "Guardar"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex-1"
              leftIcon={<Share2 className="h-4 w-4" />}
            >
              Compartir
            </Button>
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<Flag className="h-4 w-4" />}
            >
              Reportar
            </Button>
          </div>

          {/* Seller Card */}
          <Card padding="md">
            {listing.seller ? (
              <>
                <button
                  onClick={() => setIsSellerModalOpen(true)}
                  className="flex items-center gap-3 mb-4 w-full text-left hover:bg-surface-1 rounded-lg p-1 -m-1 transition-colors"
                >
                  <div className="relative h-12 w-12 rounded-full overflow-hidden flex-shrink-0">
                    <Image
                      src={listing.seller.avatarUrl}
                      alt={listing.seller.firstName}
                      fill
                      className="object-cover"
                    />
                    {/* Online indicator */}
                    {new Date().getTime() - new Date(listing.seller.lastActive).getTime() < 15 * 60 * 1000 && (
                      <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-jade border-2 border-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">
                      {listing.seller.firstName} {listing.seller.lastName.charAt(0)}.
                    </p>
                    <p className="text-xs text-foreground-subtle">
                      Miembro desde {formatDate(listing.seller.memberSince, { month: "short", year: "numeric" })} • {listing.seller.totalSales} ventas
                    </p>
                  </div>
                </button>
                <div className="flex items-center gap-4 text-sm text-foreground-muted">
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {listing.seller.responseTime}
                  </span>
                  <span className="flex items-center gap-1 text-amber-500">
                    <Star className="h-4 w-4 fill-current" />
                    {listing.seller.rating.toFixed(1)} ({listing.seller.reviewCount})
                  </span>
                </div>
                {listing.seller.isVerified && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <div className="flex items-center gap-2 text-jade text-sm">
                      <Check className="h-4 w-4" />
                      <span>Vendedor verificado</span>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-accent/20 flex items-center justify-center text-accent font-semibold">
                  ?
                </div>
                <div>
                  <p className="font-medium text-foreground">Vendedor</p>
                  <p className="text-xs text-foreground-subtle">
                    Información no disponible
                  </p>
                </div>
              </div>
            )}
          </Card>
        </motion.div>
      </div>

      {/* Seller Profile Modal */}
      {listing.seller && (
        <SellerProfileModal
          isOpen={isSellerModalOpen}
          onClose={() => setIsSellerModalOpen(false)}
          seller={listing.seller}
          currentListingId={listing.id}
          onContact={() => {
            setIsSellerModalOpen(false);
            // TODO: Navigate to chat
          }}
        />
      )}
    </div>
  );
}
