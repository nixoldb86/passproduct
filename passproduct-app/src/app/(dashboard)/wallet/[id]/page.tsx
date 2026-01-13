"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Store,
  Shield,
  Tag,
  Package,
  TrendingUp,
  TrendingDown,
  ExternalLink,
  Bell,
  Share2,
  MoreHorizontal,
  Check,
  Zap,
  Scale,
  Crown,
  BookOpen,
  Phone,
  Mail,
  Clock,
  AlertTriangle,
  Info,
} from "lucide-react";
import { motion } from "framer-motion";
import { useWalletStore } from "@/store";
import { Button, Card, Badge, SkeletonProductDetail } from "@/components/ui";
import { getPriceRecommendations } from "@/lib/mock-data";
import {
  formatPrice,
  formatDate,
  isWarrantyValid,
  getDaysUntilWarrantyExpires,
  calculateDepreciation,
} from "@/lib/utils";
import { Product, CONDITION_LABELS } from "@/types";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { products } = useWalletStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    // Buscar producto en el store
    setIsLoading(true);
    const found = products.find((p) => p.id === params.id);
    setProduct(found || null);
    setIsLoading(false);
  }, [params.id, products]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <SkeletonProductDetail />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20">
        <Package className="h-16 w-16 text-foreground-subtle mx-auto mb-4" />
        <h1 className="text-xl font-semibold text-foreground mb-2">
          Producto no encontrado
        </h1>
        <p className="text-foreground-muted mb-6">
          El producto que buscas no existe o ha sido eliminado.
        </p>
        <Link href="/wallet">
          <Button variant="secondary">Volver al wallet</Button>
        </Link>
      </div>
    );
  }

  const warrantyValid = isWarrantyValid(product.warrantyEndDate || null);
  const daysUntilExpiry = getDaysUntilWarrantyExpires(product.warrantyEndDate || null);
  const depreciation = product.purchasePrice && product.estimatedValue
    ? calculateDepreciation(product.purchasePrice, product.estimatedValue)
    : null;
  const priceRecommendations = product.estimatedValue
    ? getPriceRecommendations(product.estimatedValue)
    : null;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back button */}
      <Link
        href="/wallet"
        className="inline-flex items-center gap-2 text-foreground-muted hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Volver al wallet</span>
      </Link>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Left column - Images */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Main image */}
          <div className="relative aspect-square rounded-2xl bg-surface-1 border border-border overflow-hidden mb-4">
            {product.photos[selectedImage] ? (
              <Image
                src={product.photos[selectedImage]}
                alt={`${product.brand} ${product.model}`}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-6xl">{product.category?.icon || "📦"}</span>
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {product.photos.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {product.photos.map((photo, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`relative h-16 w-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors ${
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
        </motion.div>

        {/* Right column - Details */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="space-y-6"
        >
          {/* Title & Actions */}
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="info" size="md">
                  {product.category?.icon} {product.category?.name}
                </Badge>
              </div>
              <h1 className="text-2xl font-semibold text-foreground">
                {product.brand} {product.model}
              </h1>
              {product.variant && (
                <p className="text-foreground-muted mt-1">{product.variant}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <Share2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            {product.proofOfPurchaseUrl && (
              <Badge variant="verified" size="md">
                <Check className="h-3 w-3" />
                Compra verificada
              </Badge>
            )}
            {warrantyValid && (
              <Badge
                variant={daysUntilExpiry && daysUntilExpiry < 60 ? "warning" : "warranty"}
                size="md"
              >
                <Shield className="h-3 w-3" />
                Garantía hasta {formatDate(product.warrantyEndDate!)}
              </Badge>
            )}
            {(product.serialLast4 || product.imeiLast4) && (
              <Badge variant="serial" size="md">
                ID: ***{product.serialLast4 || product.imeiLast4}
              </Badge>
            )}
          </div>

          {/* Value Card - Solo mostrar si hay datos de valor */}
          {(product.resaleValue?.minPrice || product.estimatedValue) && (
            <Card padding="md" className="bg-gradient-to-br from-surface-1 to-surface-2">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-foreground-muted">
                  Valor de reventa estimado
                </span>
                {product.resaleValue?.marketTrend && product.resaleValue.marketTrend !== "null" && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1 ${
                      product.resaleValue.marketTrend === "falling" 
                        ? "bg-error/10 text-error" 
                        : product.resaleValue.marketTrend === "rising"
                        ? "bg-jade/10 text-jade"
                        : "bg-foreground-subtle/10 text-foreground-muted"
                    }`}
                  >
                    {product.resaleValue.marketTrend === "falling" ? (
                      <TrendingDown className="h-3 w-3" />
                    ) : product.resaleValue.marketTrend === "rising" ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : null}
                    {product.resaleValue.marketTrend === "stable" ? "Precio estable" : 
                     product.resaleValue.marketTrend === "rising" ? "Subiendo" : "Bajando"}
                  </span>
                )}
              </div>
              
              {product.resaleValue && product.resaleValue.minPrice > 0 ? (
                <>
                  <p className="text-3xl font-semibold text-foreground tabular-nums">
                    {formatPrice(product.resaleValue.minPrice)} - {formatPrice(product.resaleValue.maxPrice)}
                  </p>
                  {product.purchasePrice && product.resaleValue.percentage > 0 && (
                    <p className="text-sm text-foreground-subtle mt-1">
                      Mantiene el {product.resaleValue.percentage}% del valor original ({formatPrice(product.purchasePrice)})
                    </p>
                  )}
                  {product.resaleValue.notes && !product.resaleValue.notes.toLowerCase().includes("no exist") && (
                    <p className="text-xs text-foreground-muted mt-2 pt-2 border-t border-border">
                      📊 {product.resaleValue.notes}
                    </p>
                  )}
                </>
              ) : product.estimatedValue ? (
                <>
                  <p className="text-3xl font-semibold text-foreground tabular-nums">
                    {formatPrice(product.estimatedValue)}
                  </p>
                  {product.purchasePrice && depreciation !== null && (
                    <p className="text-sm text-foreground-subtle mt-1 flex items-center gap-1">
                      {depreciation > 0 ? (
                        <TrendingDown className="h-4 w-4 text-error" />
                      ) : (
                        <TrendingUp className="h-4 w-4 text-jade" />
                      )}
                      {Math.abs(depreciation)}% desde compra ({formatPrice(product.purchasePrice)})
                    </p>
                  )}
                </>
              ) : null}
            </Card>
          )}

          {/* Price Recommendations */}
          {priceRecommendations && (
            <Card padding="md">
              <h3 className="text-sm font-medium text-foreground-muted mb-4">
                Precio recomendado para vender
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-surface-2 border border-border text-center">
                  <Zap className="h-4 w-4 text-jade mx-auto mb-2" />
                  <p className="text-xs text-foreground-subtle mb-1">Rápido</p>
                  <p className="font-semibold text-foreground tabular-nums">
                    {formatPrice(priceRecommendations.fast)}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-accent/5 border border-accent/20 text-center">
                  <Scale className="h-4 w-4 text-accent mx-auto mb-2" />
                  <p className="text-xs text-foreground-subtle mb-1">Justo</p>
                  <p className="font-semibold text-accent tabular-nums">
                    {formatPrice(priceRecommendations.fair)}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-surface-2 border border-border text-center">
                  <Crown className="h-4 w-4 text-[#8B5CF6] mx-auto mb-2" />
                  <p className="text-xs text-foreground-subtle mb-1">Máximo</p>
                  <p className="font-semibold text-foreground tabular-nums">
                    {formatPrice(priceRecommendations.max)}
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Details Grid */}
          <Card padding="md">
            <h3 className="text-sm font-medium text-foreground-muted mb-4">
              Detalles del producto
            </h3>
            <div className="grid grid-cols-2 gap-y-4 gap-x-6">
              <div className="flex items-center gap-3">
                <Tag className="h-4 w-4 text-foreground-subtle" />
                <div>
                  <p className="text-xs text-foreground-subtle">Estado</p>
                  <p className="text-sm text-foreground">
                    {CONDITION_LABELS[product.condition]}
                  </p>
                </div>
              </div>
              {product.purchaseDate && (
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-foreground-subtle" />
                  <div>
                    <p className="text-xs text-foreground-subtle">Fecha compra</p>
                    <p className="text-sm text-foreground">
                      {formatDate(product.purchaseDate)}
                    </p>
                  </div>
                </div>
              )}
              {product.purchaseStore && (
                <div className="flex items-center gap-3">
                  <Store className="h-4 w-4 text-foreground-subtle" />
                  <div>
                    <p className="text-xs text-foreground-subtle">Tienda</p>
                    <p className="text-sm text-foreground">{product.purchaseStore}</p>
                  </div>
                </div>
              )}
              {product.warrantyEndDate && (
                <div className="flex items-center gap-3">
                  <Shield className="h-4 w-4 text-foreground-subtle" />
                  <div>
                    <p className="text-xs text-foreground-subtle">Garantía hasta</p>
                    <p className="text-sm text-foreground">
                      {formatDate(product.warrantyEndDate)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Accessories */}
          {product.accessories && Object.keys(product.accessories).length > 0 && (
            <Card padding="md">
              <h3 className="text-sm font-medium text-foreground-muted mb-3">
                Accesorios incluidos
              </h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(product.accessories).map(([key, value]) => (
                  <span
                    key={key}
                    className={`px-3 py-1 rounded-lg text-sm ${
                      value
                        ? "bg-jade/10 text-jade"
                        : "bg-surface-2 text-foreground-subtle line-through"
                    }`}
                  >
                    {value && <Check className="inline h-3 w-3 mr-1" />}
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </span>
                ))}
              </div>
            </Card>
          )}

          {/* Warranty Status Card */}
          {product.warrantyEndDate && (
            <Card padding="md" className={daysUntilExpiry && daysUntilExpiry < 60 
              ? "border-warning/30 bg-warning/5" 
              : "border-jade/30 bg-jade/5"
            }>
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Shield className={`h-4 w-4 ${daysUntilExpiry && daysUntilExpiry < 60 ? "text-warning" : "text-jade"}`} />
                  Estado de la garantía
                </h3>
                {daysUntilExpiry && daysUntilExpiry < 60 && (
                  <Badge variant="warning" size="sm">
                    <AlertTriangle className="h-3 w-3" />
                    Próxima a expirar
                  </Badge>
                )}
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-foreground-muted">Válida hasta</span>
                  <span className="text-sm font-medium text-foreground">
                    {formatDate(product.warrantyEndDate)}
                  </span>
                </div>
                {daysUntilExpiry !== null && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-foreground-muted">Tiempo restante</span>
                    <span className={`text-sm font-medium ${daysUntilExpiry < 60 ? "text-warning" : "text-jade"}`}>
                      {daysUntilExpiry > 0 
                        ? `${daysUntilExpiry} días` 
                        : "Expirada"}
                    </span>
                  </div>
                )}
                {product.warrantyNotes && (
                  <p className="text-xs text-foreground-subtle pt-2 border-t border-border mt-2">
                    <Info className="inline h-3 w-3 mr-1" />
                    {product.warrantyNotes}
                  </p>
                )}
              </div>
            </Card>
          )}

          {/* Warranty Contact - Solo mostrar si tiene al menos un dato de contacto */}
          {product.warrantyContact && (product.warrantyContact.phone || product.warrantyContact.email || product.warrantyContact.url) && (
            <Card padding="md">
              <h3 className="text-sm font-medium text-foreground-muted mb-3">
                Contacto para garantía
              </h3>
              <div className="space-y-3">
                {product.warrantyContact.phone && (
                  <a
                    href={`tel:${product.warrantyContact.phone}`}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-2 transition-colors"
                  >
                    <Phone className="h-4 w-4 text-jade" />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {product.warrantyContact.phone}
                      </p>
                      {product.warrantyContact.hours && (
                        <p className="text-xs text-foreground-subtle">
                          {product.warrantyContact.hours}
                        </p>
                      )}
                    </div>
                  </a>
                )}
                {product.warrantyContact.email && (
                  <a
                    href={`mailto:${product.warrantyContact.email}`}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-2 transition-colors"
                  >
                    <Mail className="h-4 w-4 text-jade" />
                    <p className="text-sm font-medium text-foreground">
                      {product.warrantyContact.email}
                    </p>
                  </a>
                )}
                {product.warrantyContact.url && (
                  <a
                    href={product.warrantyContact.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-2 transition-colors"
                  >
                    <ExternalLink className="h-4 w-4 text-jade" />
                    <p className="text-sm font-medium text-foreground">
                      Página de soporte
                    </p>
                  </a>
                )}
                {product.warrantyContact.notes && (
                  <p className="text-xs text-foreground-subtle p-2 bg-surface-2 rounded-lg">
                    💡 {product.warrantyContact.notes}
                  </p>
                )}
              </div>
            </Card>
          )}

          {/* Manual Link */}
          {product.manualUrl && (
            <a
              href={product.manualUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Card padding="md" className="hover:border-accent/50 transition-colors cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                    <BookOpen className="h-5 w-5 text-accent" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">Manual de usuario</p>
                    <p className="text-xs text-foreground-subtle">
                      Ver manual oficial de {product.brand}
                    </p>
                  </div>
                  <ExternalLink className="h-4 w-4 text-foreground-subtle group-hover:text-accent transition-colors" />
                </div>
              </Card>
            </a>
          )}

          {/* Specs */}
          {product.specs && product.specs.length > 0 && (
            <Card padding="md">
              <h3 className="text-sm font-medium text-foreground-muted mb-3">
                Especificaciones
              </h3>
              <div className="space-y-2">
                {product.specs.map((spec, i) => (
                  <div key={i} className="flex justify-between items-center py-1 border-b border-border last:border-0">
                    <span className="text-sm text-foreground-subtle">{spec.label}</span>
                    <span className="text-sm font-medium text-foreground">{spec.value}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-3 pt-4">
            <Link href={`/sell?productId=${product.id}`}>
              <Button className="w-full" size="lg">
                Vender en PassProduct
              </Button>
            </Link>
            <Button variant="secondary" size="lg" leftIcon={<Bell className="h-4 w-4" />}>
              Crear alerta de precio
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
