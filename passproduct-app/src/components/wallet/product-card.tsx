"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  Calendar, 
  Tag, 
  MoreVertical, 
  ImageOff, 
  Pencil, 
  Trash2, 
  ShieldCheck, 
  ShieldAlert, 
  ShieldX, 
  ShieldOff, 
  ShieldPlus,
  FileText,
  FolderOpen,
  X,
  Download,
  ExternalLink,
  FileImage,
  File,
  BookOpen
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Product, CONDITION_LABELS } from "@/types";
import { Card, Badge, Button } from "@/components/ui";
import { formatPrice, formatDate } from "@/lib/utils";

type WarrantyStatus = "active" | "expiring" | "expired" | "none";

function getWarrantyStatus(warrantyEndDate: Date | string | null | undefined): {
  status: WarrantyStatus;
  daysLeft: number | null;
  label: string;
  icon: React.ReactNode;
  colorClass: string;
} {
  if (!warrantyEndDate) {
    return {
      status: "none",
      daysLeft: null,
      label: "Sin garantía",
      icon: <ShieldOff className="h-3.5 w-3.5" />,
      colorClass: "text-foreground-subtle bg-surface-2",
    };
  }

  const endDate = typeof warrantyEndDate === "string" ? new Date(warrantyEndDate) : warrantyEndDate;
  const now = new Date();
  const diffTime = endDate.getTime() - now.getTime();
  const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (daysLeft < 0) {
    return {
      status: "expired",
      daysLeft,
      label: "Garantía expirada",
      icon: <ShieldX className="h-3.5 w-3.5" />,
      colorClass: "text-error bg-error/10",
    };
  }

  if (daysLeft <= 30) {
    return {
      status: "expiring",
      daysLeft,
      label: `${daysLeft}d restantes`,
      icon: <ShieldAlert className="h-3.5 w-3.5" />,
      colorClass: "text-warning bg-warning/10",
    };
  }

  // Más de 30 días
  const months = Math.floor(daysLeft / 30);
  return {
    status: "active",
    daysLeft,
    label: months > 1 ? `${months} meses` : `${daysLeft}d`,
    icon: <ShieldCheck className="h-3.5 w-3.5" />,
    colorClass: "text-jade bg-jade/10",
  };
}

type InsuranceStatus = "active" | "expiring" | "expired" | "none";

function getInsuranceStatus(
  hasInsurance: boolean | undefined,
  endDate: Date | string | null | undefined
): {
  status: InsuranceStatus;
  daysLeft: number | null;
  label: string;
  provider?: string;
  colorClass: string;
} {
  if (!hasInsurance || !endDate) {
    return {
      status: "none",
      daysLeft: null,
      label: "",
      colorClass: "",
    };
  }

  const insuranceEndDate = typeof endDate === "string" ? new Date(endDate) : endDate;
  const now = new Date();
  const diffTime = insuranceEndDate.getTime() - now.getTime();
  const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (daysLeft < 0) {
    return {
      status: "expired",
      daysLeft,
      label: "Seguro expirado",
      colorClass: "text-error bg-error/10",
    };
  }

  if (daysLeft <= 30) {
    return {
      status: "expiring",
      daysLeft,
      label: `Seguro: ${daysLeft}d`,
      colorClass: "text-warning bg-warning/10",
    };
  }

  const months = Math.floor(daysLeft / 30);
  return {
    status: "active",
    daysLeft,
    label: `Seguro: ${months > 1 ? `${months} meses` : `${daysLeft}d`}`,
    colorClass: "text-info bg-info/10",
  };
}

interface ProductCardProps {
  product: Product;
  onEdit?: (product: Product) => void;
  onDelete?: (productId: string) => void;
}

