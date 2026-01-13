"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  Shield,
  MessageCircle,
  Copy,
  ExternalLink,
  AlertTriangle,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button, Card, Badge } from "@/components/ui";
import { formatPrice, formatDate } from "@/lib/utils";
import { mockOrders } from "@/lib/mock-data";
import { Order, OrderStatus, ORDER_STATUS_LABELS, DISPUTE_REASON_LABELS } from "@/types";

const TIMELINE_STEPS = [
  { status: "CREATED", label: "Pedido creado", icon: Clock },
  { status: "PAID", label: "Pago recibido", icon: CheckCircle },
  { status: "ESCROW_HOLD", label: "Pago retenido", icon: Shield },
  { status: "SHIPPED", label: "Enviado", icon: Truck },
  { status: "DELIVERED", label: "Entregado", icon: Package },
  { status: "ACCEPTED", label: "Aceptado", icon: CheckCircle },
];

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDisputeModal, setShowDisputeModal] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 300));
      const found = mockOrders.find((o) => o.id === params.id);
      setOrder(found || null);
      setIsLoading(false);
    };
    fetchOrder();
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto animate-pulse space-y-6">
        <div className="h-8 w-48 bg-surface-2 rounded-lg" />
        <div className="h-64 bg-surface-2 rounded-2xl" />
        <div className="h-48 bg-surface-2 rounded-2xl" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-3xl mx-auto text-center py-20">
        <Package className="h-16 w-16 text-foreground-subtle mx-auto mb-4" />
        <h1 className="text-xl font-semibold text-foreground mb-2">
          Pedido no encontrado
        </h1>
        <p className="text-foreground-muted mb-6">
          Este pedido no existe o no tienes acceso a él.
        </p>
        <Link href="/orders">
          <Button variant="secondary">Volver a mis pedidos</Button>
        </Link>
      </div>
    );
  }

  const isBuyer = order.buyerId === "user-1";
  const currentStepIndex = TIMELINE_STEPS.findIndex(
    (s) => s.status === order.status
  );

  // Mock listing data
  const mockListing = {
    title: "iPhone 14 Pro Max 256GB",
    photo: "https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=400",
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Back button */}
      <Link
        href="/orders"
        className="inline-flex items-center gap-2 text-foreground-muted hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Volver a mis pedidos</span>
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Pedido #{order.id.slice(-8).toUpperCase()}
          </h1>
          <p className="text-foreground-muted mt-1">
            {formatDate(order.createdAt, {
              day: "2-digit",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
        <Badge
          variant={
            order.status === "ACCEPTED" || order.status === "RELEASED"
              ? "verified"
              : order.status === "DISPUTED"
              ? "warning"
              : "info"
          }
          size="md"
        >
          {ORDER_STATUS_LABELS[order.status]}
        </Badge>
      </div>

      {/* Timeline */}
      <Card padding="md" className="mb-6">
        <h3 className="font-medium text-foreground mb-6">Estado del pedido</h3>
        <div className="relative">
          {/* Progress line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-surface-2">
            <motion.div
              className="w-full bg-jade"
              initial={{ height: 0 }}
              animate={{
                height: `${(currentStepIndex / (TIMELINE_STEPS.length - 1)) * 100}%`,
              }}
              transition={{ duration: 0.5, delay: 0.2 }}
            />
          </div>

          {/* Steps */}
          <div className="space-y-6">
            {TIMELINE_STEPS.map((step, index) => {
              const isCompleted = index <= currentStepIndex;
              const isCurrent = index === currentStepIndex;
              const StepIcon = step.icon;

              // Get timestamp for completed steps
              const timestamp = getStepTimestamp(order, step.status as OrderStatus);

              return (
                <motion.div
                  key={step.status}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex items-start gap-4"
                >
                  <div
                    className={`relative z-10 h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                      isCompleted
                        ? "bg-jade text-white"
                        : "bg-surface-2 text-foreground-subtle"
                    } ${isCurrent ? "ring-4 ring-jade/20" : ""}`}
                  >
                    <StepIcon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 pt-1">
                    <p
                      className={`font-medium ${
                        isCompleted ? "text-foreground" : "text-foreground-subtle"
                      }`}
                    >
                      {step.label}
                    </p>
                    {timestamp && (
                      <p className="text-sm text-foreground-subtle">
                        {formatDate(timestamp, {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Actions based on status */}
        {isBuyer && order.status === "DELIVERED" && (
          <div className="mt-6 pt-6 border-t border-border space-y-3">
            <p className="text-sm text-foreground-muted">
              ¿Has recibido el producto en buen estado?
            </p>
            <div className="flex gap-3">
              <Button className="flex-1">Confirmar recepción</Button>
              <Button
                variant="danger"
                className="flex-1"
                onClick={() => setShowDisputeModal(true)}
              >
                Abrir disputa
              </Button>
            </div>
          </div>
        )}

        {!isBuyer && order.status === "ESCROW_HOLD" && (
          <div className="mt-6 pt-6 border-t border-border space-y-3">
            <p className="text-sm text-foreground-muted">
              El pago está retenido. Envía el producto y añade el número de
              seguimiento.
            </p>
            <Button>Marcar como enviado</Button>
          </div>
        )}
      </Card>

      {/* Shipping Info */}
      {order.trackingNumber && (
        <Card padding="md" className="mb-6">
          <h3 className="font-medium text-foreground mb-4">Información de envío</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-foreground-muted">Transportista</span>
              <span className="text-foreground">{order.carrier || "—"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-foreground-muted">Nº seguimiento</span>
              <div className="flex items-center gap-2">
                <span className="text-foreground font-mono">
                  {order.trackingNumber}
                </span>
                <button
                  onClick={() =>
                    navigator.clipboard.writeText(order.trackingNumber || "")
                  }
                  className="p-1 rounded hover:bg-surface-2 transition-colors"
                >
                  <Copy className="h-4 w-4 text-foreground-muted" />
                </button>
                <a
                  href="#"
                  target="_blank"
                  className="p-1 rounded hover:bg-surface-2 transition-colors"
                >
                  <ExternalLink className="h-4 w-4 text-foreground-muted" />
                </a>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Product & Price Summary */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Product */}
        <Card padding="md">
          <h3 className="font-medium text-foreground mb-4">Producto</h3>
          <div className="flex gap-4">
            <div className="relative h-20 w-20 rounded-xl bg-surface-2 overflow-hidden flex-shrink-0">
              <Image
                src={mockListing.photo}
                alt=""
                fill
                className="object-cover"
              />
            </div>
            <div>
              <p className="font-medium text-foreground">{mockListing.title}</p>
              <p className="text-sm text-foreground-muted mt-1">
                Vendido por Juan D.
              </p>
            </div>
          </div>
        </Card>

        {/* Price summary */}
        <Card padding="md">
          <h3 className="font-medium text-foreground mb-4">Resumen</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-foreground-muted">Precio</span>
              <span className="text-foreground">{formatPrice(order.amount)}</span>
            </div>
            {order.shippingAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-foreground-muted">Envío</span>
                <span className="text-foreground">
                  {formatPrice(order.shippingAmount)}
                </span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-foreground-muted">Protección comprador</span>
              <span className="text-foreground">
                {formatPrice(order.feeProtection)}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-border">
              <span className="font-medium text-foreground">Total</span>
              <span className="font-semibold text-foreground">
                {formatPrice(order.total)}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Protection Info */}
      <Card padding="md" className="bg-jade/5 border-jade/20 mb-6">
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 text-jade flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-jade">Protección comprador activa</p>
            <p className="text-sm text-jade/80 mt-1">
              El pago se retiene hasta que confirmes la recepción del producto. Si
              algo no va bien, puedes abrir una disputa en los 3 días siguientes
              a la entrega.
            </p>
          </div>
        </div>
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          variant="secondary"
          className="flex-1"
          leftIcon={<MessageCircle className="h-4 w-4" />}
        >
          Contactar {isBuyer ? "vendedor" : "comprador"}
        </Button>
        {order.status !== "DISPUTED" &&
          order.status !== "REFUNDED" &&
          order.status !== "RELEASED" && (
            <Button
              variant="ghost"
              leftIcon={<AlertTriangle className="h-4 w-4" />}
              onClick={() => setShowDisputeModal(true)}
            >
              Reportar problema
            </Button>
          )}
      </div>

      {/* Dispute Modal would go here */}
      {showDisputeModal && (
        <DisputeModal
          orderId={order.id}
          onClose={() => setShowDisputeModal(false)}
        />
      )}
    </div>
  );
}

function getStepTimestamp(order: Order, status: OrderStatus): Date | undefined {
  switch (status) {
    case "CREATED":
      return order.createdAt;
    case "PAID":
      return order.paidAt;
    case "SHIPPED":
      return order.shippedAt;
    case "DELIVERED":
      return order.deliveredAt;
    case "ACCEPTED":
      return order.acceptedAt;
    default:
      return undefined;
  }
}

function DisputeModal({
  orderId,
  onClose,
}: {
  orderId: string;
  onClose: () => void;
}) {
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = () => {
    // Handle dispute submission
    console.log("Opening dispute:", { orderId, reason, description });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-md bg-surface-1 border border-border rounded-2xl p-6"
      >
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Abrir disputa
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground-muted mb-2">
              Motivo
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full h-10 px-4 bg-surface-2 border border-border rounded-xl text-sm"
            >
              <option value="">Selecciona un motivo</option>
              <option value="NOT_RECEIVED">No ha llegado</option>
              <option value="NOT_AS_DESCRIBED">No coincide con el anuncio</option>
              <option value="NOT_WORKING">No funciona</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground-muted mb-2">
              Descripción del problema
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Describe el problema con detalle..."
              className="w-full px-4 py-3 bg-surface-2 border border-border rounded-xl text-sm resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground-muted mb-2">
              Evidencias (opcional)
            </label>
            <button className="w-full p-4 border-2 border-dashed border-border rounded-xl text-foreground-muted hover:border-border-hover transition-colors">
              Subir fotos o videos
            </button>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button variant="ghost" className="flex-1" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant="danger"
            className="flex-1"
            onClick={handleSubmit}
            disabled={!reason || !description}
          >
            Abrir disputa
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
