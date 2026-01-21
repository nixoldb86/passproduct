"use client";

import { useEffect, useState } from "react";
import { Plus, SlidersHorizontal, TrendingUp, Package, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useWalletStore, useUIStore } from "@/store";
import { Button, Card, SkeletonCard } from "@/components/ui";
import { ProductCard, EditProductModal } from "@/components/wallet";
import { formatPrice } from "@/lib/utils";
import { calculateWalletValue } from "@/lib/mock-data";
import { Product } from "@/types";

export default function WalletPage() {
  const { products, isLoading, error, fetchProducts, deleteProduct, clearError, refreshMarketPrices } = useWalletStore();
  const { setAddProductModalOpen } = useUIStore();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsEditModalOpen(true);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar este producto?")) {
      setIsDeleting(productId);
      await deleteProduct(productId);
      setIsDeleting(null);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const walletValue = calculateWalletValue(products);
  
  // Get unique categories from products (con id y nombre)
  const categoriesMap = new Map<string, { id: string; name: string; icon?: string }>();
  products.forEach((p) => {
    if (p.category && p.categoryId) {
      categoriesMap.set(p.categoryId, {
        id: p.categoryId,
        name: p.category.name,
        icon: p.category.icon,
      });
    }
  });
  const categories = Array.from(categoriesMap.values());

  const filteredProducts = selectedCategory
    ? products.filter((p) => p.categoryId === selectedCategory)
    : products;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Mi Wallet</h1>
          <p className="text-foreground-muted mt-1">
            {products.length} productos registrados
          </p>
        </div>
        <Button
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={() => setAddProductModalOpen(true)}
        >
          Añadir producto
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card padding="md" className="bg-gradient-to-br from-surface-1 to-surface-2">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-sm text-foreground-muted">Valor total estimado</p>
              <p className="text-xl font-semibold text-foreground tabular-nums">
                {formatPrice(walletValue)}
              </p>
            </div>
          </div>
        </Card>

        <Card padding="md">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-jade/10 flex items-center justify-center">
              <Package className="h-5 w-5 text-jade" />
            </div>
            <div>
              <p className="text-sm text-foreground-muted">Productos</p>
              <p className="text-xl font-semibold text-foreground">
                {products.length}
              </p>
            </div>
          </div>
        </Card>

        <Card padding="md">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-info/10 flex items-center justify-center">
              <SlidersHorizontal className="h-5 w-5 text-info" />
            </div>
            <div>
              <p className="text-sm text-foreground-muted">Con garantía activa</p>
              <p className="text-xl font-semibold text-foreground">
                {products.filter((p) => p.warrantyEndDate && new Date(p.warrantyEndDate) > new Date()).length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <Button
          variant={selectedCategory === null ? "primary" : "ghost"}
          size="sm"
          onClick={() => setSelectedCategory(null)}
        >
          Todos
        </Button>
        {categories.map((cat) => (
          <Button
            key={cat.id}
            variant={selectedCategory === cat.id ? "primary" : "ghost"}
            size="sm"
            onClick={() => setSelectedCategory(cat.id === selectedCategory ? null : cat.id)}
          >
            {cat.icon} {cat.name}
          </Button>
        ))}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {isLoading ? (
            // Loading skeletons
            Array.from({ length: 6 }).map((_, i) => (
              <motion.div
                key={`skeleton-${i}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <SkeletonCard />
              </motion.div>
            ))
          ) : filteredProducts.length > 0 ? (
            // Products
            filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <ProductCard
                  product={product}
                  onEdit={handleEditProduct}
                  onDelete={handleDeleteProduct}
                  onRefreshMarketPrices={refreshMarketPrices}
                />
              </motion.div>
            ))
          ) : (
            // Empty state
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full"
            >
              <Card padding="lg" className="text-center py-16">
                <div className="h-16 w-16 rounded-2xl bg-surface-2 flex items-center justify-center mx-auto mb-4">
                  <Package className="h-8 w-8 text-foreground-subtle" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Tu wallet está vacía
                </h3>
                <p className="text-foreground-muted mb-6 max-w-sm mx-auto">
                  Añade tu primer producto para conocer su valor y tenerlo siempre localizado
                </p>
                <Button
                  leftIcon={<Plus className="h-4 w-4" />}
                  onClick={() => setAddProductModalOpen(true)}
                >
                  Añadir producto
                </Button>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Error Alert */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-20 right-4 bg-error/10 border border-error/20 text-error px-4 py-3 rounded-xl flex items-center gap-2 z-50"
        >
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
          <button onClick={clearError} className="ml-2 hover:text-error/80">✕</button>
        </motion.div>
      )}

      {/* Edit Product Modal */}
      <EditProductModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingProduct(null);
        }}
        product={editingProduct}
      />
    </div>
  );
}
