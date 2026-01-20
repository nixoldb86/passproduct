"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
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
  PartyPopper,
  Eye,
  EyeOff,
  Video,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button, Card, Badge, Input, Select } from "@/components/ui";
import { formatPrice, formatDate } from "@/lib/utils";
import { OrderStatus, ORDER_STATUS_LABELS } from "@/types";
import { CARRIERS } from "@/lib/stripe";

// Timeline steps
const TIMELINE_STEPS = [
  { status: "CREATED", label: "Pedido creado", icon: Clock },
  { status: "ESCROW_HOLD", label: "Pago recibido", icon: Shield },
  { status: "SHIPPED", label: "Enviado", icon: Truck },
  { status: "DELIVERED", label: "Entregado", icon: Package },
  { status: "ACCEPTED", label: "Aceptado", icon: CheckCircle },
];

// Order type from API
interface OrderData {
  id: string;
  listingId: string;
  buyerId: string;
  sellerId: string;
  amount: number;
  shippingAmount: number;
  feeMarketplace: number;
  feeProtection: number;
  total: number;
  sellerPayout: number;
  status: OrderStatus;
  trackingNumber: string | null;
  carrier: string | null;
  isLocalPickup: boolean;
  shippingAddress: {
    fullName: string;
    street: string;
    city: string;
    postalCode: string;
    country: string;
    phone: string;
  } | null;
  protectionCode: string | null;
  protectionCodeUsed: boolean;
  paidAt: string | null;
  escrowAt: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  acceptedAt: string | null;
  releasedAt: string | null;
  createdAt: string;
  listing: {
    id: string;
    title: string;
    description: string;
    photos: string[];
    price: number;
  } | null;
  buyer: { id: string; firstName: string; lastName: string; avatarUrl: string };
  seller: { id: string; firstName: string; lastName: string; avatarUrl: string };
  isBuyer: boolean;
  isSeller: boolean;
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [order, setOrder] = useState<OrderData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);

  // Check if coming from successful payment
  const isSuccess = searchParams.get("success") === "true";

  useEffect(() => {
    const fetchOrder = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/db/orders/${params.id}`);
        const data = await response.json();
        if (data.success && data.order) {
          setOrder(data.order);
          if (isSuccess && data.order.status === "ESCROW_HOLD") {
            setShowSuccessAnimation(true);
            setTimeout(() => setShowSuccessAnimation(false), 5000);
          }
        } else {
          setOrder(null);
        }
      } catch (error) {
        console.error("Error fetching order:", error);
        setOrder(null);
      }
      setIsLoading(false);
    };
    fetchOrder();
  }, [params.id, isSuccess]);

  // Refetch order after actions
  const refetchOrder = async () => {
    try {
      const response = await fetch(`/api/db/orders/${params.id}`);
      const data = await response.json();
      if (data.success && data.order) {
        setOrder(data.order);
      }
    } catch (error) {
      console.error("Error refetching order:", error);
    }
  };

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

  const currentStepIndex = TIMELINE_STEPS.findIndex(
    (s) => s.status === order.status
  );

  return (
    <div className="max-w-3xl mx-auto">
      {/* Success Animation */}
      <AnimatePresence>
        {showSuccessAnimation && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
            onClick={() => setShowSuccessAnimation(false)}
          >
            <motion.div
              className="bg-surface-1 rounded-2xl p-8 text-center max-w-md mx-4"
              initial={{ y: 20 }}
              animate={{ y: 0 }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
              >
                <PartyPopper className="h-16 w-16 text-accent mx-auto mb-4" />
              </motion.div>
              <h2 className="text-2xl font-semibold text-foreground mb-2">
                ¡Compra realizada!
              </h2>
              <p className="text-foreground-muted mb-4">
                El vendedor ha sido notificado y preparará tu pedido pronto.
              </p>
              <p className="text-sm text-foreground-subtle">
                Tu pago está protegido hasta que confirmes la recepción.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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

      {/* Role-specific Actions */}
      {order.isSeller && order.status === "ESCROW_HOLD" && (
        <SellerShippingPanel order={order} onSuccess={refetchOrder} />
      )}

      {order.isBuyer && order.status === "DELIVERED" && (
        <BuyerVerificationPanel order={order} onSuccess={refetchOrder} />
      )}

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
                {order.carrier && (
                <a
                    href={getTrackingUrl(order.carrier, order.trackingNumber)}
                  target="_blank"
                    rel="noopener noreferrer"
                  className="p-1 rounded hover:bg-surface-2 transition-colors"
                >
                  <ExternalLink className="h-4 w-4 text-foreground-muted" />
                </a>
                )}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Shipping Address (buyer view) */}
      {order.isBuyer && order.shippingAddress && (
        <Card padding="md" className="mb-6">
          <h3 className="font-medium text-foreground mb-4">Dirección de envío</h3>
          <div className="text-sm text-foreground-muted">
            <p className="text-foreground font-medium">{order.shippingAddress.fullName}</p>
            <p>{order.shippingAddress.street}</p>
            <p>{order.shippingAddress.postalCode} {order.shippingAddress.city}</p>
            <p>{order.shippingAddress.country}</p>
            {order.shippingAddress.phone && <p className="mt-2">{order.shippingAddress.phone}</p>}
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
              {order.listing?.photos[0] ? (
              <Image
                  src={order.listing.photos[0]}
                alt=""
                fill
                className="object-cover"
              />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Package className="h-8 w-8 text-foreground-subtle" />
                </div>
              )}
            </div>
            <div>
              <p className="font-medium text-foreground">
                {order.listing?.title || "Producto"}
              </p>
              <p className="text-sm text-foreground-muted mt-1">
                {order.isBuyer ? "Vendido por" : "Comprado por"}{" "}
                {order.isBuyer
                  ? `${order.seller.firstName} ${order.seller.lastName.charAt(0)}.`
                  : `${order.buyer.firstName} ${order.buyer.lastName.charAt(0)}.`}
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
            {order.feeProtection > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-foreground-muted">Protección comprador</span>
              <span className="text-foreground">
                {formatPrice(order.feeProtection)}
              </span>
            </div>
            )}
            <div className="flex justify-between pt-2 border-t border-border">
              <span className="font-medium text-foreground">
                {order.isBuyer ? "Total pagado" : "Recibirás"}
              </span>
              <span className="font-semibold text-foreground">
                {formatPrice(order.isBuyer ? order.total : order.sellerPayout)}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Protection Info */}
      {order.feeProtection > 0 && order.status !== "RELEASED" && (
      <Card padding="md" className="bg-jade/5 border-jade/20 mb-6">
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 text-jade flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-jade">Protección comprador activa</p>
            <p className="text-sm text-jade/80 mt-1">
                {order.isBuyer
                  ? "El pago se retiene hasta que confirmes la recepción del producto."
                  : "El pago se liberará cuando el comprador confirme la recepción."}
            </p>
          </div>
        </div>
      </Card>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          variant="secondary"
          className="flex-1"
          leftIcon={<MessageCircle className="h-4 w-4" />}
          onClick={() => router.push(`/chat?conversation=${order.id}`)}
        >
          Contactar {order.isBuyer ? "vendedor" : "comprador"}
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

      {/* Dispute Modal */}
      {showDisputeModal && (
        <DisputeModal
          orderId={order.id}
          onClose={() => setShowDisputeModal(false)}
          onSuccess={refetchOrder}
        />
      )}
    </div>
  );
}

// Seller Panel: Show protection code and shipping form
function SellerShippingPanel({
  order,
  onSuccess,
}: {
  order: OrderData;
  onSuccess: () => void;
}) {
  const [showCode, setShowCode] = useState(false);
  const [carrier, setCarrier] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showInstructions, setShowInstructions] = useState(true);

  const handleShip = async () => {
    if (!carrier) {
      setError("Selecciona un transportista");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/db/orders/${order.id}/ship`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ carrier, trackingNumber }),
      });

      const data = await response.json();

      if (data.success) {
        onSuccess();
      } else {
        setError(data.error || "Error al marcar como enviado");
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card padding="md" className="mb-6 bg-accent/5 border-accent/20">
      <div className="flex items-center gap-2 mb-4">
        <Package className="h-5 w-5 text-accent" />
        <h3 className="font-semibold text-accent">Nueva venta - Preparar envío</h3>
      </div>

      {/* Instructions */}
      <button
        onClick={() => setShowInstructions(!showInstructions)}
        className="flex items-center gap-2 text-sm text-foreground-muted hover:text-foreground mb-4 w-full"
      >
        <span>📋 Instrucciones de envío</span>
        {showInstructions ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </button>

      <AnimatePresence>
        {showInstructions && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-surface-2 rounded-xl p-4 mb-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-accent">1</span>
                </div>
                <div>
                  <p className="font-medium text-foreground">Escribe el código en un papel</p>
                  <p className="text-sm text-foreground-muted">
                    Copia el código de protección de abajo y escríbelo a mano en un papel.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-accent">2</span>
                </div>
                <div>
                  <p className="font-medium text-foreground">Mete el papel dentro del paquete</p>
                  <p className="text-sm text-foreground-muted">
                    El comprador usará este código para verificar que el paquete no ha sido manipulado.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-accent">3</span>
                </div>
                <div>
                  <p className="font-medium text-foreground">Envía y añade el tracking</p>
                  <p className="text-sm text-foreground-muted">
                    Cuando lo envíes, añade el número de seguimiento abajo.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Protection Code Display */}
      <div className="mb-4">
        <label className="text-sm text-foreground-muted mb-2 block">
          Código de protección
        </label>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-surface-2 rounded-xl px-4 py-3 font-mono text-lg text-center tracking-widest">
            {showCode ? order.protectionCode : "••••••••••"}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowCode(!showCode)}
          >
            {showCode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigator.clipboard.writeText(order.protectionCode || "")}
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Shipping Address */}
      {order.shippingAddress && (
        <div className="mb-4 p-3 bg-surface-2 rounded-xl">
          <p className="text-xs text-foreground-muted mb-1">Enviar a:</p>
          <p className="text-sm font-medium text-foreground">{order.shippingAddress.fullName}</p>
          <p className="text-sm text-foreground-muted">{order.shippingAddress.street}</p>
          <p className="text-sm text-foreground-muted">
            {order.shippingAddress.postalCode} {order.shippingAddress.city}
          </p>
          {order.shippingAddress.phone && (
            <p className="text-sm text-foreground-muted mt-1">Tel: {order.shippingAddress.phone}</p>
          )}
        </div>
      )}

      {/* Shipping Form */}
      <div className="space-y-4">
        <div>
          <label className="text-sm text-foreground-muted mb-2 block">
            Transportista *
          </label>
          <select
            value={carrier}
            onChange={(e) => setCarrier(e.target.value)}
            className="w-full h-10 px-4 bg-surface-2 border border-border rounded-xl text-sm text-foreground"
          >
            <option value="">Selecciona transportista</option>
            {CARRIERS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <Input
          label="Número de seguimiento (opcional)"
          value={trackingNumber}
          onChange={(e) => setTrackingNumber(e.target.value)}
          placeholder="1Z999AA10123456784"
        />

        {error && (
          <p className="text-sm text-error">{error}</p>
        )}

        <Button
          className="w-full"
          onClick={handleShip}
          isLoading={isSubmitting}
          disabled={!carrier}
        >
          He enviado el paquete
        </Button>
      </div>
    </Card>
  );
}

