"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Package,
  ShoppingBag,
  Store,
  ChevronRight,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { useOrderStore } from "@/store";
import { Button, Card, Badge } from "@/components/ui";
import { formatPrice, formatDate } from "@/lib/utils";
import { Order, OrderStatus, ORDER_STATUS_LABELS } from "@/types";

const ORDER_STATUS_CONFIG: Record<
  OrderStatus,
  { icon: React.ComponentType<{ className?: string }>; color: string }
> = {
  CREATED: { icon: Clock, color: "text-foreground-muted" },
  PAID: { icon: CheckCircle, color: "text-info" },
  ESCROW_HOLD: { icon: Clock, color: "text-accent" },
  SHIPPED: { icon: Truck, color: "text-info" },
  HANDED_OVER: { icon: Package, color: "text-info" },
  DELIVERED: { icon: CheckCircle, color: "text-jade" },
  ACCEPTED: { icon: CheckCircle, color: "text-jade" },
  RELEASED: { icon: CheckCircle, color: "text-jade" },
  DISPUTED: { icon: AlertCircle, color: "text-warning" },
  REFUNDED: { icon: XCircle, color: "text-error" },
};

export default function OrdersPage() {
  const { orders, isLoading, fetchOrders } = useOrderStore();
  const [activeTab, setActiveTab] = useState<"buying" | "selling">("buying");

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Filter orders by type (in real app, check buyerId vs sellerId)
  const buyingOrders = orders.filter((o) => o.buyerId === "user-1");
  const sellingOrders = orders.filter((o) => o.sellerId === "user-1");
  const displayedOrders = activeTab === "buying" ? buyingOrders : sellingOrders;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Mis pedidos</h1>
        <p className="text-foreground-muted mt-1">
          Gestiona tus compras y ventas
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border">
        <button
          onClick={() => setActiveTab("buying")}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "buying"
              ? "border-accent text-accent"
              : "border-transparent text-foreground-muted hover:text-foreground"
          }`}
        >
          <ShoppingBag className="h-4 w-4" />
          Mis compras
          {buyingOrders.length > 0 && (
            <span className="h-5 px-1.5 rounded-full bg-surface-2 text-xs flex items-center justify-center">
              {buyingOrders.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("selling")}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "selling"
              ? "border-accent text-accent"
              : "border-transparent text-foreground-muted hover:text-foreground"
          }`}
        >
          <Store className="h-4 w-4" />
          Mis ventas
          {sellingOrders.length > 0 && (
            <span className="h-5 px-1.5 rounded-full bg-surface-2 text-xs flex items-center justify-center">
              {sellingOrders.length}
            </span>
          )}
        </button>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {displayedOrders.length === 0 ? (
          <Card padding="lg" className="text-center py-16">
            <div className="h-16 w-16 rounded-2xl bg-surface-2 flex items-center justify-center mx-auto mb-4">
              {activeTab === "buying" ? (
                <ShoppingBag className="h-8 w-8 text-foreground-subtle" />
              ) : (
                <Store className="h-8 w-8 text-foreground-subtle" />
              )}
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {activeTab === "buying"
                ? "No tienes compras"
                : "No tienes ventas"}
            </h3>
            <p className="text-foreground-muted mb-6 max-w-sm mx-auto">
              {activeTab === "buying"
                ? "Cuando compres algo en el marketplace, aparecerá aquí"
                : "Cuando vendas algo, aparecerá aquí"}
            </p>
            <Link href="/marketplace">
              <Button variant="secondary">
                {activeTab === "buying"
                  ? "Explorar marketplace"
                  : "Vender un producto"}
              </Button>
            </Link>
          </Card>
        ) : (
          displayedOrders.map((order, index) => (
            <OrderCard
              key={order.id}
              order={order}
              type={activeTab}
              index={index}
            />
          ))
        )}
      </div>
    </div>
  );
}

function OrderCard({
  order,
  type,
  index,
}: {
  order: Order;
  type: "buying" | "selling";
  index: number;
}) {
  const StatusIcon = ORDER_STATUS_CONFIG[order.status].icon;
  const statusColor = ORDER_STATUS_CONFIG[order.status].color;

  // Mock listing data
  const mockListing = {
    title: "iPhone 14 Pro Max 256GB",
    photo: "https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=400",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Link href={`/orders/${order.id}`}>
        <Card
          variant="interactive"
          padding="none"
          className="overflow-hidden"
        >
          <div className="flex">
            {/* Image */}
            <div className="relative h-32 w-32 bg-surface-2 flex-shrink-0">
              <Image
                src={mockListing.photo}
                alt=""
                fill
                className="object-cover"
              />
            </div>

            {/* Content */}
            <div className="flex-1 p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-foreground line-clamp-1">
                      {mockListing.title}
                    </h3>
                    <p className="text-sm text-foreground-muted mt-0.5">
                      Pedido #{order.id.slice(-8).toUpperCase()}
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-foreground-subtle flex-shrink-0" />
                </div>

                {/* Status */}
                <div className="flex items-center gap-2 mt-3">
                  <StatusIcon className={`h-4 w-4 ${statusColor}`} />
                  <span className={`text-sm font-medium ${statusColor}`}>
                    {ORDER_STATUS_LABELS[order.status]}
                  </span>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                <div className="text-sm text-foreground-muted">
                  {formatDate(order.createdAt)}
                </div>
                <div className="font-semibold text-foreground tabular-nums">
                  {type === "buying"
                    ? formatPrice(order.total)
                    : formatPrice(order.sellerPayout)}
                </div>
              </div>
            </div>
          </div>

          {/* Timeline preview */}
          <div className="px-4 py-3 bg-surface-2/50 border-t border-border">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-1">
                {["CREATED", "PAID", "ESCROW_HOLD", "SHIPPED", "DELIVERED", "ACCEPTED"].map(
                  (step, i) => {
                    const isCompleted =
                      getStatusIndex(order.status as OrderStatus) >= i;
                    return (
                      <div
                        key={step}
                        className={`h-2 w-2 rounded-full border-2 border-surface-1 ${
                          isCompleted ? "bg-jade" : "bg-surface-2"
                        }`}
                      />
                    );
                  }
                )}
              </div>
              <span className="text-xs text-foreground-subtle">
                {getStatusProgress(order.status)}
              </span>
            </div>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
}

function getStatusIndex(status: OrderStatus): number {
  const order = [
    "CREATED",
    "PAID",
    "ESCROW_HOLD",
    "SHIPPED",
    "DELIVERED",
    "ACCEPTED",
    "RELEASED",
  ];
  return order.indexOf(status);
}

function getStatusProgress(status: OrderStatus): string {
  const messages: Partial<Record<OrderStatus, string>> = {
    CREATED: "Pendiente de pago",
    PAID: "Pago recibido",
    ESCROW_HOLD: "Pago retenido - Esperando envío",
    SHIPPED: "En camino",
    DELIVERED: "Entregado - Pendiente confirmación",
    ACCEPTED: "Completado",
    RELEASED: "Pago liberado",
    DISPUTED: "En disputa",
    REFUNDED: "Reembolsado",
  };
  return messages[status] || "";
}
