"use client";

import { useState, useRef } from "react";
import { Upload, Camera, X, Check, Sparkles, Loader2, Image as ImageIcon, Receipt, AlertCircle, FileText, Package, ShieldPlus, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Modal } from "@/components/ui/modal";
import { Button, Input, Select } from "@/components/ui";
import { useWalletStore } from "@/store";
import { mockCategories } from "@/lib/mock-data";
import { Product, ProductCondition } from "@/types";
// PDF se procesa en el backend

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const conditionOptions = [
  { value: "NEW", label: "Nuevo - Sin usar, con embalaje original" },
  { value: "LIKE_NEW", label: "Como nuevo - Usado pocas veces, sin marcas" },
  { value: "VERY_GOOD", label: "Muy bueno - Pequeñas marcas de uso" },
  { value: "GOOD", label: "Bueno - Marcas de uso visibles" },
  { value: "ACCEPTABLE", label: "Aceptable - Funcional con defectos estéticos" },
];

type ExtractedData = {
  brand: string | null;
  model: string | null;
  variant: string | null;
  categoryId: string | null;
  categorySlug: string | null;
  purchasePrice: number | null;
  purchaseDate: string | null;
  purchaseStore: string | null;
  warrantyEndDate: string | null;
  warrantyYears: number | null;
  warrantyType: string | null;
  warrantyNotes: string | null;
  serialLast4: string | null;
  confidence: "high" | "medium" | "low";
  imageType: "product" | "invoice";
};

type EnrichedData = {
  accessories: Array<{ name: string; typical: boolean }>;
  manualUrl: string | null;
  resaleValue: {
    percentage: number;
    minPrice: number;
    maxPrice: number;
    marketTrend: string;
    notes: string;
  } | null;
  warrantyContact: {
    phone: string | null;
    email: string | null;
    url: string | null;
    hours: string | null;
    notes: string | null;
  } | null;
  specs: Array<{ label: string; value: string }>;
  stockImages: string[] | null;
};

type DetectedProduct = {
  brand: string;
  model: string;
  variant: string;
  categoryId: string | null;
  categorySlug: string;
  purchasePrice: number | null;
  lineDescription: string;
};