// Buyer Panel: Verify code and accept
function BuyerVerificationPanel({
  order,
  onSuccess,
}: {
  order: OrderData;
  onSuccess: () => void;
}) {
  const [step, setStep] = useState<"intro" | "code" | "confirm">("intro");
  const [code, setCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  const [codeValid, setCodeValid] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleVerifyCode = async () => {
    if (!code.trim()) return;

    setIsVerifying(true);
    setError(null);

    try {
      const response = await fetch(`/api/db/orders/${order.id}/verify-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim() }),
      });

      const data = await response.json();

      if (data.success) {
        setCodeValid(data.valid);
        if (data.valid) {
          setStep("confirm");
        }
      } else {
        setError(data.error || "Error al verificar");
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleAccept = async () => {
    setIsAccepting(true);
    setError(null);

    try {
      const response = await fetch(`/api/db/orders/${order.id}/accept`, {
        method: "POST",
      });

      const data = await response.json();

      if (data.success) {
        onSuccess();
      } else {
        setError(data.error || "Error al aceptar");
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setIsAccepting(false);
    }
  };

  return (
    <Card padding="md" className="mb-6 bg-jade/5 border-jade/20">
      <div className="flex items-center gap-2 mb-4">
        <CheckCircle className="h-5 w-5 text-jade" />
        <h3 className="font-semibold text-jade">¡Tu pedido ha llegado!</h3>
      </div>

      {step === "intro" && (
        <div className="space-y-4">
          <div className="bg-surface-2 rounded-xl p-4 space-y-3">
            <div className="flex items-start gap-3">
              <Video className="h-5 w-5 text-jade flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Graba mientras abres</p>
                <p className="text-sm text-foreground-muted">
                  Recomendamos que grabes un video mientras abres el paquete. Esto te
                  protege si hay algún problema.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-jade flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Busca el código dentro</p>
                <p className="text-sm text-foreground-muted">
                  El vendedor ha incluido un papel con un código. Introdúcelo para
                  verificar que el paquete no ha sido manipulado.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="recording"
              className="rounded border-border"
            />
            <label htmlFor="recording" className="text-sm text-foreground-muted">
              Estoy grabando / He abierto el paquete
            </label>
          </div>

          <Button className="w-full" onClick={() => setStep("code")}>
            Introducir código
          </Button>
        </div>
      )}

      {step === "code" && (
        <div className="space-y-4">
          <p className="text-sm text-foreground-muted">
            Introduce el código que encontrarás en un papel dentro del paquete:
          </p>

          <Input
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              setCodeValid(null);
            }}
            placeholder="PP-XXXXXX"
            className="text-center font-mono text-lg tracking-widest"
          />

          {codeValid === false && (
            <div className="p-3 bg-error/10 rounded-xl">
              <p className="text-sm text-error flex items-center gap-2">
                <XCircle className="h-4 w-4" />
                Código incorrecto. Comprueba que lo has escrito bien.
              </p>
            </div>
          )}

          {error && <p className="text-sm text-error">{error}</p>}

          <div className="flex gap-3">
            <Button
              variant="ghost"
              className="flex-1"
              onClick={() => setStep("intro")}
            >
              Atrás
            </Button>
            <Button
              className="flex-1"
              onClick={handleVerifyCode}
              isLoading={isVerifying}
              disabled={!code.trim()}
            >
              Verificar código
            </Button>
          </div>

          <button
            onClick={() => setStep("confirm")}
            className="text-sm text-foreground-muted hover:text-foreground text-center w-full"
          >
            No encuentro el código →
          </button>
        </div>
      )}

      {step === "confirm" && (
        <div className="space-y-4">
          {codeValid && (
            <div className="p-3 bg-jade/10 rounded-xl">
              <p className="text-sm text-jade flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                ¡Código verificado! El paquete es auténtico.
              </p>
            </div>
          )}

          <p className="text-foreground-muted">
            ¿El producto está en buen estado y coincide con el anuncio?
          </p>

          {error && <p className="text-sm text-error">{error}</p>}

          <div className="flex gap-3">
            <Button
              variant="danger"
              className="flex-1"
              onClick={() => {/* Open dispute */}}
            >
              Hay un problema
            </Button>
            <Button
              className="flex-1"
              onClick={handleAccept}
              isLoading={isAccepting}
            >
              Todo correcto
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}

// Dispute Modal
function DisputeModal({
  orderId,
  onClose,
  onSuccess,
}: {
  orderId: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reason || !description) return;

    setIsSubmitting(true);
    // TODO: Implement dispute API
    console.log("Opening dispute:", { orderId, reason, description });
    setTimeout(() => {
      setIsSubmitting(false);
    onClose();
      onSuccess();
    }, 1000);
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
              <option value="WRONG_CODE">Código no coincide</option>
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
            isLoading={isSubmitting}
          >
            Abrir disputa
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

// Helper functions
function getStepTimestamp(order: OrderData, status: OrderStatus): string | null {
  switch (status) {
    case "CREATED":
      return order.createdAt;
    case "ESCROW_HOLD":
      return order.escrowAt || order.paidAt;
    case "SHIPPED":
      return order.shippedAt;
    case "DELIVERED":
      return order.deliveredAt;
    case "ACCEPTED":
      return order.acceptedAt;
    default:
      return null;
  }
}

function getTrackingUrl(carrierId: string, trackingNumber: string): string {
  const carrier = CARRIERS.find((c) => c.id === carrierId);
  if (carrier && carrier.trackingUrl) {
    return carrier.trackingUrl + trackingNumber;
  }
  return "#";
}
