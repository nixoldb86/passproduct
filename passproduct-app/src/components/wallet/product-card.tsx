"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Calendar, Tag, MoreVertical, ImageOff, Pencil, Trash2, ShieldCheck, ShieldAlert, ShieldX, ShieldOff, ShieldPlus } from "lucide-react";
import { Product, CONDITION_LABELS } from "@/types";
import { Card, Badge } from "@/components/ui";
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
  const menuRef = useRef<HTMLDivElement>(null);
  
  const warranty = getWarrantyStatus(product.warrantyEndDate);
  const insurance = getInsuranceStatus(product.hasAdditionalInsurance, product.additionalInsuranceEndDate);

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
              {CONDITION_LABELS[product.condition]}
            </span>
            {product.purchaseDate && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDate(product.purchaseDate, { month: "short", year: "2-digit" })}
              </span>
            )}
          </div>

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
    </Link>
  );
}