export function AddProductModal({ isOpen, onClose }: AddProductModalProps) {
  const { addProduct } = useWalletStore();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Photo upload modal state
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const photoFileInputRef = useRef<HTMLInputElement>(null);
  const photoCameraInputRef = useRef<HTMLInputElement>(null);

  // Extracted data from AI
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [enrichedData, setEnrichedData] = useState<EnrichedData | null>(null);
  const [isEnriching, setIsEnriching] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  
  // Multiple products state
  const [multipleProducts, setMultipleProducts] = useState<DetectedProduct[] | null>(null);
  const [commonInvoiceData, setCommonInvoiceData] = useState<{
    purchaseDate: string;
    purchaseStore: string;
    warrantyEndDate: string;
    warrantyNotes: string;
    warrantyYears: number | null;
  } | null>(null);

  // Form state (editable after extraction)
  const [formData, setFormData] = useState({
    categoryId: "",
    brand: "",
    model: "",
    variant: "",
    condition: "" as ProductCondition | "",
    purchaseDate: "",
    purchasePrice: "",
    purchaseStore: "",
    warrantyEndDate: "",
    warrantyNotes: "",
    photos: [] as string[],
    hasTicket: false,
    hasSerial: false,
    serialLast4: "",
    accessories: {} as Record<string, boolean>,
    // Seguro adicional
    hasAdditionalInsurance: false,
    additionalInsuranceEndDate: "",
    additionalInsuranceProvider: "",
    additionalInsuranceNotes: "",
  });

  const updateFormData = (key: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  // Seleccionar un producto cuando hay múltiples en la factura
  const selectProduct = (product: DetectedProduct) => {
    // Pre-rellenar el formulario con el producto seleccionado
    setFormData((prev) => ({
      ...prev,
      brand: product.brand || "",
      model: product.model || "",
      variant: product.variant || "",
      categoryId: product.categoryId || "",
      purchasePrice: product.purchasePrice?.toString() || "",
      purchaseDate: commonInvoiceData?.purchaseDate || "",
      purchaseStore: commonInvoiceData?.purchaseStore || "",
      warrantyEndDate: commonInvoiceData?.warrantyEndDate || "",
      warrantyNotes: commonInvoiceData?.warrantyNotes || "",
      hasTicket: true,
      photos: [],
    }));

    // Limpiar el estado de múltiples productos
    setMultipleProducts(null);

    // Enriquecer el producto seleccionado
    // Si no hay foto real del producto (solo factura), buscar imagen de referencia
    const needsStockImage = !uploadedImage || formData.hasTicket;
    enrichProduct(
      product.brand || "",
      product.model || "",
      product.variant || "",
      product.categoryId || "",
      product.purchasePrice || undefined,
      needsStockImage
    );

    // Avanzar al paso 2
    setStep(2);
  };

  // Enriquecer producto con IA (accesorios, manual, precio reventa, contacto garantía)
  // needsImages: buscar foto de referencia si el usuario no subió foto
  const enrichProduct = async (brand: string, model: string, variant: string, categoryId: string, purchasePrice?: number, needsImages: boolean = false) => {
    if (!brand || !model) return;
    
    setIsEnriching(true);
    try {
      const response = await fetch("/api/enrich-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brand, model, variant, categoryId, purchasePrice, needsImages }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setEnrichedData(result.data);
          
          // Pre-seleccionar accesorios típicos
          const typicalAccessories: Record<string, boolean> = {};
          result.data.accessories?.forEach((acc: { name: string; typical: boolean }) => {
            if (acc.typical) {
              typicalAccessories[acc.name.toLowerCase()] = true;
            }
          });
          updateFormData("accessories", typicalAccessories);
        }
      }
    } catch (error) {
      console.error("Error enriching product:", error);
    } finally {
      setIsEnriching(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith("image/");
    const isPdf = file.type === "application/pdf";

    // Validar que sea una imagen o PDF
    if (!isImage && !isPdf) {
      setAnalyzeError("Por favor, selecciona una imagen o PDF válido");
      return;
    }

    setAnalyzeError(null);
    setIsAnalyzing(true);

    try {
      let response;

      if (isPdf) {
        // Para PDF: extraer texto en el backend y analizarlo
        const formData = new FormData();
        formData.append("file", file);

        // Paso 1: Extraer texto del PDF
        const pdfResponse = await fetch("/api/parse-pdf", {
          method: "POST",
          body: formData,
        });

        if (!pdfResponse.ok) {
          throw new Error("Error al leer el PDF");
        }

        const pdfData = await pdfResponse.json();

        if (!pdfData.text) {
          throw new Error("No se pudo extraer texto del PDF");
        }

        // Usar imagen renderizada del PDF si está disponible, sino placeholder
        setUploadedImage(pdfData.image || "/pdf-placeholder.svg");

        // Paso 2: Analizar el texto con IA
        response = await fetch("/api/extract-product-info", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pdfText: pdfData.text }),
        });
      } else {
        // Para imagen: enviar directamente
        const imageDataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (event) => resolve(event.target?.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        const base64 = imageDataUrl.split(",")[1];

        setUploadedImage(imageDataUrl);

        response = await fetch("/api/extract-product-info", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageBase64: base64 }),
        });
      }

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Error al analizar el archivo");
      }

      // Verificar si hay múltiples productos
      if (result.multipleProducts && result.products && result.products.length > 1) {
        setMultipleProducts(result.products);
        setCommonInvoiceData({
          purchaseDate: result.purchaseDate || "",
          purchaseStore: result.purchaseStore || "",
          warrantyEndDate: result.warrantyEndDate || "",
          warrantyNotes: result.warrantyNotes || "",
          warrantyYears: result.warrantyYears || null,
        });
        // Ir al paso de selección de producto
        setStep(1.5 as unknown as number);
      } else if (result.data) {
        setExtractedData(result.data);

        // Pre-rellenar el formulario con los datos extraídos
        setFormData((prev) => ({
          ...prev,
          brand: result.data.brand || "",
          model: result.data.model || "",
          variant: result.data.variant || "",
          categoryId: result.data.categoryId || "",
          purchasePrice: result.data.purchasePrice?.toString() || "",
          purchaseDate: result.data.purchaseDate || "",
          purchaseStore: result.data.purchaseStore || "",
          warrantyEndDate: result.data.warrantyEndDate || "",
          warrantyNotes: result.data.warrantyNotes || "",
          serialLast4: result.data.serialLast4 || "",
          hasTicket: result.data.imageType === "invoice" || isPdf,
          photos: [],
        }));

        // Enriquecer producto con información adicional
        // Si es factura/PDF, buscar imagen de referencia del producto
        const isInvoiceOrPdf = result.data.imageType === "invoice" || isPdf;
        enrichProduct(
          result.data.brand || "",
          result.data.model || "",
          result.data.variant || "",
          result.data.categoryId || "",
          result.data.purchasePrice || undefined,
          isInvoiceOrPdf // needsImages
        );

        // Avanzar al paso 2
        setStep(2);
      } else {
        throw new Error("Respuesta inesperada del servidor");
      }
    } catch (error) {
      console.error("Error:", error);
      setAnalyzeError("Error al procesar el archivo. Inténtalo de nuevo.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    
    // Reset input value
    e.target.value = "";
    setShowPhotoModal(false);
  };

  const removePhoto = (index: number) => {
    updateFormData(
      "photos",
      formData.photos.filter((_, i) => i !== index)
    );
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      // Preparar datos del producto para guardar en BD
      const productData = {
        categoryId: formData.categoryId,
        brand: formData.brand,
        model: formData.model,
        variant: formData.variant || undefined,
        condition: formData.condition as ProductCondition,
        purchaseDate: formData.purchaseDate ? new Date(formData.purchaseDate) : undefined,
        purchasePrice: formData.purchasePrice ? parseFloat(formData.purchasePrice) : undefined,
        purchaseStore: formData.purchaseStore || undefined,
        warrantyEndDate: formData.warrantyEndDate ? new Date(formData.warrantyEndDate) : undefined,
        warrantyNotes: formData.warrantyNotes || undefined,
        warrantyContact: enrichedData?.warrantyContact || undefined,
        proofOfPurchaseUrl: formData.hasTicket ? uploadedImage || undefined : undefined,
        photos: formData.photos.filter(p => p.startsWith("http")), // Solo URLs, no base64
        stockPhotos: formData.photos.length === 0 ? enrichedData?.stockImages || undefined : undefined,
        accessories: formData.accessories,
        hasAdditionalInsurance: formData.hasAdditionalInsurance || undefined,
        additionalInsuranceEndDate: formData.additionalInsuranceEndDate 
          ? new Date(formData.additionalInsuranceEndDate) 
          : undefined,
        additionalInsuranceProvider: formData.additionalInsuranceProvider || undefined,
        additionalInsuranceNotes: formData.additionalInsuranceNotes || undefined,
        estimatedValue: enrichedData?.resaleValue?.maxPrice || 
          (formData.purchasePrice ? parseFloat(formData.purchasePrice) * 0.8 : undefined),
        resaleValue: enrichedData?.resaleValue || undefined,
        manualUrl: enrichedData?.manualUrl || undefined,
        specs: enrichedData?.specs || undefined,
        serialLast4: formData.serialLast4 || undefined,
      };

      // Guardar en BD a través de la API
      const savedProduct = await addProduct(productData);
      
      if (savedProduct) {
        resetAndClose();
      } else {
        setAnalyzeError("Error al guardar el producto. Inténtalo de nuevo.");
      }
    } catch (error) {
      console.error("Error saving product:", error);
      setAnalyzeError("Error al guardar el producto. Inténtalo de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetAndClose = () => {
    setFormData({
      categoryId: "",
      brand: "",
      model: "",
      variant: "",
      condition: "",
      purchaseDate: "",
      purchasePrice: "",
      purchaseStore: "",
      warrantyEndDate: "",
      warrantyNotes: "",
      photos: [],
      hasTicket: false,
      hasSerial: false,
      serialLast4: "",
      accessories: {},
      hasAdditionalInsurance: false,
      additionalInsuranceEndDate: "",
      additionalInsuranceProvider: "",
      additionalInsuranceNotes: "",
    });
    setExtractedData(null);
    setEnrichedData(null);
    setUploadedImage(null);
    setMultipleProducts(null);
    setCommonInvoiceData(null);
    setAnalyzeError(null);
    setStep(1);
    onClose();
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return false; // Se avanza automáticamente al subir foto
      case 2:
        return formData.brand && formData.model && formData.categoryId;
      case 3:
        // No permitir guardar mientras se está enriqueciendo
        return formData.condition && !isEnriching;
      default:
        return true;
    }
  };

  const getCategoryIcon = (categoryId: string) => {
    const cat = mockCategories.find((c) => c.id === categoryId);
    return cat?.icon || "📦";
  };

  // Footer para el modal
  const modalFooter = step > 1 ? (
    <div className="flex items-center justify-between">
      <Button
        variant="ghost"
        onClick={() => (step > 1 ? setStep(step - 1) : resetAndClose())}
      >
        {step > 1 ? "Atrás" : "Cancelar"}
      </Button>
      <div className="flex items-center gap-3">
        {/* Step indicators */}
        <div className="flex gap-1.5">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 w-6 rounded-full transition-colors ${
                s <= step ? "bg-accent" : "bg-surface-2"
              }`}
            />
          ))}
        </div>
        {step < 3 ? (
          <Button 
            onClick={() => {
              // Al pasar de paso 1 a 2, enriquecer producto (buscar foto si no hay)
              if (step === 1 && formData.brand && formData.model) {
                const noPhotos = formData.photos.length === 0;
                enrichProduct(
                  formData.brand,
                  formData.model,
                  formData.variant || "",
                  formData.categoryId,
                  formData.purchasePrice ? parseFloat(formData.purchasePrice) : undefined,
                  noPhotos // needsImages = true si no hay fotos
                );
              }
              setStep(step + 1);
            }} 
            disabled={!canProceed()}
          >
            Siguiente
          </Button>
        ) : (
          <Button onClick={handleSubmit} isLoading={isSubmitting || isEnriching} disabled={!canProceed()}>
            {isEnriching ? "Cargando info..." : "Guardar producto"}
          </Button>
        )}
      </div>
    </div>
  ) : null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={resetAndClose}
      title="Añadir producto"
      description={step === 1 ? "Sube tu factura o ticket de compra" : step === 1.5 ? "Selecciona un producto" : `Paso ${Math.floor(step)} de 3`}
      size="lg"
      footer={modalFooter}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,application/pdf"
        onChange={handleFileSelect}
        className="absolute opacity-0 w-0 h-0 pointer-events-none"
      />

      <AnimatePresence mode="wait">
        {/* STEP 1: Upload image */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {isAnalyzing ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <div className="relative">
                  <div className="h-20 w-20 rounded-2xl bg-accent/10 flex items-center justify-center">
                    <Sparkles className="h-10 w-10 text-accent animate-pulse" />
                  </div>
                  <Loader2 className="absolute -bottom-1 -right-1 h-6 w-6 text-accent animate-spin" />
                </div>
                <div className="text-center">
                  <p className="text-foreground font-medium">Analizando factura...</p>
                  <p className="text-sm text-foreground-muted mt-1">
                    Extrayendo productos, precios y datos de compra
                  </p>
                </div>
              </div>
            ) : (
              <>
                <p className="text-foreground-muted text-sm text-center mb-6">
                  Sube tu factura o ticket y nuestra IA extraerá todos los datos automáticamente
                </p>

                <div className="grid grid-cols-2 gap-4">
                  {/* Hacer foto a la factura */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="group p-6 rounded-2xl border-2 border-dashed border-border hover:border-accent/50 hover:bg-accent/5 transition-all flex flex-col items-center justify-center gap-3 aspect-square"
                  >
                    <div className="h-14 w-14 rounded-xl bg-surface-2 group-hover:bg-accent/10 flex items-center justify-center transition-colors">
                      <Camera className="h-7 w-7 text-foreground-muted group-hover:text-accent transition-colors" />
                    </div>
                    <div className="text-center">
                      <p className="font-medium text-foreground">Hacer foto</p>
                      <p className="text-xs text-foreground-subtle mt-1">
                        Fotografía tu factura o ticket
                      </p>
                    </div>
                  </button>

                  {/* Adjuntar factura */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="group p-6 rounded-2xl border-2 border-dashed border-border hover:border-jade/50 hover:bg-jade/5 transition-all flex flex-col items-center justify-center gap-3 aspect-square"
                  >
                    <div className="h-14 w-14 rounded-xl bg-surface-2 group-hover:bg-jade/10 flex items-center justify-center transition-colors">
                      <FileText className="h-7 w-7 text-foreground-muted group-hover:text-jade transition-colors" />
                    </div>
                    <div className="text-center">
                      <p className="font-medium text-foreground">Adjuntar archivo</p>
                      <p className="text-xs text-foreground-subtle mt-1">
                        PDF o imagen de factura
                      </p>
                    </div>
                  </button>
                </div>

                {analyzeError && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 text-destructive text-sm">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    {analyzeError}
                  </div>
                )}

                <p className="text-xs text-foreground-subtle text-center pt-2">
                  Las imágenes se procesan de forma segura y no se almacenan
                </p>
              </>
            )}
          </motion.div>
        )}

        {/* STEP 1.5: Select product from multiple */}
        {step === 1.5 && multipleProducts && (
          <motion.div
            key="step1.5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <div className="text-center mb-4">
              <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-3">
                <Package className="h-6 w-6 text-accent" />
              </div>
              <p className="text-foreground font-medium">
                Hemos detectado {multipleProducts.length} productos
              </p>
              <p className="text-sm text-foreground-muted mt-1">
                Selecciona el producto que quieres añadir
              </p>
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {multipleProducts.map((product, index) => (
                <button
                  key={index}
                  onClick={() => selectProduct(product)}
                  className="w-full p-4 rounded-xl bg-surface-2 border border-border hover:border-accent/50 hover:bg-surface-1 transition-all text-left group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-foreground group-hover:text-accent transition-colors">
                        {product.brand} {product.model}
                      </p>
                      {product.variant && (
                        <p className="text-sm text-foreground-muted">{product.variant}</p>
                      )}
                      {product.lineDescription && product.lineDescription !== `${product.brand} ${product.model}` && (
                        <p className="text-xs text-foreground-subtle mt-1">
                          {product.lineDescription}
                        </p>
                      )}
                    </div>
                    {product.purchasePrice && (
                      <p className="text-lg font-semibold text-foreground tabular-nums">
                        {product.purchasePrice.toLocaleString("es-ES")} €
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {commonInvoiceData?.purchaseStore && (
              <p className="text-xs text-foreground-subtle text-center pt-2">
                Factura de {commonInvoiceData.purchaseStore}
                {commonInvoiceData.purchaseDate && ` • ${commonInvoiceData.purchaseDate}`}
              </p>
            )}
          </motion.div>
        )}

        {/* STEP 2: Confirm/Edit extracted data */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            {/* Extracted data indicator */}
            {extractedData && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-jade/10 text-jade text-sm mb-4">
                <Sparkles className="h-4 w-4" />
                <span>
                  Datos extraídos automáticamente
                  {extractedData.confidence === "high" && " con alta confianza"}
                  {extractedData.confidence === "medium" && " - revisa los campos"}
                </span>
              </div>
            )}

            {/* Preview image */}
            {uploadedImage && (
              <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-surface-2 mb-4">
                <img
                  src={uploadedImage}
                  alt="Producto"
                  className="w-full h-full object-contain"
                />
                {extractedData?.imageType === "invoice" && (
                  <div className="absolute top-2 left-2 px-2 py-1 rounded-lg bg-jade/90 text-white text-xs font-medium flex items-center gap-1">
                    <Receipt className="h-3 w-3" />
                    Factura detectada
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Marca"
                placeholder="Ej: Apple, Samsung..."
                value={formData.brand}
                onChange={(e) => updateFormData("brand", e.target.value)}
              />
              <Input
                label="Modelo"
                placeholder="Ej: iPhone 15 Pro..."
                value={formData.model}
                onChange={(e) => updateFormData("model", e.target.value)}
              />
            </div>

            <Input
              label="Variante (opcional)"
              placeholder="Ej: 256GB Titanio Natural"
              value={formData.variant}
              onChange={(e) => updateFormData("variant", e.target.value)}
            />

            {/* Category (auto-detected but editable) */}
            <div>
              <label className="block text-sm font-medium text-foreground-muted mb-2">
                Categoría
              </label>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-2 border border-border">
                {formData.categoryId ? (
                  <>
                    <span className="text-xl">{getCategoryIcon(formData.categoryId)}</span>
                    <span className="text-foreground">
                      {mockCategories.find((c) => c.id === formData.categoryId)?.name}
                    </span>
                    <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-jade/10 text-jade">
                      Auto-detectada
                    </span>
                  </>
                ) : (
                  <span className="text-foreground-subtle">Sin categoría detectada</span>
                )}
              </div>
            </div>

            {/* Purchase info if detected from invoice */}
            {(formData.purchasePrice || formData.purchaseDate || formData.purchaseStore) && (
              <div className="p-4 rounded-xl bg-surface-2 border border-border space-y-3">
                <p className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Receipt className="h-4 w-4 text-jade" />
                  Datos de compra extraídos
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {formData.purchasePrice && (
                    <div>
                      <p className="text-xs text-foreground-subtle">Precio</p>
                      <p className="text-foreground font-medium">{formData.purchasePrice} €</p>
                    </div>
                  )}
                  {formData.purchaseDate && (
                    <div>
                      <p className="text-xs text-foreground-subtle">Fecha</p>
                      <p className="text-foreground font-medium">{formData.purchaseDate}</p>
                    </div>
                  )}
                  {formData.purchaseStore && (
                    <div>
                      <p className="text-xs text-foreground-subtle">Tienda</p>
                      <p className="text-foreground font-medium">{formData.purchaseStore}</p>
                    </div>
                  )}
                  {formData.warrantyEndDate && (
                    <div className="col-span-2">
                      <p className="text-xs text-foreground-subtle">Garantía hasta</p>
                      <p className="text-foreground font-medium">{formData.warrantyEndDate}</p>
                      {formData.warrantyNotes && (
                        <p className="text-xs text-jade mt-1">{formData.warrantyNotes}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* STEP 3: Condition, photos, accessories */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            {/* Loading indicator for enrichment */}
            {isEnriching && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-accent/10 text-accent text-sm">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Cargando información adicional...</span>
              </div>
            )}

            {/* Show loaded info - solo si hay datos útiles */}
            {!isEnriching && enrichedData && enrichedData.specs && enrichedData.specs.length > 0 && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-jade/10 text-jade text-sm">
                <Check className="h-4 w-4" />
                <span>Información adicional cargada</span>
              </div>
            )}

            <Select
              label="Estado del producto"
              options={conditionOptions}
              placeholder="Selecciona el estado"
              value={formData.condition}
              onChange={(e) => updateFormData("condition", e.target.value)}
            />

            {/* Additional photos */}
            <div>
              <label className="block text-sm font-medium text-foreground-muted mb-2">
                Fotos del producto (opcional)
              </label>
              <div className="grid grid-cols-4 gap-3">
                {formData.photos.map((photo, i) => (
                  <div
                    key={i}
                    className="relative aspect-square rounded-xl bg-surface-2 overflow-hidden group"
                  >
                    <img
                      src={photo}
                      alt={`Foto ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => removePhoto(i)}
                      className="absolute top-1 right-1 p-1 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                    {i === 0 && (
                      <div className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/50 text-white text-[10px]">
                        Principal
                      </div>
                    )}
                  </div>
                ))}
                {formData.photos.length < 6 && (
                  <div className="relative aspect-square">
                    <button
                      onClick={() => setShowPhotoModal(true)}
                      className="w-full h-full rounded-xl border-2 border-dashed border-border hover:border-accent flex flex-col items-center justify-center gap-1 text-foreground-subtle hover:text-accent transition-colors"
                    >
                      <ImageIcon className="h-5 w-5" />
                      <span className="text-[10px]">Añadir foto</span>
                    </button>
                    
                    {/* Photo upload modal */}
                    <AnimatePresence>
                      {showPhotoModal && (
                        <>
                          {/* Backdrop */}
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowPhotoModal(false)}
                            className="fixed inset-0 z-40"
                          />
                          {/* Modal */}
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            className="absolute bottom-full left-0 right-0 mb-2 bg-[#1F1F24] border border-[rgba(255,255,255,0.1)] rounded-xl shadow-xl overflow-hidden z-50"
                          >
                            <div className="p-3 border-b border-[rgba(255,255,255,0.1)]">
                              <p className="text-sm font-medium text-white text-center">
                                Añadir foto
                              </p>
                            </div>
                            <div className="p-2 space-y-1">
                              <button
                                onClick={() => photoCameraInputRef.current?.click()}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[rgba(255,255,255,0.05)] transition-colors text-left"
                              >
                                <Camera className="h-5 w-5 text-accent" />
                                <span className="text-sm text-white">Hacer foto</span>
                              </button>
                              <button
                                onClick={() => photoFileInputRef.current?.click()}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[rgba(255,255,255,0.05)] transition-colors text-left"
                              >
                                <Upload className="h-5 w-5 text-jade" />
                                <span className="text-sm text-white">Seleccionar de galería</span>
                              </button>
                            </div>
                            <button
                              onClick={() => setShowPhotoModal(false)}
                              className="w-full p-2.5 text-sm text-[#A1A1AA] hover:text-white border-t border-[rgba(255,255,255,0.1)] transition-colors"
                            >
                              Cancelar
                            </button>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>
              
              {/* Hidden file inputs for photos */}
              <input
                ref={photoFileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handlePhotoUpload}
              />
              <input
                ref={photoCameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handlePhotoUpload}
              />
            </div>

            {/* Accessories - Dynamic based on product */}
            <div>
              <label className="block text-sm font-medium text-foreground-muted mb-2">
                <Package className="inline h-4 w-4 mr-1" />
                Accesorios incluidos
                {isEnriching && (
                  <span className="ml-2 text-xs text-accent">
                    <Loader2 className="inline h-3 w-3 animate-spin mr-1" />
                    Detectando accesorios...
                  </span>
                )}
              </label>
              
              {/* Accesorios sugeridos del producto */}
              <div className="flex flex-wrap gap-2 mb-3">
                {(enrichedData?.accessories && enrichedData.accessories.length > 0
                  ? enrichedData.accessories.map((acc) => acc.name)
                  : [] // No mostrar genéricos si no hay datos enriquecidos
                ).map((acc) => {
                  const key = acc.toLowerCase();
                  const isSelected = formData.accessories[key];
                  const isTypical = enrichedData?.accessories?.find(
                    (a) => a.name.toLowerCase() === key
                  )?.typical;
                  return (
                    <button
                      key={acc}
                      onClick={() =>
                        updateFormData("accessories", {
                          ...formData.accessories,
                          [key]: !isSelected,
                        })
                      }
                      className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                        isSelected
                          ? "bg-jade/15 text-jade border border-jade/30"
                          : "bg-surface-2 text-foreground-muted border border-border hover:border-border-hover"
                      }`}
                    >
                      {isSelected && <Check className="inline h-3 w-3 mr-1" />}
                      {acc}
                      {isTypical && !isSelected && (
                        <span className="ml-1 text-[10px] text-foreground-subtle">(típico)</span>
                      )}
                    </button>
                  );
                })}
                
                {/* Accesorios personalizados añadidos por el usuario */}
                {Object.entries(formData.accessories)
                  .filter(([key]) => {
                    // Mostrar solo los que NO están en la lista de enriquecimiento
                    const enrichedKeys = (enrichedData?.accessories || []).map(a => a.name.toLowerCase());
                    return !enrichedKeys.includes(key);
                  })
                  .map(([key, isSelected]) => (
                    <div
                      key={key}
                      className={`group flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                        isSelected
                          ? "bg-jade/15 text-jade border border-jade/30"
                          : "bg-surface-2 text-foreground-muted border border-border"
                      }`}
                    >
                      <button
                        onClick={() =>
                          updateFormData("accessories", {
                            ...formData.accessories,
                            [key]: !isSelected,
                          })
                        }
                      >
                        {isSelected && <Check className="inline h-3 w-3 mr-1" />}
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                      </button>
                      <button
                        onClick={() => {
                          const newAccessories = { ...formData.accessories };
                          delete newAccessories[key];
                          updateFormData("accessories", newAccessories);
                        }}
                        className="ml-1 p-0.5 rounded-full hover:bg-error/20 text-foreground-subtle hover:text-error transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
              </div>

              {/* Input para añadir accesorio personalizado */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Añadir otro accesorio..."
                  className="flex-1 px-3 py-2 bg-surface-1 border border-border rounded-xl text-foreground placeholder:text-foreground-subtle focus:outline-none focus:ring-2 focus:ring-accent/50 text-sm"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const input = e.target as HTMLInputElement;
                      const value = input.value.trim();
                      if (value) {
                        updateFormData("accessories", {
                          ...formData.accessories,
                          [value.toLowerCase()]: true,
                        });
                        input.value = "";
                      }
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    const input = document.querySelector('input[placeholder="Añadir otro accesorio..."]') as HTMLInputElement;
                    const value = input?.value?.trim();
                    if (value) {
                      updateFormData("accessories", {
                        ...formData.accessories,
                        [value.toLowerCase()]: true,
                      });
                      input.value = "";
                    }
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-foreground-subtle mt-1.5">
                Pulsa en un accesorio para marcarlo como incluido. Puedes añadir más con el campo de arriba.
              </p>
            </div>

            {/* Manual purchase data if not extracted */}
            {!formData.purchasePrice && !formData.purchaseDate && (
              <div className="p-4 rounded-xl bg-surface-2 border border-border space-y-3">
                <p className="text-sm font-medium text-foreground">
                  Datos de compra (opcional)
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Precio de compra (€)"
                    type="number"
                    placeholder="0"
                    value={formData.purchasePrice}
                    onChange={(e) => updateFormData("purchasePrice", e.target.value)}
                  />
                  <Input
                    label="Fecha de compra"
                    type="date"
                    value={formData.purchaseDate}
                    onChange={(e) => updateFormData("purchaseDate", e.target.value)}
                  />
                </div>
                <Input
                  label="Tienda"
                  placeholder="Ej: Apple Store, Amazon..."
                  value={formData.purchaseStore}
                  onChange={(e) => updateFormData("purchaseStore", e.target.value)}
                />
              </div>
            )}

            {/* Seguro adicional */}
            <div className="p-4 rounded-xl bg-surface-2 border border-border space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldPlus className="h-4 w-4 text-info" />
                  <p className="text-sm font-medium text-foreground">
                    ¿Tienes un seguro adicional?
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => updateFormData("hasAdditionalInsurance", !formData.hasAdditionalInsurance)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    formData.hasAdditionalInsurance ? "bg-info" : "bg-gray-300 dark:bg-gray-600"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform ${
                      formData.hasAdditionalInsurance ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
              <p className="text-xs text-foreground-subtle">
                Seguro de rotura de pantalla, AppleCare+, extensión de garantía, etc.
              </p>

              {formData.hasAdditionalInsurance && (
                <div className="space-y-3 pt-2 border-t border-border">
                  <Input
                    label="Fecha de vencimiento del seguro"
                    type="date"
                    value={formData.additionalInsuranceEndDate}
                    onChange={(e) => updateFormData("additionalInsuranceEndDate", e.target.value)}
                  />
                  <Input
                    label="Proveedor del seguro (opcional)"
                    placeholder="Ej: AppleCare+, MediaMarkt Protect..."
                    value={formData.additionalInsuranceProvider}
                    onChange={(e) => updateFormData("additionalInsuranceProvider", e.target.value)}
                  />
                  <Input
                    label="Notas (opcional)"
                    placeholder="Ej: Cubre rotura de pantalla..."
                    value={formData.additionalInsuranceNotes}
                    onChange={(e) => updateFormData("additionalInsuranceNotes", e.target.value)}
                  />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Modal>
  );
}
