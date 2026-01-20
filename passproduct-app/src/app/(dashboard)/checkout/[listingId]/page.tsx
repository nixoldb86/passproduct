"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Shield,
  Truck,
  MapPin,
  CreditCard,
  Lock,
  Check,
  AlertCircle,
  Loader2,
  Package,
  Info,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Button, Card, Input } from "@/components/ui";
import { formatPrice } from "@/lib/utils";
import { getStripe } from "@/lib/stripe";
import { Listing, CONDITION_LABELS, ProductCondition } from "@/types";

// Shipping address interface
interface ShippingAddress {
  fullName: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
  phone: string;
}

// Main page component
export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoaded: isUserLoaded } = useUser();
  const [listing, setListing] = useState<Listing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [fees, setFees] = useState<{
    amount: number;
    shippingAmount: number;
    feeProtection: number;
    total: number;
  } | null>(null);
  const [hasProtection, setHasProtection] = useState(true);
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    fullName: "",
    street: "",
    city: "",
    postalCode: "",
    country: "España",
    phone: "",
  });

  const listingId = params.listingId as string;

  // Fetch listing details
  useEffect(() => {
    const fetchListing = async () => {
      try {
        const response = await fetch(`/api/db/listings/${listingId}`);
        const data = await response.json();
        if (data.success && data.listing) {
          setListing(data.listing);
          // Pre-fill name from user
          if (user) {
            setShippingAddress((prev) => ({
              ...prev,
              fullName: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
              phone: user.primaryPhoneNumber?.phoneNumber || "",
            }));
          }
        } else {
          setError("Anuncio no encontrado");
        }
      } catch {
        setError("Error al cargar el anuncio");
      } finally {
        setIsLoading(false);
      }
    };

    if (listingId) {
      fetchListing();
    }
  }, [listingId, user]);

  // Create payment intent
  const createPaymentIntent = async () => {
    if (!listing) return;

    setError(null);
    try {
      const response = await fetch("/api/checkout/create-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId,
          shippingAddress: listing.shippingEnabled ? shippingAddress : null,
          hasProtection,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setClientSecret(data.clientSecret);
        setOrderId(data.orderId);
        setFees(data.fees);
      } else {
        setError(data.error || "Error al crear el checkout");
        if (data.orderId) {
          // Already has pending order
          router.push(`/orders/${data.orderId}`);
        }
      }
    } catch {
      setError("Error de conexión");
    }
  };

  if (isLoading || !isUserLoaded) {
    return (
      <div className="max-w-4xl mx-auto py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 bg-surface-2 rounded-lg" />
          <div className="grid md:grid-cols-2 gap-6">
            <div className="h-96 bg-surface-2 rounded-2xl" />
            <div className="h-96 bg-surface-2 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error && !listing) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20">
        <Package className="h-16 w-16 text-foreground-subtle mx-auto mb-4" />
        <h1 className="text-xl font-semibold text-foreground mb-2">{error}</h1>
        <Link href="/marketplace">
          <Button variant="secondary">Volver al marketplace</Button>
        </Link>
      </div>
    );
  }

  if (!listing) return null;

  // Check if user is trying to buy own product
  if (listing.seller?.clerkId === user?.id) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20">
        <AlertCircle className="h-16 w-16 text-amber-500 mx-auto mb-4" />
        <h1 className="text-xl font-semibold text-foreground mb-2">
          No puedes comprar tu propio producto
        </h1>
        <Link href={`/marketplace/${listingId}`}>
          <Button variant="secondary">Volver al anuncio</Button>
        </Link>
      </div>
    );
  }

  // Calculate display fees (before payment intent is created)
  const displayFees = fees || {
    amount: listing.price,
    shippingAmount: listing.shippingEnabled ? (listing.shippingCost || 0) : 0,
    feeProtection: hasProtection ? Math.min(listing.price * 0.02, 25) : 0,
    total:
      listing.price +
      (listing.shippingEnabled ? (listing.shippingCost || 0) : 0) +
      (hasProtection ? Math.min(listing.price * 0.02, 25) : 0),
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back button */}
      <Link
        href={`/marketplace/${listingId}`}
        className="inline-flex items-center gap-2 text-foreground-muted hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Volver al anuncio</span>
      </Link>

      <h1 className="text-2xl font-semibold text-foreground mb-6">Checkout</h1>

      <div className="grid md:grid-cols-5 gap-6">
        {/* Left column - Form (3 cols) */}
        <div className="md:col-span-3 space-y-6">
          {/* Product Summary */}
          <Card padding="md">
            <div className="flex gap-4">
              <div className="relative h-24 w-24 rounded-xl bg-surface-2 overflow-hidden flex-shrink-0">
                {listing.photos[0] ? (
                  <Image
                    src={listing.photos[0]}
                    alt={listing.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Package className="h-8 w-8 text-foreground-subtle" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold text-foreground line-clamp-2">
                  {listing.title}
                </h2>
                <p className="text-sm text-foreground-muted mt-1">
                  Estado: {CONDITION_LABELS[listing.product?.condition?.toUpperCase() as ProductCondition] || "Bueno"}
                </p>
                <p className="text-sm text-foreground-muted">
                  Vendido por {listing.seller?.firstName} {listing.seller?.lastName?.charAt(0)}.
                </p>
              </div>
              <div className="text-right">
                <p className="text-xl font-semibold text-foreground">
                  {formatPrice(listing.price)}
                </p>
              </div>
            </div>
          </Card>

          {/* Shipping Address (if shipping enabled) */}
          {listing.shippingEnabled && !clientSecret && (
            <Card padding="md">
              <h3 className="font-medium text-foreground mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-accent" />
                Dirección de envío
              </h3>
              <div className="grid gap-4">
                <Input
                  label="Nombre completo"
                  value={shippingAddress.fullName}
                  onChange={(e) =>
                    setShippingAddress((prev) => ({
                      ...prev,
                      fullName: e.target.value,
                    }))
                  }
                  placeholder="Juan García López"
                />
                <Input
                  label="Dirección"
                  value={shippingAddress.street}
                  onChange={(e) =>
                    setShippingAddress((prev) => ({
                      ...prev,
                      street: e.target.value,
                    }))
                  }
                  placeholder="Calle Mayor 123, 2ºB"
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Ciudad"
                    value={shippingAddress.city}
                    onChange={(e) =>
                      setShippingAddress((prev) => ({
                        ...prev,
                        city: e.target.value,
                      }))
                    }
                    placeholder="Madrid"
                  />
                  <Input
                    label="Código postal"
                    value={shippingAddress.postalCode}
                    onChange={(e) =>
                      setShippingAddress((prev) => ({
                        ...prev,
                        postalCode: e.target.value,
                      }))
                    }
                    placeholder="28001"
                  />
                </div>
                <Input
                  label="Teléfono"
                  value={shippingAddress.phone}
                  onChange={(e) =>
                    setShippingAddress((prev) => ({
                      ...prev,
                      phone: e.target.value,
                    }))
                  }
                  placeholder="+34 612 345 678"
                />
              </div>
            </Card>
          )}

          {/* Local pickup info */}
          {!listing.shippingEnabled && !clientSecret && (
            <Card padding="md" className="bg-info/10 border-info/20">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-info flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-info">Entrega en mano</p>
                  <p className="text-sm text-info/80 mt-1">
                    Este producto solo está disponible para recogida en{" "}
                    {listing.location || "la ubicación del vendedor"}. Coordinarás
                    con el vendedor después del pago.
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Protection toggle */}
          {!clientSecret && (
            <Card padding="md">
              <div className="flex items-start gap-4">
                <button
                  onClick={() => setHasProtection(!hasProtection)}
                  className={`w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                    hasProtection
                      ? "bg-jade border-jade"
                      : "border-foreground-subtle"
                  }`}
                >
                  {hasProtection && <Check className="h-4 w-4 text-white" />}
                </button>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-jade" />
                    <span className="font-medium text-foreground">
                      Protección al comprador
                    </span>
                    <span className="text-sm text-foreground-muted">
                      (+{formatPrice(Math.min(listing.price * 0.02, 25))})
                    </span>
                  </div>
                  <p className="text-sm text-foreground-muted mt-1">
                    Tu pago se retiene hasta que confirmes la recepción. Si hay
                    algún problema, abrimos una disputa y te devolvemos el dinero.
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Payment Section */}
          {clientSecret ? (
            <Card padding="md">
              <h3 className="font-medium text-foreground mb-4 flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-accent" />
                Método de pago
              </h3>
              <Elements
                stripe={getStripe()}
                options={{
                  clientSecret,
                  appearance: {
                    theme: "night",
                    variables: {
                      colorPrimary: "#D4AF37",
                      colorBackground: "#1F1F24",
                      colorText: "#FAFAFA",
                      colorTextSecondary: "#A1A1AA",
                      borderRadius: "12px",
                      fontFamily: "Inter, sans-serif",
                    },
                  },
                }}
              >
                <CheckoutForm
                  orderId={orderId!}
                  total={displayFees.total}
                  onSuccess={() => router.push(`/orders/${orderId}?success=true`)}
                />
              </Elements>
            </Card>
          ) : (
            <Button
              className="w-full"
              size="lg"
              onClick={createPaymentIntent}
              disabled={
                listing.shippingEnabled &&
                (!shippingAddress.fullName ||
                  !shippingAddress.street ||
                  !shippingAddress.city ||
                  !shippingAddress.postalCode)
              }
            >
              Continuar al pago
            </Button>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-error/10 border border-error/20">
              <p className="text-sm text-error flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {error}
              </p>
            </div>
          )}
        </div>

        {/* Right column - Summary (2 cols) */}
        <div className="md:col-span-2">
          <Card padding="md" className="sticky top-24">
            <h3 className="font-medium text-foreground mb-4">Resumen del pedido</h3>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-foreground-muted">Precio del producto</span>
                <span className="text-foreground">{formatPrice(displayFees.amount)}</span>
              </div>

              {listing.shippingEnabled && (
                <div className="flex justify-between">
                  <span className="text-foreground-muted flex items-center gap-1">
                    <Truck className="h-4 w-4" />
                    Envío
                  </span>
                  <span className="text-foreground">
                    {displayFees.shippingAmount > 0
                      ? formatPrice(displayFees.shippingAmount)
                      : "Gratis"}
                  </span>
                </div>
              )}

              {hasProtection && (
                <div className="flex justify-between">
                  <span className="text-foreground-muted flex items-center gap-1">
                    <Shield className="h-4 w-4" />
                    Protección
                  </span>
                  <span className="text-foreground">
                    {formatPrice(displayFees.feeProtection)}
                  </span>
                </div>
              )}

              <div className="pt-3 border-t border-border flex justify-between">
                <span className="font-medium text-foreground">Total</span>
                <span className="text-xl font-semibold text-accent">
                  {formatPrice(displayFees.total)}
                </span>
              </div>
            </div>

            {/* Security badges */}
            <div className="mt-6 pt-6 border-t border-border space-y-3">
              <div className="flex items-center gap-2 text-sm text-foreground-muted">
                <Lock className="h-4 w-4 text-jade" />
                <span>Pago seguro con Stripe</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-foreground-muted">
                <Shield className="h-4 w-4 text-jade" />
                <span>Dinero protegido hasta confirmar</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-foreground-muted">
                <Info className="h-4 w-4 text-info" />
                <span>3 días para reclamar si hay problemas</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Checkout form with Stripe Elements
function CheckoutForm({
  orderId,
  total,
  onSuccess,
}: {
  orderId: string;
  total: number;
  onSuccess: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    const { error: submitError, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/orders/${orderId}?success=true`,
      },
      redirect: "if_required",
    });

    if (submitError) {
      setError(submitError.message || "Error al procesar el pago");
      setIsProcessing(false);
      return;
    }

    if (paymentIntent && paymentIntent.status === "succeeded") {
      // Confirm payment in our backend
      try {
        const response = await fetch("/api/checkout/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId,
            paymentIntentId: paymentIntent.id,
          }),
        });

        const data = await response.json();

        if (data.success) {
          onSuccess();
        } else {
          setError(data.error || "Error al confirmar el pago");
        }
      } catch {
        setError("Error de conexión");
      }
    }

    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement
        options={{
          layout: "tabs",
        }}
      />

      {error && (
        <div className="p-3 rounded-lg bg-error/10 border border-error/20">
          <p className="text-sm text-error">{error}</p>
        </div>
      )}

      <Button
        type="submit"
        className="w-full"
        size="lg"
        disabled={!stripe || isProcessing}
        isLoading={isProcessing}
      >
        {isProcessing ? (
          "Procesando..."
        ) : (
          <>
            <Lock className="h-4 w-4 mr-2" />
            Pagar {formatPrice(total)}
          </>
        )}
      </Button>

      <p className="text-xs text-center text-foreground-subtle">
        Al pagar, aceptas los términos de servicio y la política de privacidad
      </p>
    </form>
  );
}
