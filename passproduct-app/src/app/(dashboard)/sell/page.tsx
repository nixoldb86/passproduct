"use client";

import { useEffect, useState, Suspense, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Camera,
  X,
  Zap,
  Scale,
  Crown,
  Eye,
  Shield,
  Tag,
  Package,
  Loader2,
  AlertTriangle,
  Upload,
  ImageIcon,
  Fingerprint,
  Mail,
  Phone,
  TrendingUp,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button, Card, Input, Select, Badge } from "@/components/ui";
import { useWalletStore, useMarketplaceStore } from "@/store";
import { getProductById, mockCategories, getPriceRecommendations } from "@/lib/mock-data";
import { formatPrice } from "@/lib/utils";
import { Product, ProductCondition, CONDITION_LABELS } from "@/types";
import { useMarketPrices, formatMarketPrice, getMarketTrendLabel } from "@/hooks";

function SellPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, isLoaded: isUserLoaded } = useUser();
  const { products } = useWalletStore();
  const { createListing } = useMarketplaceStore();

  const productId = searchParams.get("productId");
  const [step, setStep] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);
  
  // Refs for file inputs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  
  // Verification state
  const [isCheckingVerification, setIsCheckingVerification] = useState(true);
  const [isIdentityVerified, setIsIdentityVerified] = useState(false);
  
  // Existing listing state
  const [existingListing, setExistingListing] = useState<{ id: string; status: string } | null>(null);
  const [isCheckingListing, setIsCheckingListing] = useState(false);
  
  // Market prices hook
  const { 
    isLoading: isLoadingMarketPrices, 
    result: marketPriceResult, 
    fetchMarketPrices,
    error: marketPriceError 
  } = useMarketPrices();

  // Verificar si han pasado 24 horas desde la última actualización
  const canRefreshPrices = (product: Product | null): boolean => {
    if (!product?.marketPrices?.lastUpdated) return true;
    const lastUpdate = new Date(product.marketPrices.lastUpdated);
    const now = new Date();
    const hoursSinceUpdate = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60);
    return hoursSinceUpdate >= 24;
  };

  const getTimeUntilNextRefresh = (product: Product | null): string => {
    if (!product?.marketPrices?.lastUpdated) return "";
    const lastUpdate = new Date(product.marketPrices.lastUpdated);
    const nextRefresh = new Date(lastUpdate.getTime() + 24 * 60 * 60 * 1000);
    const now = new Date();
    const hoursLeft = Math.ceil((nextRefresh.getTime() - now.getTime()) / (1000 * 60 * 60));
    if (hoursLeft <= 0) return "";
    if (hoursLeft === 1) return "Disponible en 1 hora";
    return `Disponible en ${hoursLeft}h`;
  };

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    priceStrategy: "ideal" as "minimo" | "rapido" | "ideal",
    photos: [] as string[],
    shippingEnabled: true,
    shippingCost: "5.99",
    location: "Madrid",
    condition: "GOOD" as ProductCondition,
  });

  // Check verification status
  useEffect(() => {
    const checkVerification = async () => {
      if (!isUserLoaded || !user) {
        setIsCheckingVerification(false);
        return;
      }
      
      try {
        const response = await fetch("/api/verify/status");
        const data = await response.json();
        setIsIdentityVerified(data.isVerified || false);
      } catch (error) {
        console.error("Error checking verification:", error);
        setIsIdentityVerified(false);
      } finally {
        setIsCheckingVerification(false);
      }
    };
    
    checkVerification();
  }, [isUserLoaded, user]);

  // Check if product already has an active listing
  const checkExistingListing = async (prodId: string): Promise<boolean> => {
    console.log("🔍 Checking existing listing for product:", prodId);
    setIsCheckingListing(true);
    setExistingListing(null);
    try {
      const response = await fetch(`/api/db/listings?productId=${prodId}`);
      const data = await response.json();
      console.log("📦 Listings API response:", data);
      
      if (data.success && data.listings && data.listings.length > 0) {
        // Find active listing (DRAFT, PUBLISHED, or RESERVED)
        const activeListing = data.listings.find((l: { status: string }) => 
          ["DRAFT", "PUBLISHED", "RESERVED"].includes(l.status)
        );
        console.log("🏷️ Active listing found:", activeListing);
        
        if (activeListing) {
          setExistingListing({ id: activeListing.id, status: activeListing.status });
          return true;
        }
      }
      console.log("✅ No active listing found, can proceed");
      setExistingListing(null);
      return false;
    } catch (error) {
      console.error("❌ Error checking existing listing:", error);
      setExistingListing(null);
      return false;
    } finally {
      setIsCheckingListing(false);
    }
  };

  useEffect(() => {
    if (productId) {
      // Buscar primero en el store (productos del usuario), luego en mock-data
      const product = products.find(p => p.id === productId) || getProductById(productId);
      if (product) {
        setSelectedProduct(product);
        // Check if product already has a listing
        checkExistingListing(productId);
        // SOLO usar fotos reales (stockPhotos NO son válidas para venta)
        const realPhotos = product.photos?.length > 0 ? product.photos : [];
        setFormData((prev) => ({
          ...prev,
          title: `${product.brand} ${product.model}${product.variant ? ` - ${product.variant}` : ""}`,
          description: generateDescription(product),
          photos: realPhotos, // Solo fotos reales
          price: product.estimatedValue
            ? getPriceRecommendations(product.estimatedValue).ideal.toString()
            : "",
          condition: product.condition,
        }));
        setStep(2); // Ya sabemos qué producto es, ir directo a fotos
      }
    }
  }, [productId, products]);

  const updateFormData = (key: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageData = event.target?.result as string;
        if (imageData) {
          setFormData(prev => ({
            ...prev,
            photos: [...prev.photos, imageData].slice(0, 6) // Max 6 photos
          }));
        }
      };
      reader.readAsDataURL(file);
    });
    
    // Reset input value to allow selecting same file again
    e.target.value = "";
    setShowPhotoOptions(false);
  };

  const removePhoto = (index: number) => {
    updateFormData(
      "photos",
      formData.photos.filter((_, i) => i !== index)
    );
  };

  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!selectedProduct) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Final check before submitting - verify product isn't already listed
      const hasExisting = await checkExistingListing(selectedProduct.id);
      if (hasExisting) {
        setSubmitError("Este producto ya tiene un anuncio activo");
        setIsSubmitting(false);
        return;
      }
      
      await createListing({
        productId: selectedProduct.id,
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        location: formData.location,
        shippingEnabled: formData.shippingEnabled,
        shippingCost: formData.shippingEnabled
          ? parseFloat(formData.shippingCost)
          : undefined,
        photos: formData.photos,
      });
      
      router.push("/marketplace");
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Error al publicar");
      setIsSubmitting(false);
    }
  };

  const priceRecommendations = selectedProduct?.estimatedValue
    ? getPriceRecommendations(selectedProduct.estimatedValue)
    : null;

  // Show loading while checking verification or existing listing
  if (isCheckingVerification || isCheckingListing) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  // Show verification required if not verified
  if (!isIdentityVerified) {
    return (
      <div className="max-w-md mx-auto text-center py-12">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-20 h-20 mx-auto bg-amber-500/20 rounded-full flex items-center justify-center mb-4"
        >
          <AlertTriangle className="h-10 w-10 text-amber-500" />
        </motion.div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Verificación requerida
        </h1>
        <p className="text-foreground-muted mb-6">
          Para vender en PassProduct necesitas verificar tu identidad primero.
          Es un proceso rápido y seguro.
        </p>
        <div className="space-y-3">
          <Button
            size="lg"
            className="w-full"
            onClick={() => router.push(`/verify?returnTo=/sell${productId ? `?productId=${productId}` : ""}`)}
            leftIcon={<Shield className="h-4 w-4" />}
          >
            Verificar mi identidad
          </Button>
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => router.back()}
          >
            Volver
          </Button>
        </div>
        <div className="mt-8 p-4 bg-surface-1 rounded-xl text-left">
          <h3 className="font-medium text-foreground mb-2">
            ¿Por qué necesito verificarme?
          </h3>
          <ul className="text-sm text-foreground-muted space-y-2">
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 text-jade mt-0.5 flex-shrink-0" />
              <span>Protege a compradores y vendedores de fraudes</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 text-jade mt-0.5 flex-shrink-0" />
              <span>Aumenta la confianza en tus anuncios</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 text-jade mt-0.5 flex-shrink-0" />
              <span>Solo necesitas hacerlo una vez</span>
            </li>
          </ul>
        </div>
      </div>
    );
  }

  // Show message if product already has an active listing
  if (existingListing && selectedProduct) {
    const statusLabels: Record<string, string> = {
      DRAFT: "en borrador",
      PUBLISHED: "publicado",
      RESERVED: "reservado",
    };
    
    return (
      <div className="max-w-md mx-auto text-center py-12">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-20 h-20 mx-auto bg-blue-500/20 rounded-full flex items-center justify-center mb-4"
        >
          <Tag className="h-10 w-10 text-blue-500" />
        </motion.div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Producto ya en venta
        </h1>
        <p className="text-foreground-muted mb-6">
          Este producto ya tiene un anuncio {statusLabels[existingListing.status] || "activo"}.
          No puedes crear otro anuncio para el mismo producto.
        </p>
        <div className="space-y-3">
          <Button
            size="lg"
            className="w-full"
            onClick={() => router.push(`/marketplace/${existingListing.id}`)}
            leftIcon={<Eye className="h-4 w-4" />}
          >
            Ver anuncio actual
          </Button>
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => router.push(`/wallet/${selectedProduct.id}`)}
          >
            Volver a mi wallet
          </Button>
        </div>
        <p className="text-xs text-foreground-subtle mt-6">
          Si quieres modificar el precio o los detalles, puedes editar el anuncio existente.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Back button */}
      <Link
        href={productId ? `/wallet/${productId}` : "/wallet"}
        className="inline-flex items-center gap-2 text-foreground-muted hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Volver</span>
      </Link>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground">
          Vender en PassProduct
        </h1>
        <p className="text-foreground-muted mt-1">Paso {step} de 4</p>
      </div>

      {/* Step indicators */}
      <div className="flex gap-2 mb-8">
        {[1, 2, 3, 4].map((s) => (
          <div
            key={s}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              s <= step ? "bg-accent" : "bg-surface-2"
            }`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Select Product */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card padding="md">
              <h2 className="font-medium text-foreground mb-4">
                Selecciona el producto a vender
              </h2>
              <div className="space-y-3">
                {products.map((product) => (
                  <button
                    key={product.id}
                    onClick={async () => {
                      setSelectedProduct(product);
                      // Check if product already has a listing
                      await checkExistingListing(product.id);
                      setFormData((prev) => ({
                        ...prev,
                        title: `${product.brand} ${product.model}${product.variant ? ` - ${product.variant}` : ""}`,
                        description: generateDescription(product),
                        photos: product.photos,
                        price: product.estimatedValue
                          ? getPriceRecommendations(product.estimatedValue).ideal.toString()
                          : "",
                        condition: product.condition,
                      }));
                      setStep(2);
                    }}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-colors ${
                      selectedProduct?.id === product.id
                        ? "border-accent bg-accent/5"
                        : "border-border hover:border-border-hover"
                    }`}
                  >
                    <div className="relative h-16 w-16 rounded-lg bg-surface-2 overflow-hidden flex-shrink-0">
                      {product.photos[0] ? (
                        <Image
                          src={product.photos[0]}
                          alt=""
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-2xl">
                          {product.category?.icon || "📦"}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium text-foreground">
                        {product.brand} {product.model}
                      </p>
                      <p className="text-sm text-foreground-muted">
                        {product.variant}
                      </p>
                      <p className="text-sm text-foreground-subtle">
                        Valor estimado: {formatPrice(product.estimatedValue || 0)}
                      </p>
                    </div>
                    {selectedProduct?.id === product.id && (
                      <Check className="h-5 w-5 text-accent" />
                    )}
                  </button>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Step 2: Photos, Condition & Details */}
        {step === 2 && selectedProduct && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* Photos */}
            <Card padding="md">
              <h2 className="font-medium text-foreground mb-4">
                Fotos del producto
              </h2>
              <div className="grid grid-cols-3 gap-3">
                {formData.photos.map((photo, i) => (
                  <div
                    key={i}
                    className="relative aspect-square rounded-xl bg-surface-2 overflow-hidden group"
                  >
                    <Image src={photo} alt="" fill className="object-cover" />
                    <button
                      onClick={() => removePhoto(i)}
                      className="absolute top-2 right-2 p-1 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                {formData.photos.length < 6 && (
                  <div className="relative aspect-square">
                    <button
                      onClick={() => setShowPhotoOptions(!showPhotoOptions)}
                      className="w-full h-full rounded-xl border-2 border-dashed border-border hover:border-accent flex flex-col items-center justify-center gap-2 text-foreground-subtle hover:text-accent transition-colors"
                    >
                      <ImageIcon className="h-6 w-6" />
                      <span className="text-xs">Añadir foto</span>
                    </button>
                    
                    {/* Photo options dropdown */}
                    <AnimatePresence>
                      {showPhotoOptions && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute top-full left-0 right-0 mt-2 bg-surface-1 border border-border rounded-xl shadow-lg overflow-hidden z-10"
                        >
                          <button
                            onClick={() => cameraInputRef.current?.click()}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-2 transition-colors text-left"
                          >
                            <Camera className="h-5 w-5 text-accent" />
                            <span className="text-sm text-foreground">Hacer foto</span>
                          </button>
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-2 transition-colors text-left border-t border-border"
                          >
                            <Upload className="h-5 w-5 text-accent" />
                            <span className="text-sm text-foreground">Seleccionar de galería</span>
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>
              <p className="text-xs text-foreground-subtle mt-3">
                Mínimo 2 fotos. Añade fotos claras del producto y accesorios.
              </p>
              
              {/* Hidden file inputs */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileChange}
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleFileChange}
              />
            </Card>

            {/* Product Details - Editable */}
            <Card padding="md">
              <h2 className="font-medium text-foreground mb-4">
                Detalles del anuncio
              </h2>
              <div className="space-y-4">
                <Input
                  label="Título del anuncio"
                  value={formData.title}
                  onChange={(e) => updateFormData("title", e.target.value)}
                  placeholder="Ej: iPhone 15 Pro Max 256GB - Como nuevo"
                />
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Descripción
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => updateFormData("description", e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 bg-surface-1 border border-border rounded-xl text-foreground placeholder:text-foreground-subtle focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent resize-none"
                    placeholder="Describe tu producto, estado real, accesorios incluidos..."
                  />
                </div>
              </div>
            </Card>

            {/* Condition - Editable */}
            <Card padding="md">
              <h2 className="font-medium text-foreground mb-4">
                Estado del producto
              </h2>
              <Select
                value={formData.condition}
                onChange={(e) => updateFormData("condition", e.target.value as ProductCondition)}
                options={[
                  { value: "NEW", label: CONDITION_LABELS.NEW },
                  { value: "LIKE_NEW", label: CONDITION_LABELS.LIKE_NEW },
                  { value: "VERY_GOOD", label: CONDITION_LABELS.VERY_GOOD },
                  { value: "GOOD", label: CONDITION_LABELS.GOOD },
                  { value: "ACCEPTABLE", label: CONDITION_LABELS.ACCEPTABLE },
                ]}
              />
              <p className="text-xs text-foreground-subtle mt-3">
                El estado inicial se hereda de tu wallet. Puedes modificarlo si ha cambiado.
              </p>
            </Card>

            {/* Verification badges preview */}
            <Card padding="md">
              <h2 className="font-medium text-foreground mb-4">
                Verificaciones incluidas
              </h2>
              {(() => {
                // Calcular estados de verificación
                const hasTicket = !!selectedProduct.proofOfPurchaseUrl;
                const hasWarranty = selectedProduct.warrantyEndDate && new Date(selectedProduct.warrantyEndDate) > new Date();
                const hasIdentity = isIdentityVerified;
                const hasEmail = user?.primaryEmailAddress?.verification?.status === "verified";
                const hasPhone = user?.primaryPhoneNumber?.verification?.status === "verified";
                
                return (
                  <div className="space-y-3">
                    {/* Ticket verificado */}
                    <div className="flex items-center gap-3">
                      <div className={`h-6 w-6 rounded-full flex items-center justify-center ${
                        hasTicket ? "bg-jade/15 text-jade" : "bg-surface-2 text-foreground-subtle"
                      }`}>
                        {hasTicket ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                      </div>
                      <span className={`text-sm ${hasTicket ? "text-foreground" : "text-foreground-muted"}`}>
                        Ticket verificado
                      </span>
                      <span className={`text-xs ml-auto ${hasTicket ? "text-jade" : "text-foreground-subtle"}`}>
                        {hasTicket ? "Prueba de compra subida" : "No verificado"}
                      </span>
                    </div>
                    
                    {/* Garantía activa */}
                    <div className="flex items-center gap-3">
                      <div className={`h-6 w-6 rounded-full flex items-center justify-center ${
                        hasWarranty ? "bg-jade/15 text-jade" : "bg-surface-2 text-foreground-subtle"
                      }`}>
                        <Shield className="h-3 w-3" />
                      </div>
                      <span className={`text-sm ${hasWarranty ? "text-foreground" : "text-foreground-muted"}`}>
                        Garantía activa
                      </span>
                      <span className={`text-xs ml-auto ${hasWarranty ? "text-foreground-subtle" : "text-foreground-subtle"}`}>
                        {hasWarranty 
                          ? `Hasta ${new Date(selectedProduct.warrantyEndDate!).toLocaleDateString("es-ES")}`
                          : "Sin garantía o expirada"
                        }
                      </span>
                    </div>
                    
                    {/* Identidad verificada */}
                    <div className="flex items-center gap-3">
                      <div className={`h-6 w-6 rounded-full flex items-center justify-center ${
                        hasIdentity ? "bg-jade/15 text-jade" : "bg-surface-2 text-foreground-subtle"
                      }`}>
                        <Fingerprint className="h-3 w-3" />
                      </div>
                      <span className={`text-sm ${hasIdentity ? "text-foreground" : "text-foreground-muted"}`}>
                        Identidad verificada
                      </span>
                      {hasIdentity ? (
                        <Badge variant="verified" size="sm" className="ml-auto">
                          DNI/Pasaporte verificado
                        </Badge>
                      ) : (
                        <span className="text-xs text-foreground-subtle ml-auto">No verificado</span>
                      )}
                    </div>
                    
                    {/* Email verificado */}
                    <div className="flex items-center gap-3">
                      <div className={`h-6 w-6 rounded-full flex items-center justify-center ${
                        hasEmail ? "bg-jade/15 text-jade" : "bg-surface-2 text-foreground-subtle"
                      }`}>
                        <Mail className="h-3 w-3" />
                      </div>
                      <span className={`text-sm ${hasEmail ? "text-foreground" : "text-foreground-muted"}`}>
                        Email verificado
                      </span>
                      {hasEmail ? (
                        <Badge variant="verified" size="sm" className="ml-auto">
                          Dirección de email confirmada
                        </Badge>
                      ) : (
                        <span className="text-xs text-foreground-subtle ml-auto">No verificado</span>
                      )}
                    </div>
                    
                    {/* Teléfono verificado */}
                    <div className="flex items-center gap-3">
                      <div className={`h-6 w-6 rounded-full flex items-center justify-center ${
                        hasPhone ? "bg-jade/15 text-jade" : "bg-surface-2 text-foreground-subtle"
                      }`}>
                        <Phone className="h-3 w-3" />
                      </div>
                      <span className={`text-sm ${hasPhone ? "text-foreground" : "text-foreground-muted"}`}>
                        Teléfono verificado
                      </span>
                      {hasPhone ? (
                        <Badge variant="verified" size="sm" className="ml-auto">
                          Número verificado
                        </Badge>
                      ) : (
                        <span className="text-xs text-foreground-subtle ml-auto">No verificado</span>
                      )}
                    </div>
                  </div>
                );
              })()}
              
              {/* Mensaje contextual según verificaciones */}
              {isIdentityVerified ? (
                <p className="text-xs text-foreground-subtle mt-4 p-3 bg-jade/5 rounded-lg border border-jade/20">
                  ✅ Tu identidad está verificada, por lo que tus anuncios mostrarán las insignias de confianza.
                </p>
              ) : (
                <Link href="/verify" className="block mt-4">
                  <p className="text-xs text-amber-400 p-3 bg-amber-500/10 rounded-lg border border-amber-500/20 hover:bg-amber-500/15 transition-colors">
                    ⚠️ Verifica tu identidad para mostrar insignias de confianza y vender más rápido.
                  </p>
                </Link>
              )}
            </Card>
          </motion.div>
        )}

        {/* Step 3: Price */}
        {step === 3 && selectedProduct && priceRecommendations && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* Market Analysis - Precios del producto */}
            <Card padding="md" className="bg-gradient-to-br from-accent/5 to-purple-500/5 border-accent/30">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-medium text-foreground flex items-center gap-2">
                    <Eye className="h-4 w-4 text-accent" />
                    Análisis de mercado real
                  </h2>
                  <p className="text-xs text-foreground-muted mt-1">
                    Escaneamos anuncios reales. Nada de inventos.
                  </p>
                </div>
                {/* Botón amarillo para actualizar (limitado a cada 24h) */}
                <button
                  onClick={() => fetchMarketPrices({
                    brand: selectedProduct.brand,
                    model: selectedProduct.model,
                    variant: selectedProduct.variant,
                    purchasePrice: selectedProduct.purchasePrice,
                    condition: selectedProduct.condition,
                  })}
                  disabled={isLoadingMarketPrices || !canRefreshPrices(selectedProduct)}
                  className="px-3 py-1.5 text-sm font-medium rounded-lg bg-amber-400 hover:bg-amber-500 text-amber-950 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  title={canRefreshPrices(selectedProduct) ? "Actualizar valoración" : getTimeUntilNextRefresh(selectedProduct)}
                >
                  {isLoadingMarketPrices ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Actualizando...
                    </>
                  ) : !canRefreshPrices(selectedProduct) ? (
                    getTimeUntilNextRefresh(selectedProduct)
                  ) : (
                    "Actualizar"
                  )}
                </button>
              </div>
              
              {/* Mostrar precios guardados del producto o fallback */}
              {(() => {
                // Usar precios del producto, o marketPriceResult si acaba de actualizar, o fallback
                const prices = marketPriceResult?.success 
                  ? marketPriceResult.marketAnalysis.recommendedPrices
                  : selectedProduct.marketPrices 
                    ? selectedProduct.marketPrices
                    : selectedProduct.estimatedValue 
                      ? getPriceRecommendations(selectedProduct.estimatedValue)
                      : null;
                
                const lastUpdated = marketPriceResult?.success
                  ? new Date()
                  : selectedProduct.marketPrices?.lastUpdated
                    ? new Date(selectedProduct.marketPrices.lastUpdated)
                    : null;
                
                if (!prices) {
                  return (
                    <div className="text-center py-4 text-foreground-muted">
                      <p className="text-sm">No hay datos de mercado disponibles.</p>
                      <p className="text-xs mt-1">Haz clic en &quot;Actualizar&quot; para analizar.</p>
                    </div>
                  );
                }
                
                return (
                  <>
                    {/* Los 3 precios - Orden: Mínimo, Ideal, Rápido */}
                    <div className="grid grid-cols-3 gap-3 mb-3">
                      {/* MÍNIMO */}
                      <button
                        onClick={() => {
                          updateFormData("priceStrategy", "minimo");
                          updateFormData("price", prices.minimo.toString());
                        }}
                        className={`p-3 rounded-xl border transition-colors ${
                          formData.priceStrategy === "minimo"
                            ? "border-amber-500 bg-amber-500/10"
                            : "border-border hover:border-amber-500/50"
                        }`}
                      >
                        <Zap className={`h-4 w-4 mx-auto mb-1 ${formData.priceStrategy === "minimo" ? "text-amber-500" : "text-foreground-subtle"}`} />
                        <p className="text-xs text-foreground-muted">Mínimo</p>
                        <p className={`font-bold ${formData.priceStrategy === "minimo" ? "text-amber-500" : "text-foreground"}`}>
                          {formatMarketPrice(prices.minimo)}
                        </p>
                        <p className="text-[10px] text-foreground-subtle mt-1">Serás el más barato</p>
                      </button>
                      
                      {/* IDEAL (en el medio) */}
                      <button
                        onClick={() => {
                          updateFormData("priceStrategy", "ideal");
                          updateFormData("price", prices.ideal.toString());
                        }}
                        className={`p-3 rounded-xl border transition-colors ${
                          formData.priceStrategy === "ideal"
                            ? "border-accent bg-accent/10"
                            : "border-border hover:border-accent/50"
                        }`}
                      >
                        <Scale className={`h-4 w-4 mx-auto mb-1 ${formData.priceStrategy === "ideal" ? "text-accent" : "text-foreground-subtle"}`} />
                        <p className="text-xs text-foreground-muted">Ideal</p>
                        <p className={`font-bold ${formData.priceStrategy === "ideal" ? "text-accent" : "text-foreground"}`}>
                          {formatMarketPrice(prices.ideal)}
                        </p>
                        <p className="text-[10px] text-foreground-subtle mt-1">Precio promedio</p>
                      </button>
                      
                      {/* RÁPIDO */}
                      <button
                        onClick={() => {
                          updateFormData("priceStrategy", "rapido");
                          updateFormData("price", prices.rapido.toString());
                        }}
                        className={`p-3 rounded-xl border transition-colors ${
                          formData.priceStrategy === "rapido"
                            ? "border-jade bg-jade/10"
                            : "border-border hover:border-jade/50"
                        }`}
                      >
                        <Crown className={`h-4 w-4 mx-auto mb-1 ${formData.priceStrategy === "rapido" ? "text-jade" : "text-foreground-subtle"}`} />
                        <p className="text-xs text-foreground-muted">Rápido</p>
                        <p className={`font-bold ${formData.priceStrategy === "rapido" ? "text-jade" : "text-foreground"}`}>
                          {formatMarketPrice(prices.rapido)}
                        </p>
                        <p className="text-[10px] text-foreground-subtle mt-1">Sin malvender</p>
                      </button>
                    </div>
                    
                    {/* Fecha de última actualización */}
                    {lastUpdated && (
                      <p className="text-[11px] text-foreground-subtle text-center">
                        Actualizado: {lastUpdated.toLocaleDateString("es-ES", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}, {lastUpdated.toLocaleTimeString("es-ES", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    )}
                  </>
                );
              })()}
              
              {/* Input precio personalizado */}
              <div className="mt-4 pt-4 border-t border-border">
                <Input
                  label="O introduce tu precio"
                  type="number"
                  value={formData.price}
                  onChange={(e) => updateFormData("price", e.target.value)}
                  hint="Precio en euros"
                />
              </div>
              
              {marketPriceError && (
                <p className="text-xs text-error mt-2">
                  ⚠️ {marketPriceError}
                </p>
              )}
            </Card>


            {/* Shipping */}
            <Card padding="md">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-medium text-foreground">Envío</h2>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.shippingEnabled}
                    onChange={(e) =>
                      updateFormData("shippingEnabled", e.target.checked)
                    }
                    className="h-4 w-4 rounded border-border bg-surface-1 text-accent focus:ring-accent"
                  />
                  <span className="text-sm text-foreground-muted">
                    Ofrecer envío
                  </span>
                </label>
              </div>
              {formData.shippingEnabled && (
                <Input
                  label="Coste de envío"
                  type="number"
                  value={formData.shippingCost}
                  onChange={(e) => updateFormData("shippingCost", e.target.value)}
                  hint="El comprador pagará este importe adicional"
                />
              )}
            </Card>

            {/* Location */}
            <Card padding="md">
              <Input
                label="Ubicación"
                value={formData.location}
                onChange={(e) => updateFormData("location", e.target.value)}
                hint="Ciudad o zona donde está el producto"
              />
            </Card>
          </motion.div>
        )}

        {/* Step 4: Preview */}
        {step === 4 && selectedProduct && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <Card padding="none" className="overflow-hidden">
              {/* Preview Image */}
              <div className="relative aspect-video bg-surface-2">
                {formData.photos[0] && (
                  <Image
                    src={formData.photos[0]}
                    alt=""
                    fill
                    className="object-cover"
                  />
                )}
              </div>

              <div className="p-6">
                {/* Title */}
                <h2 className="text-xl font-semibold text-foreground mb-3">
                  {formData.title}
                </h2>

                {/* Badges - Always show verified badges since user is identity verified */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="verified" size="md">
                    Compra verificada
                  </Badge>
                  <Badge variant="verified" size="md">
                    ID verificado
                  </Badge>
                  {selectedProduct.warrantyEndDate &&
                    new Date(selectedProduct.warrantyEndDate) > new Date() && (
                      <Badge variant="warranty" size="md">
                        Garantía activa
                      </Badge>
                    )}
                </div>

                {/* Condition */}
                <p className="text-sm text-foreground-muted mb-2">
                  Estado: <span className="text-foreground font-medium">{CONDITION_LABELS[formData.condition]}</span>
                </p>

                {/* Description preview */}
                <p className="text-foreground-muted text-sm mb-4 line-clamp-3">
                  {formData.description}
                </p>

                {/* Price */}
                <div className="flex items-end justify-between pt-4 border-t border-border">
                  <div>
                    <p className="text-2xl font-semibold text-foreground">
                      {formatPrice(parseFloat(formData.price) || 0)}
                    </p>
                    {formData.shippingEnabled && (
                      <p className="text-sm text-foreground-muted">
                        + {formatPrice(parseFloat(formData.shippingCost))} envío
                      </p>
                    )}
                  </div>
                  <p className="text-sm text-foreground-subtle">
                    {formData.location}
                  </p>
                </div>
              </div>
            </Card>

            {/* Fee info */}
            <Card padding="md" className="bg-surface-2/50">
              <h3 className="font-medium text-foreground mb-3">
                Resumen de comisiones
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-foreground-muted">Precio de venta</span>
                  <span className="text-foreground">
                    {formatPrice(parseFloat(formData.price) || 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground-muted">
                    Comisión PassProduct (5%)
                  </span>
                  <span className="text-error">
                    -{formatPrice((parseFloat(formData.price) || 0) * 0.05)}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-border">
                  <span className="font-medium text-foreground">Recibirás</span>
                  <span className="font-semibold text-jade">
                    {formatPrice((parseFloat(formData.price) || 0) * 0.95)}
                  </span>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
        <Button
          variant="ghost"
          onClick={() => (step > 1 ? setStep(step - 1) : router.back())}
        >
          {step > 1 ? "Atrás" : "Cancelar"}
        </Button>
        {step < 4 ? (
          <Button
            onClick={() => setStep(step + 1)}
            disabled={
              (step === 1 && !selectedProduct) ||
              (step === 2 && formData.photos.length < 2) ||
              (step === 3 && !formData.price)
            }
          >
            Siguiente
          </Button>
        ) : (
          <Button onClick={handleSubmit} isLoading={isSubmitting}>
            Publicar anuncio
          </Button>
        )}
      </div>
    </div>
  );
}

export default function SellPage() {
  return (
    <Suspense fallback={<div className="animate-pulse">Cargando...</div>}>
      <SellPageContent />
    </Suspense>
  );
}

function generateDescription(product: Product): string {
  // Obtener la etiqueta del estado, con fallback
  const conditionKey = product.condition?.toUpperCase() as ProductCondition;
  const conditionLabel = CONDITION_LABELS[conditionKey] || "Bueno";
  
  const parts = [
    `${product.brand} ${product.model}`,
    product.variant,
    `Estado: ${conditionLabel}`,
  ];

  if (product.accessories) {
    const included = Object.entries(product.accessories)
      .filter(([, v]) => v)
      .map(([k]) => k);
    if (included.length > 0) {
      parts.push(`Incluye: ${included.join(", ")}`);
    }
  }

  return parts.filter(Boolean).join("\n");
}
