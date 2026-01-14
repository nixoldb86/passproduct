"use client";

import { useState, useEffect } from "react";
import { X, Calendar, Store, Tag, Shield, Plus, Package, ShieldPlus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Product, ProductCondition, CONDITION_LABELS } from "@/types";
import { Button } from "@/components/ui";

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onSave: (productId: string, updates: Partial<Product>) => void;
}

export function EditProductModal({ isOpen, onClose, product, onSave }: EditProductModalProps) {
  const [formData, setFormData] = useState({
    brand: "",
    model: "",
    variant: "",
    condition: "VERY_GOOD" as ProductCondition,
    purchaseDate: "",
    purchaseStore: "",
    warrantyEndDate: "",
    // Seguro adicional
    hasAdditionalInsurance: false,
    additionalInsuranceEndDate: "",
    additionalInsuranceProvider: "",
    additionalInsuranceNotes: "",
  });

  const [accessories, setAccessories] = useState<Record<string, boolean>>({});
  const [newAccessory, setNewAccessory] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Cargar datos del producto cuando se abre el modal
  useEffect(() => {
    if (product && isOpen) {
      setFormData({
        brand: product.brand || "",
        model: product.model || "",
        variant: product.variant || "",
        condition: product.condition || "VERY_GOOD",
        purchaseDate: product.purchaseDate
          ? new Date(product.purchaseDate).toISOString().split("T")[0]
          : "",
        purchaseStore: product.purchaseStore || "",
        warrantyEndDate: product.warrantyEndDate
          ? new Date(product.warrantyEndDate).toISOString().split("T")[0]
          : "",
        hasAdditionalInsurance: product.hasAdditionalInsurance || false,
        additionalInsuranceEndDate: product.additionalInsuranceEndDate
          ? new Date(product.additionalInsuranceEndDate).toISOString().split("T")[0]
          : "",
        additionalInsuranceProvider: product.additionalInsuranceProvider || "",
        additionalInsuranceNotes: product.additionalInsuranceNotes || "",
      });
      setAccessories(product.accessories || {});
      setNewAccessory("");
    }
  }, [product, isOpen]);

  const handleAddAccessory = () => {
    if (newAccessory.trim()) {
      setAccessories((prev) => ({
        ...prev,
        [newAccessory.trim()]: true,
      }));
      setNewAccessory("");
    }
  };

  const handleRemoveAccessory = (key: string) => {
    setAccessories((prev) => {
      const updated = { ...prev };
      delete updated[key];
      return updated;
    });
  };

  const handleToggleAccessory = (key: string) => {
    setAccessories((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSubmit = async () => {
    if (!product) return;

    setIsSaving(true);

    const updates: Partial<Product> = {
      brand: formData.brand,
      model: formData.model,
      variant: formData.variant || undefined,
      condition: formData.condition,
      purchaseDate: formData.purchaseDate ? new Date(formData.purchaseDate) : undefined,
      purchaseStore: formData.purchaseStore || undefined,
      warrantyEndDate: formData.warrantyEndDate ? new Date(formData.warrantyEndDate) : undefined,
      accessories: Object.keys(accessories).length > 0 ? accessories : undefined,
      // Seguro adicional
      hasAdditionalInsurance: formData.hasAdditionalInsurance || undefined,
      additionalInsuranceEndDate: formData.additionalInsuranceEndDate 
        ? new Date(formData.additionalInsuranceEndDate) 
        : undefined,
      additionalInsuranceProvider: formData.additionalInsuranceProvider || undefined,
      additionalInsuranceNotes: formData.additionalInsuranceNotes || undefined,
      updatedAt: new Date(),
    };

    // Simular delay de guardado
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    onSave(product.id, updates);
    setIsSaving(false);
    onClose();
  };

  if (!product) return null;

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
            className="fixed inset-4 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-lg sm:max-h-[90vh] bg-background rounded-2xl shadow-xl z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">
                Editar producto
              </h2>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-surface-1 transition-colors"
              >
                <X className="h-5 w-5 text-foreground-muted" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Producto Info (solo lectura - categoría) */}
              <div className="flex items-center gap-3 p-3 bg-surface-1 rounded-xl">
                <div className="h-12 w-12 rounded-lg bg-surface-2 flex items-center justify-center text-2xl">
                  {product.category?.icon || "📦"}
                </div>
                <div>
                  <p className="text-sm text-foreground-muted">
                    {product.category?.name || "Sin categoría"}
                  </p>
                  <p className="text-xs text-foreground-subtle">
                    La categoría no se puede modificar
                  </p>
                </div>
              </div>

              {/* Marca y Modelo */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-foreground-muted mb-1.5">
                    Marca *
                  </label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) =>
                      setFormData({ ...formData, brand: e.target.value })
                    }
                    className="w-full px-3 py-2.5 bg-surface-1 border border-border rounded-xl text-foreground placeholder:text-foreground-subtle focus:outline-none focus:ring-2 focus:ring-accent/50"
                    placeholder="Apple, Samsung..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground-muted mb-1.5">
                    Modelo *
                  </label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) =>
                      setFormData({ ...formData, model: e.target.value })
                    }
                    className="w-full px-3 py-2.5 bg-surface-1 border border-border rounded-xl text-foreground placeholder:text-foreground-subtle focus:outline-none focus:ring-2 focus:ring-accent/50"
                    placeholder="iPhone 15 Pro..."
                  />
                </div>
              </div>

              {/* Variante */}
              <div>
                <label className="block text-sm font-medium text-foreground-muted mb-1.5">
                  Variante / Versión
                </label>
                <input
                  type="text"
                  value={formData.variant}
                  onChange={(e) =>
                    setFormData({ ...formData, variant: e.target.value })
                  }
                  className="w-full px-3 py-2.5 bg-surface-1 border border-border rounded-xl text-foreground placeholder:text-foreground-subtle focus:outline-none focus:ring-2 focus:ring-accent/50"
                  placeholder="256GB Negro Titanio..."
                />
              </div>

              {/* Estado / Condición */}
              <div>
                <label className="block text-sm font-medium text-foreground-muted mb-1.5">
                  <Tag className="inline h-4 w-4 mr-1" />
                  Estado del producto
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(Object.entries(CONDITION_LABELS) as [ProductCondition, string][]).map(
                    ([value, label]) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, condition: value })
                        }
                        className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                          formData.condition === value
                            ? "border-accent bg-accent/10 text-accent"
                            : "border-border bg-surface-1 text-foreground-muted hover:border-accent/50"
                        }`}
                      >
                        {label}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Fecha y Tienda de compra */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-foreground-muted mb-1.5">
                    <Calendar className="inline h-4 w-4 mr-1" />
                    Fecha de compra
                  </label>
                  <input
                    type="date"
                    value={formData.purchaseDate}
                    onChange={(e) =>
                      setFormData({ ...formData, purchaseDate: e.target.value })
                    }
                    className="w-full px-3 py-2.5 bg-surface-1 border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground-muted mb-1.5">
                    <Store className="inline h-4 w-4 mr-1" />
                    Tienda
                  </label>
                  <input
                    type="text"
                    value={formData.purchaseStore}
                    onChange={(e) =>
                      setFormData({ ...formData, purchaseStore: e.target.value })
                    }
                    className="w-full px-3 py-2.5 bg-surface-1 border border-border rounded-xl text-foreground placeholder:text-foreground-subtle focus:outline-none focus:ring-2 focus:ring-accent/50"
                    placeholder="Amazon, MediaMarkt..."
                  />
                </div>
              </div>

              {/* Garantía */}
              <div>
                <label className="block text-sm font-medium text-foreground-muted mb-1.5">
                  <Shield className="inline h-4 w-4 mr-1" />
                  Garantía válida hasta
                </label>
                <input
                  type="date"
                  value={formData.warrantyEndDate}
                  onChange={(e) =>
                    setFormData({ ...formData, warrantyEndDate: e.target.value })
                  }
                  className="w-full px-3 py-2.5 bg-surface-1 border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
                />
              </div>

              {/* Seguro adicional */}
              <div className="p-4 rounded-xl bg-surface-1 border border-border space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldPlus className="h-4 w-4 text-info" />
                    <p className="text-sm font-medium text-foreground">
                      Seguro adicional
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, hasAdditionalInsurance: !formData.hasAdditionalInsurance })
                    }
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

                {formData.hasAdditionalInsurance && (
                  <div className="space-y-3 pt-2 border-t border-border">
                    <div>
                      <label className="block text-xs font-medium text-foreground-muted mb-1">
                        Fecha de vencimiento
                      </label>
                      <input
                        type="date"
                        value={formData.additionalInsuranceEndDate}
                        onChange={(e) =>
                          setFormData({ ...formData, additionalInsuranceEndDate: e.target.value })
                        }
                        className="w-full px-3 py-2 bg-surface-2 border border-border rounded-xl text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-foreground-muted mb-1">
                        Proveedor (opcional)
                      </label>
                      <input
                        type="text"
                        value={formData.additionalInsuranceProvider}
                        onChange={(e) =>
                          setFormData({ ...formData, additionalInsuranceProvider: e.target.value })
                        }
                        placeholder="Ej: AppleCare+, MediaMarkt Protect..."
                        className="w-full px-3 py-2 bg-surface-2 border border-border rounded-xl text-foreground placeholder:text-foreground-subtle text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-foreground-muted mb-1">
                        Notas (opcional)
                      </label>
                      <input
                        type="text"
                        value={formData.additionalInsuranceNotes}
                        onChange={(e) =>
                          setFormData({ ...formData, additionalInsuranceNotes: e.target.value })
                        }
                        placeholder="Ej: Cubre rotura de pantalla..."
                        className="w-full px-3 py-2 bg-surface-2 border border-border rounded-xl text-foreground placeholder:text-foreground-subtle text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Accesorios incluidos */}
              <div>
                <label className="block text-sm font-medium text-foreground-muted mb-1.5">
                  <Package className="inline h-4 w-4 mr-1" />
                  Accesorios incluidos
                </label>
                
                {/* Lista de accesorios actuales */}
                {Object.keys(accessories).length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {Object.entries(accessories).map(([key, included]) => (
                      <div
                        key={key}
                        className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                          included
                            ? "bg-jade/10 text-jade border border-jade/20"
                            : "bg-surface-2 text-foreground-subtle border border-border"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => handleToggleAccessory(key)}
                          className="flex items-center gap-1"
                        >
                          <span className={`h-4 w-4 rounded border flex items-center justify-center ${
                            included 
                              ? "bg-jade border-jade text-white" 
                              : "border-border bg-surface-1"
                          }`}>
                            {included && (
                              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </span>
                          <span>{key}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveAccessory(key)}
                          className="ml-1 p-0.5 rounded-full hover:bg-error/20 text-foreground-subtle hover:text-error transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Añadir nuevo accesorio */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newAccessory}
                    onChange={(e) => setNewAccessory(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddAccessory();
                      }
                    }}
                    placeholder="Añadir accesorio..."
                    className="flex-1 px-3 py-2 bg-surface-1 border border-border rounded-xl text-foreground placeholder:text-foreground-subtle focus:outline-none focus:ring-2 focus:ring-accent/50 text-sm"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={handleAddAccessory}
                    disabled={!newAccessory.trim()}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-foreground-subtle mt-1.5">
                  Haz clic en un accesorio para marcarlo como incluido/no incluido
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-3 p-4 border-t border-border bg-surface-1">
              <Button variant="ghost" onClick={onClose} className="flex-1">
                Cancelar
              </Button>
              <Button
                onClick={handleSubmit}
                isLoading={isSaving}
                disabled={!formData.brand || !formData.model}
                className="flex-1"
              >
                Guardar cambios
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
