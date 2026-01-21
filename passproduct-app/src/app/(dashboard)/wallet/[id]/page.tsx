"use client";

import React, { useEffect, useState, useRef } from "react";
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
  ImageOff,
  Camera,
  FileText,
  Download,
  X,
  ShieldCheck,
  ShieldOff,
  ShieldPlus,
  File,
  Upload,
  Loader2,
  Pencil,
  Trash2,
  RefreshCw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useWalletStore } from "@/store";
import { formatDate as formatDateRelative } from "@/lib/utils";
import { Button, Card, Badge, SkeletonProductDetail } from "@/components/ui";
import { EditProductModal } from "@/components/wallet";
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
  const { products, updateProduct, deleteProduct, refreshMarketPrices } = useWalletStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [isUploadingInvoice, setIsUploadingInvoice] = useState(false);
  const [showFullInvoice, setShowFullInvoice] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRefreshingPrices, setIsRefreshingPrices] = useState(false);
  const invoiceInputRef = useRef<HTMLInputElement>(null);
  const optionsMenuRef = useRef<HTMLDivElement>(null);

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (optionsMenuRef.current && !optionsMenuRef.current.contains(event.target as Node)) {
        setShowOptionsMenu(false);
      }
    }
    if (showOptionsMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showOptionsMenu]);

  // Manejar eliminación del producto
  const handleDelete = async () => {
    if (!product) return;
    setIsDeleting(true);
    const success = await deleteProduct(product.id);
    setIsDeleting(false);
    if (success) {
      router.push("/wallet");
    }
  };

  // Detectar tipo de archivo por extensión o base64
  const getFileType = (url: string): "pdf" | "image" | "other" => {
    // Detectar base64
    if (url.startsWith("data:image/")) return "image";
    if (url.startsWith("data:application/pdf")) return "pdf";
    
    // Detectar por extensión
    const ext = url.split(".").pop()?.toLowerCase();
    if (ext === "pdf") return "pdf";
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext || "")) return "image";
    return "other";
  };

  // Manejar subida de factura
  const handleInvoiceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !product) return;

    setIsUploadingInvoice(true);
    
    try {
      // Convertir a base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      
      const base64 = await base64Promise;
      
      // Actualizar producto con la nueva factura
      const success = await updateProduct(product.id, {
        proofOfPurchaseUrl: base64,
      });
      
      if (success) {
        // Actualizar estado local
        setProduct({
          ...product,
          proofOfPurchaseUrl: base64,
        });
      }
    } catch (error) {
      console.error("Error uploading invoice:", error);
      alert("Error al subir la factura. Inténtalo de nuevo.");
    } finally {
      setIsUploadingInvoice(false);
      // Limpiar input para permitir subir el mismo archivo de nuevo
      if (invoiceInputRef.current) {
        invoiceInputRef.current.value = "";
      }
    }
  };

  useEffect(() => {
    // Buscar producto en el store
    setIsLoading(true);
    const found = products.find((p) => p.id === params.id);
    setProduct(found || null);
    setIsLoading(false);
  }, [params.id, products]);

  // Buscar imágenes de stock si el producto no tiene fotos
  useEffect(() => {
    if (!product) return;
    
    const hasPhotos = product.photos && product.photos.length > 0;
    const hasStockPhotos = product.stockPhotos && product.stockPhotos.length > 0;
    
    if (!hasPhotos && !hasStockPhotos && product.brand && product.model) {
      // Buscar imágenes de stock para este producto
      fetch("/api/enrich-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brand: product.brand,
          model: product.model,
          variant: product.variant,
          needsImages: true,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.data?.stockImages?.length > 0) {
            // Actualizar producto con las imágenes de stock
            updateProduct(product.id, { stockPhotos: data.data.stockImages });
          }
        })
        .catch(console.error);
    }
  }, [product?.id, product?.photos, product?.stockPhotos, product?.brand, product?.model, product?.variant, updateProduct]);

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
  // Usar marketPrices guardados o fallback a getPriceRecommendations
  const priceRecommendations = product.marketPrices 
    ? product.marketPrices
    : product.estimatedValue
      ? getPriceRecommendations(product.estimatedValue)
      : null;
  
  const handleRefreshPrices = async () => {
    if (!product || isRefreshingPrices) return;
    setIsRefreshingPrices(true);
    try {
      await refreshMarketPrices(product.id);
      // Actualizar el producto local con los nuevos datos
      const updatedProduct = products.find(p => p.id === product.id);
      if (updatedProduct) {
        setProduct(updatedProduct);
      }
    } finally {
      setIsRefreshingPrices(false);
    }
  };

  // Combinar fotos reales y de stock para galería
  const hasRealPhotos = product.photos && product.photos.length > 0;
  const hasStockPhotos = product.stockPhotos && product.stockPhotos.length > 0;
  const allPhotos: { url: string; isStock: boolean }[] = [
    ...(product.photos || []).map(url => ({ url, isStock: false })),
    ...(product.stockPhotos || []).map(url => ({ url, isStock: true })),
  ];
  const currentPhoto = allPhotos[selectedImage];
  const needsRealPhotos = !hasRealPhotos && hasStockPhotos;

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
            {currentPhoto ? (
              <>
                <Image
                  src={currentPhoto.url}
                  alt={`${product.brand} ${product.model}`}
                  fill
                  className="object-cover"
                  priority
                />
                {currentPhoto.isStock && (
                  <div className="absolute bottom-3 left-3 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/70 text-white text-xs">
                    <ImageOff className="h-3.5 w-3.5" />
                    Imagen de referencia
                  </div>
                )}
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-6xl">{product.category?.icon || "📦"}</span>
              </div>
            )}
          </div>

          {/* Aviso: se necesitan fotos reales para vender */}
          {needsRealPhotos && (
            <div className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <div className="flex items-start gap-2">
                <Camera className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-amber-600">Foto de referencia</p>
                  <p className="text-xs text-amber-500/80 mt-0.5">
                    Para vender este producto necesitarás añadir fotos reales.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Thumbnails */}
          {allPhotos.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {allPhotos.map((photo, i) => (
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
                    src={photo.url}
                    alt={`Thumbnail ${i + 1}`}
                    fill
                    className="object-cover"
                  />
                  {photo.isStock && (
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <ImageOff className="h-3 w-3 text-white" />
                    </div>
                  )}
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
              <div className="relative" ref={optionsMenuRef}>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowOptionsMenu(!showOptionsMenu)}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
                
                {/* Menú desplegable */}
                <AnimatePresence>
                  {showOptionsMenu && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.1 }}
                      className="absolute right-0 top-full mt-1 w-40 bg-surface-1 border border-border rounded-lg shadow-lg z-50 overflow-hidden"
                    >
                      <button
                        onClick={() => {
                          setShowOptionsMenu(false);
                          setShowEditModal(true);
                        }}
                        className="w-full px-4 py-3 text-left text-sm text-foreground hover:bg-surface-2 flex items-center gap-2 transition-colors"
                      >
                        <Pencil className="h-4 w-4" />
                        Editar
                      </button>
                      <button
                        onClick={() => {
                          setShowOptionsMenu(false);
                          setShowDeleteConfirm(true);
                        }}
                        className="w-full px-4 py-3 text-left text-sm text-red-500 hover:bg-red-500/10 flex items-center gap-2 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                        Eliminar
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
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
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-foreground-muted">
                  Precio recomendado para vender
                </h3>
                <button
                  onClick={handleRefreshPrices}
                  disabled={isRefreshingPrices}
                  className="p-1.5 rounded-full hover:bg-surface-2 transition-colors disabled:opacity-50"
                  title="Actualizar valoración de mercado"
                >
                  {isRefreshingPrices ? (
                    <Loader2 className="h-4 w-4 text-accent animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4 text-foreground-subtle hover:text-accent" />
                  )}
                </button>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {/* MÍNIMO: El más bajo */}
                <div className="p-3 rounded-xl bg-surface-2 border border-border text-center">
                  <Zap className="h-4 w-4 text-amber-500 mx-auto mb-2" />
                  <p className="text-xs text-foreground-subtle mb-1">Mínimo</p>
                  <p className="font-semibold text-foreground tabular-nums">
                    {formatPrice(priceRecommendations.minimo)}
                  </p>
                  <p className="text-[10px] text-foreground-subtle mt-0.5">Serás el más barato</p>
                </div>
                {/* IDEAL: El promedio (EN EL MEDIO) */}
                <div className="p-3 rounded-xl bg-accent/5 border border-accent/20 text-center">
                  <Scale className="h-4 w-4 text-accent mx-auto mb-2" />
                  <p className="text-xs text-foreground-subtle mb-1">Ideal</p>
                  <p className="font-semibold text-accent tabular-nums">
                    {formatPrice(priceRecommendations.ideal)}
                  </p>
                  <p className="text-[10px] text-foreground-subtle mt-0.5">Precio promedio</p>
                </div>
                {/* RÁPIDO: 90% del ideal */}
                <div className="p-3 rounded-xl bg-jade/5 border border-jade/20 text-center">
                  <Crown className="h-4 w-4 text-jade mx-auto mb-2" />
                  <p className="text-xs text-foreground-subtle mb-1">Rápido</p>
                  <p className="font-semibold text-jade tabular-nums">
                    {formatPrice(priceRecommendations.rapido)}
                  </p>
                  <p className="text-[10px] text-foreground-subtle mt-0.5">Sin malvender</p>
                </div>
              </div>
              {/* Fecha de última actualización */}
              {product.marketPrices?.lastUpdated && (
                <p className="text-[10px] text-foreground-subtle mt-3 text-center">
                  Actualizado: {new Date(product.marketPrices.lastUpdated).toLocaleDateString("es-ES", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                  })}
                </p>
              )}
            </Card>
          )}

          {/* Factura y Garantía - Botón de acceso rápido */}
          <Card padding="md" className="bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20">
            <button
              onClick={() => setShowInvoiceModal(true)}
              className="w-full flex items-center gap-4 text-left"
            >
              <div className="h-12 w-12 rounded-xl bg-accent/20 flex items-center justify-center flex-shrink-0">
                <FileText className="h-6 w-6 text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground">Factura y garantía</p>
                <p className="text-sm text-foreground-muted mt-0.5">
                  {product.proofOfPurchaseUrl ? "Ver factura original" : "Sin factura"} 
                  {product.warrantyEndDate && ` • Garantía hasta ${formatDate(product.warrantyEndDate)}`}
                </p>
              </div>
              <ExternalLink className="h-5 w-5 text-accent flex-shrink-0" />
            </button>
          </Card>

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
                    {CONDITION_LABELS[product.condition?.toUpperCase() as keyof typeof CONDITION_LABELS] || "Bueno"}
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
            <Card padding="md" className={
              daysUntilExpiry !== null && daysUntilExpiry <= 0
                ? "border-error/30 bg-error/5" // Expirada
                : daysUntilExpiry && daysUntilExpiry < 60 
                  ? "border-warning/30 bg-warning/5" // Próxima a expirar
                  : "border-jade/30 bg-jade/5" // Válida
            }>
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Shield className={`h-4 w-4 ${
                    daysUntilExpiry !== null && daysUntilExpiry <= 0 
                      ? "text-error" 
                      : daysUntilExpiry && daysUntilExpiry < 60 
                        ? "text-warning" 
                        : "text-jade"
                  }`} />
                  Estado de la garantía
                </h3>
                {daysUntilExpiry !== null && daysUntilExpiry <= 0 && (
                  <Badge variant="error" size="sm">
                    <AlertTriangle className="h-3 w-3" />
                    Expirada
                  </Badge>
                )}
                {daysUntilExpiry && daysUntilExpiry > 0 && daysUntilExpiry < 60 && (
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
                    <span className={`text-sm font-medium ${
                      daysUntilExpiry <= 0 
                        ? "text-error" 
                        : daysUntilExpiry < 60 
                          ? "text-warning" 
                          : "text-jade"
                    }`}>
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
              <Button 
                className="w-full" 
                size="lg"
                leftIcon={needsRealPhotos ? <Camera className="h-4 w-4" /> : undefined}
              >
                {needsRealPhotos ? "Añadir fotos y vender" : "Vender en PassProduct"}
              </Button>
            </Link>
            <Button variant="secondary" size="lg" leftIcon={<Bell className="h-4 w-4" />}>
              Crear alerta de precio
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Modal de edición */}
      {product && (
        <EditProductModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          product={product}
        />
      )}

      {/* Modal de confirmación de eliminación */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-surface-1 rounded-xl p-6 max-w-sm w-full shadow-xl border border-border"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-500/10 rounded-full">
                  <Trash2 className="h-5 w-5 text-red-500" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                  ¿Eliminar producto?
                </h3>
              </div>
              
              <p className="text-foreground-muted text-sm mb-6">
                Se eliminará <strong>{product?.brand} {product?.model}</strong> de tu wallet. Esta acción no se puede deshacer.
              </p>
              
              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                >
                  Cancelar
                </Button>
                <Button
                  variant="danger"
                  className="flex-1"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Eliminando...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Eliminar
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input oculto para subir factura */}
      <input
        ref={invoiceInputRef}
        type="file"
        accept="image/*,.pdf"
        onChange={handleInvoiceUpload}
        className="hidden"
      />

      {/* Lightbox - Factura a pantalla completa */}
      <AnimatePresence>
        {showFullInvoice && product?.proofOfPurchaseUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 flex items-center justify-center z-[60] p-4"
            onClick={() => setShowFullInvoice(false)}
          >
            {/* Botón cerrar */}
            <button
              onClick={() => setShowFullInvoice(false)}
              className="absolute top-4 right-4 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
            >
              <X className="h-6 w-6" />
            </button>
            
            {/* Botón descargar */}
            <a
              href={product.proofOfPurchaseUrl}
              download
              onClick={(e) => e.stopPropagation()}
              className="absolute top-4 left-4 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10 flex items-center gap-2"
            >
              <Download className="h-5 w-5" />
              <span className="text-sm">Descargar</span>
            </a>
            
            {/* Imagen */}
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative w-full h-full max-w-5xl max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={product.proofOfPurchaseUrl}
                alt="Factura de compra"
                fill
                className="object-contain"
                sizes="100vw"
                priority
              />
            </motion.div>
            
            {/* Texto de ayuda */}
            <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/50 text-sm">
              Clic fuera de la imagen o en ✕ para cerrar
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Factura y Garantía */}
      <AnimatePresence>
        {showInvoiceModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            onClick={() => setShowInvoiceModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-surface-1 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-border"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    Factura y garantía
                  </h3>
                  <p className="text-sm text-foreground-muted">
                    {product.brand} {product.model}
                  </p>
                </div>
                <button
                  onClick={() => setShowInvoiceModal(false)}
                  className="p-2 rounded-lg hover:bg-surface-2 transition-colors text-foreground-muted"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(90vh-140px)]">
                
                {/* Factura - Imagen grande */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <FileText className="h-4 w-4 text-accent" />
                    Factura de compra
                  </h4>
                  
                  {product.proofOfPurchaseUrl ? (
                    <div className="bg-surface-2 rounded-lg border border-border overflow-hidden">
                      {/* Info de compra */}
                      <div className="p-3 flex items-center justify-between border-b border-border">
                        <div className="text-sm">
                          {product.purchaseStore && (
                            <span className="text-foreground font-medium">{product.purchaseStore}</span>
                          )}
                          {product.purchaseDate && (
                            <span className="text-foreground-muted ml-2">
                              {formatDate(product.purchaseDate)}
                            </span>
                          )}
                          {product.purchasePrice && (
                            <span className="text-foreground font-semibold ml-3">
                              {formatPrice(product.purchasePrice)}
                            </span>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => window.open(product.proofOfPurchaseUrl, "_blank")}
                            className="p-2 rounded-lg hover:bg-surface-3 transition-colors text-foreground-muted hover:text-accent flex items-center gap-1 text-xs"
                            title="Abrir en nueva pestaña"
                          >
                            <ExternalLink className="h-4 w-4" />
                            <span className="hidden sm:inline">Abrir</span>
                          </button>
                          <a
                            href={product.proofOfPurchaseUrl}
                            download
                            onClick={(e) => e.stopPropagation()}
                            className="p-2 rounded-lg hover:bg-surface-3 transition-colors text-foreground-muted hover:text-accent flex items-center gap-1 text-xs"
                            title="Descargar"
                          >
                            <Download className="h-4 w-4" />
                            <span className="hidden sm:inline">Descargar</span>
                          </a>
                          <button
                            onClick={() => invoiceInputRef.current?.click()}
                            disabled={isUploadingInvoice}
                            className="p-2 rounded-lg hover:bg-surface-3 transition-colors text-foreground-muted hover:text-accent flex items-center gap-1 text-xs"
                            title="Cambiar factura"
                          >
                            {isUploadingInvoice ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Upload className="h-4 w-4" />
                            )}
                            <span className="hidden sm:inline">Cambiar</span>
                          </button>
                        </div>
                      </div>
                      
                      {/* Preview de la factura */}
                      {getFileType(product.proofOfPurchaseUrl) === "image" ? (
                        <button
                          onClick={() => setShowFullInvoice(true)}
                          className="w-full relative bg-black/50 cursor-zoom-in group"
                        >
                          <div className="relative w-full" style={{ minHeight: "300px", maxHeight: "500px" }}>
                            <Image
                              src={product.proofOfPurchaseUrl}
                              alt="Factura de compra"
                              fill
                              className="object-contain"
                              sizes="(max-width: 768px) 100vw, 600px"
                            />
                          </div>
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/70 text-white px-3 py-1.5 rounded-lg text-sm flex items-center gap-2">
                              🔍 Ampliar
                            </span>
                          </div>
                        </button>
                      ) : getFileType(product.proofOfPurchaseUrl) === "pdf" ? (
                        <button
                          onClick={() => window.open(product.proofOfPurchaseUrl, "_blank")}
                          className="w-full p-8 flex flex-col items-center justify-center gap-3 hover:bg-surface-3 transition-colors cursor-pointer"
                        >
                          <FileText className="h-16 w-16 text-accent" />
                          <span className="text-sm text-foreground-muted">
                            Clic para abrir el PDF
                          </span>
                        </button>
                      ) : (
                        <button
                          onClick={() => window.open(product.proofOfPurchaseUrl, "_blank")}
                          className="w-full p-8 flex flex-col items-center justify-center gap-3 hover:bg-surface-3 transition-colors cursor-pointer"
                        >
                          <File className="h-16 w-16 text-foreground-muted" />
                          <span className="text-sm text-foreground-muted">
                            Clic para abrir documento
                          </span>
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="bg-surface-2/50 rounded-lg p-6 border border-dashed border-border text-center">
                      <FileText className="h-10 w-10 text-foreground-subtle mx-auto mb-2" />
                      <p className="text-foreground-muted font-medium">Sin factura registrada</p>
                      <p className="text-xs text-foreground-subtle mt-1 mb-4">
                        Sube una foto o PDF de tu factura
                      </p>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => invoiceInputRef.current?.click()}
                        disabled={isUploadingInvoice}
                      >
                        {isUploadingInvoice ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Subiendo...
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4 mr-2" />
                            Subir factura
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>

                {/* Garantía */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-jade" />
                    Información de garantía
                  </h4>
                  
                  {(product.warrantyEndDate || product.warrantyNotes) ? (
                    <div className="bg-jade/5 rounded-lg p-4 border border-jade/20">
                      {product.warrantyNotes && (
                        <p className="text-sm text-foreground mb-2">
                          {product.warrantyNotes}
                        </p>
                      )}
                      {product.warrantyEndDate && (
                        <p className="text-sm text-foreground-muted">
                          <span className="font-medium text-jade">Válida hasta:</span>{" "}
                          {formatDate(product.warrantyEndDate)}
                        </p>
                      )}
                      {product.warrantyContact && (
                        <div className="mt-3 pt-3 border-t border-jade/20 text-sm space-y-1">
                          <p className="text-foreground-muted font-medium">Contacto de garantía:</p>
                          {product.warrantyContact.phone && (
                            <p className="text-foreground-subtle">📞 {product.warrantyContact.phone}</p>
                          )}
                          {product.warrantyContact.email && (
                            <p className="text-foreground-subtle">✉️ {product.warrantyContact.email}</p>
                          )}
                          {product.warrantyContact.url && (
                            <a 
                              href={product.warrantyContact.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-accent hover:underline flex items-center gap-1"
                            >
                              🌐 {product.warrantyContact.url}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-surface-2/50 rounded-lg p-4 border border-dashed border-border text-center">
                      <ShieldOff className="h-8 w-8 text-foreground-subtle mx-auto mb-2" />
                      <p className="text-foreground-muted text-sm">Sin información de garantía</p>
                    </div>
                  )}
                </div>

                {/* Seguro adicional (si existe) */}
                {product.hasAdditionalInsurance && product.additionalInsuranceEndDate && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <ShieldPlus className="h-4 w-4 text-info" />
                      Seguro adicional
                    </h4>
                    <div className="bg-info/5 rounded-lg p-4 border border-info/20">
                      {product.additionalInsuranceProvider && (
                        <p className="text-sm font-medium text-foreground mb-1">
                          {product.additionalInsuranceProvider}
                        </p>
                      )}
                      <p className="text-sm text-foreground-muted">
                        <span className="font-medium text-info">Válido hasta:</span>{" "}
                        {formatDate(product.additionalInsuranceEndDate)}
                      </p>
                      {product.additionalInsuranceNotes && (
                        <p className="text-sm text-foreground-subtle mt-2">
                          {product.additionalInsuranceNotes}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-border bg-surface-2/50">
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => setShowInvoiceModal(false)}
                >
                  Cerrar
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