export function ProductCard({ product, onEdit, onDelete }: ProductCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showDocumentsModal, setShowDocumentsModal] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  const warranty = getWarrantyStatus(product.warrantyEndDate);
  const insurance = getInsuranceStatus(product.hasAdditionalInsurance, product.additionalInsuranceEndDate);
  
  // Contar documentos disponibles
  const documentsCount = [
    product.proofOfPurchaseUrl,
    product.warrantyNotes,
    product.manualUrl,
  ].filter(Boolean).length;

  // Determinar imagen a mostrar: real > stock > placeholder
  const hasRealPhoto = product.photos && product.photos.length > 0 && product.photos[0];
  const hasStockPhoto = product.stockPhotos && product.stockPhotos.length > 0;
  const displayImage = hasRealPhoto ? product.photos[0] : (hasStockPhoto ? product.stockPhotos![0] : null);
  const isStockImage = !hasRealPhoto && hasStockPhoto;

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }
    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMenu]);

  const handleMenuClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowMenu(false);
    onEdit?.(product);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowMenu(false);
    if (confirm(`¿Estás seguro de eliminar "${product.brand} ${product.model}"?`)) {
      onDelete?.(product.id);
    }
  };

  const handleViewInvoice = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.proofOfPurchaseUrl) {
      window.open(product.proofOfPurchaseUrl, "_blank");
    }
  };

  const handleOpenDocuments = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDocumentsModal(true);
  };

  const handleCloseDocuments = () => {
    setShowDocumentsModal(false);
  };

  // Detectar tipo de archivo por extensión
  const getFileType = (url: string): "pdf" | "image" | "other" => {
    const ext = url.split(".").pop()?.toLowerCase();
    if (ext === "pdf") return "pdf";
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext || "")) return "image";
    return "other";
  };

  return (
    <Link href={`/wallet/${product.id}`}>
      <Card variant="interactive" padding="none" className="group overflow-hidden">
        {/* Image */}
        <div className="relative aspect-[4/3] bg-surface-2 overflow-hidden">
          {displayImage ? (
            <>
              <Image
                src={displayImage}
                alt={`${product.brand} ${product.model}`}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
              {/* Badge para imagen de referencia */}
              {isStockImage && (
                <div className="absolute bottom-2 right-2 flex items-center gap-1 px-2 py-1 rounded bg-black/60 text-white text-[10px]">
                  <ImageOff className="h-3 w-3" />
                  Referencia
                </div>
              )}
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-4xl">{product.category?.icon || "📦"}</span>
            </div>
          )}
          
          {/* Category badge */}
          {product.category && (
            <div className="absolute top-3 left-3">
              <Badge variant="info" size="sm">
                {product.category.icon} {product.category.name}
              </Badge>
            </div>
          )}

          {/* More options */}
          <div className="absolute top-3 right-3" ref={menuRef}>
            <button
              onClick={handleMenuClick}
              className="p-1.5 rounded-lg bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
            
            {/* Dropdown Menu */}
            {showMenu && (
              <div className="absolute right-0 mt-1 w-36 bg-surface-1 border border-border rounded-lg shadow-lg overflow-hidden z-50">
                <button
                  onClick={handleEdit}
                  className="w-full px-3 py-2.5 text-sm text-left flex items-center gap-2 hover:bg-surface-2 transition-colors text-foreground"
                >
                  <Pencil className="h-4 w-4" />
                  Editar
                </button>
                <button
                  onClick={handleDelete}
                  className="w-full px-3 py-2.5 text-sm text-left flex items-center gap-2 hover:bg-error/10 transition-colors text-error"
                >
                  <Trash2 className="h-4 w-4" />
                  Eliminar
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Title & Model */}
          <div className="mb-3">
            <h3 className="font-semibold text-foreground line-clamp-1">
              {product.brand} {product.model}
            </h3>
            {product.variant && (
              <p className="text-sm text-foreground-muted line-clamp-1">
                {product.variant}
              </p>
            )}
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {product.proofOfPurchaseUrl && (
              <Badge variant="verified" size="sm">
                Verificado
              </Badge>
            )}
            {product.serialLast4 || product.imeiLast4 ? (
              <Badge variant="serial" size="sm">
                ID verificado
              </Badge>
            ) : null}
          </div>

          {/* Warranty & Insurance Status */}
          <div className="space-y-2 mb-4">
            {/* Warranty */}
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${warranty.colorClass}`}>
              {warranty.icon}
              <span className="text-sm font-medium">{warranty.label}</span>
              {warranty.status === "active" && product.warrantyEndDate && (
                <span className="text-xs opacity-70 ml-auto">
                  hasta {formatDate(product.warrantyEndDate, { day: "2-digit", month: "short", year: "2-digit" })}
                </span>
              )}
            </div>

            {/* Insurance (only if has insurance) */}
            {insurance.status !== "none" && (
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${insurance.colorClass}`}>
                <ShieldPlus className="h-3.5 w-3.5" />
                <span className="text-sm font-medium">{insurance.label}</span>
                {product.additionalInsuranceProvider && (
                  <span className="text-xs opacity-70">({product.additionalInsuranceProvider})</span>
                )}
                {insurance.status === "active" && product.additionalInsuranceEndDate && (
                  <span className="text-xs opacity-70 ml-auto">
                    hasta {formatDate(product.additionalInsuranceEndDate, { day: "2-digit", month: "short", year: "2-digit" })}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Condition & Purchase info */}
          <div className="flex items-center gap-4 text-xs text-foreground-subtle mb-4">
            <span className="flex items-center gap-1">
              <Tag className="h-3 w-3" />
              {CONDITION_LABELS[product.condition?.toUpperCase() as keyof typeof CONDITION_LABELS] || "Bueno"}
            </span>
            {product.purchaseDate && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDate(product.purchaseDate, { month: "short", year: "2-digit" })}
              </span>
            )}
          </div>

          {/* Document Buttons */}
          {(product.proofOfPurchaseUrl || documentsCount > 0) && (
            <div className="flex gap-2 mb-4">
              {product.proofOfPurchaseUrl && (
                <button
                  onClick={handleViewInvoice}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-accent bg-accent/10 hover:bg-accent/20 rounded-lg transition-colors"
                >
                  <FileText className="h-3.5 w-3.5" />
                  Ver factura
                </button>
              )}
              <button
                onClick={handleOpenDocuments}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-foreground-muted bg-surface-2 hover:bg-surface-3 rounded-lg transition-colors"
              >
                <FolderOpen className="h-3.5 w-3.5" />
                Documentos {documentsCount > 0 && `(${documentsCount})`}
              </button>
            </div>
          )}

          {/* Value */}
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs text-foreground-subtle">Valor estimado</p>
              <p className="text-lg font-semibold text-foreground tabular-nums">
                {product.estimatedValue
                  ? formatPrice(product.estimatedValue)
                  : "—"}
              </p>
            </div>
            {product.purchasePrice && product.estimatedValue && (
              <div className="text-right">
                <p className="text-xs text-foreground-subtle">
                  Compra: {formatPrice(product.purchasePrice)}
                </p>
                {product.estimatedValue < product.purchasePrice ? (
                  <p className="text-xs text-error">
                    -{Math.round(((product.purchasePrice - product.estimatedValue) / product.purchasePrice) * 100)}%
                  </p>
                ) : (
                  <p className="text-xs text-jade">
                    +{Math.round(((product.estimatedValue - product.purchasePrice) / product.purchasePrice) * 100)}%
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </Card>
      
      {/* Modal de Documentos */}
      <AnimatePresence>
        {showDocumentsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
            onClick={handleCloseDocuments}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-surface-1 rounded-xl max-w-lg w-full max-h-[85vh] overflow-hidden shadow-2xl border border-border"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    Documentos
                  </h3>
                  <p className="text-sm text-foreground-muted">
                    {product.brand} {product.model}
                  </p>
                </div>
                <button
                  onClick={handleCloseDocuments}
                  className="p-2 rounded-lg hover:bg-surface-2 transition-colors text-foreground-muted"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Documents List */}
              <div className="p-4 space-y-3 overflow-y-auto max-h-[60vh]">
                {/* Factura */}
                {product.proofOfPurchaseUrl ? (
                  <div className="bg-surface-2 rounded-lg p-4 border border-border">
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 bg-accent/10 rounded-lg">
                        {getFileType(product.proofOfPurchaseUrl) === "pdf" ? (
                          <FileText className="h-6 w-6 text-accent" />
                        ) : (
                          <FileImage className="h-6 w-6 text-accent" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground">Factura de compra</p>
                        <p className="text-xs text-foreground-muted mt-0.5">
                          {product.purchaseStore && `${product.purchaseStore} • `}
                          {product.purchaseDate && formatDate(product.purchaseDate)}
                        </p>
                        {product.purchasePrice && (
                          <p className="text-sm text-foreground-subtle mt-1">
                            Importe: {formatPrice(product.purchasePrice)}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => window.open(product.proofOfPurchaseUrl, "_blank")}
                          className="p-2 rounded-lg hover:bg-surface-3 transition-colors text-foreground-muted hover:text-accent"
                          title="Abrir"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </button>
                        <a
                          href={product.proofOfPurchaseUrl}
                          download
                          onClick={(e) => e.stopPropagation()}
                          className="p-2 rounded-lg hover:bg-surface-3 transition-colors text-foreground-muted hover:text-accent"
                          title="Descargar"
                        >
                          <Download className="h-4 w-4" />
                        </a>
                      </div>
                    </div>
                    
                    {/* Preview si es imagen */}
                    {getFileType(product.proofOfPurchaseUrl) === "image" && (
                      <div className="mt-3 relative aspect-video rounded-lg overflow-hidden bg-surface-3">
                        <Image
                          src={product.proofOfPurchaseUrl}
                          alt="Factura"
                          fill
                          className="object-contain"
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-surface-2/50 rounded-lg p-4 border border-dashed border-border">
                    <div className="flex items-center gap-3 text-foreground-muted">
                      <FileText className="h-5 w-5" />
                      <div>
                        <p className="font-medium">Sin factura</p>
                        <p className="text-xs">Edita el producto para añadir una factura</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Documento de garantía */}
                {product.warrantyNotes ? (
                  <div className="bg-surface-2 rounded-lg p-4 border border-border">
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 bg-jade/10 rounded-lg">
                        <ShieldCheck className="h-6 w-6 text-jade" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground">Información de garantía</p>
                        <p className="text-sm text-foreground-muted mt-1">
                          {product.warrantyNotes}
                        </p>
                        {product.warrantyEndDate && (
                          <p className="text-xs text-foreground-subtle mt-2">
                            Válida hasta: {formatDate(product.warrantyEndDate)}
                          </p>
                        )}
                        {product.warrantyContact && (
                          <div className="mt-2 text-xs text-foreground-subtle">
                            {product.warrantyContact.phone && (
                              <p>📞 {product.warrantyContact.phone}</p>
                            )}
                            {product.warrantyContact.email && (
                              <p>✉️ {product.warrantyContact.email}</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : product.warrantyEndDate ? (
                  <div className="bg-surface-2 rounded-lg p-4 border border-border">
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 bg-jade/10 rounded-lg">
                        <ShieldCheck className="h-6 w-6 text-jade" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">Garantía del fabricante</p>
                        <p className="text-sm text-foreground-muted mt-1">
                          Válida hasta: {formatDate(product.warrantyEndDate)}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : null}

                {/* Seguro adicional */}
                {product.hasAdditionalInsurance && product.additionalInsuranceEndDate && (
                  <div className="bg-surface-2 rounded-lg p-4 border border-border">
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 bg-info/10 rounded-lg">
                        <ShieldPlus className="h-6 w-6 text-info" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">Seguro adicional</p>
                        {product.additionalInsuranceProvider && (
                          <p className="text-sm text-foreground-muted">
                            {product.additionalInsuranceProvider}
                          </p>
                        )}
                        <p className="text-xs text-foreground-subtle mt-1">
                          Válido hasta: {formatDate(product.additionalInsuranceEndDate)}
                        </p>
                        {product.additionalInsuranceNotes && (
                          <p className="text-sm text-foreground-muted mt-2">
                            {product.additionalInsuranceNotes}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Manual (si existe) */}
                {product.manualUrl && (
                  <div className="bg-surface-2 rounded-lg p-4 border border-border">
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 bg-purple-500/10 rounded-lg">
                        <BookOpen className="h-6 w-6 text-purple-500" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">Manual de usuario</p>
                        <p className="text-xs text-foreground-muted mt-0.5">
                          PDF del fabricante
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => window.open(product.manualUrl, "_blank")}
                          className="p-2 rounded-lg hover:bg-surface-3 transition-colors text-foreground-muted hover:text-purple-500"
                          title="Abrir"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Empty state si no hay nada */}
                {!product.proofOfPurchaseUrl && !product.warrantyNotes && !product.warrantyEndDate && !product.hasAdditionalInsurance && !product.manualUrl && (
                  <div className="text-center py-8">
                    <FolderOpen className="h-12 w-12 text-foreground-subtle mx-auto mb-3" />
                    <p className="text-foreground-muted font-medium">Sin documentos</p>
                    <p className="text-sm text-foreground-subtle mt-1">
                      Edita el producto para añadir documentos
                    </p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-border bg-surface-2/50">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={handleCloseDocuments}
                  >
                    Cerrar
                  </Button>
                  <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={(e) => {
                      handleCloseDocuments();
                      onEdit?.(product);
                    }}
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    Editar producto
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Link>
  );
}
