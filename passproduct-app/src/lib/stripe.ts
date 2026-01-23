import Stripe from "stripe";
import { loadStripe, Stripe as StripeJS } from "@stripe/stripe-js";

// Server-side Stripe instance (lazy initialization)
let _stripe: Stripe | null = null;

export const getStripeServer = (): Stripe => {
  if (!_stripe) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error(
        "STRIPE_SECRET_KEY no está configurada. Añádela a tu archivo .env.local"
      );
    }
    _stripe = new Stripe(secretKey, {
      apiVersion: "2024-12-18.acacia",
      typescript: true,
    });
  }
  return _stripe;
};

// Alias para compatibilidad (pero con inicialización lazy)
export const stripe = new Proxy({} as Stripe, {
  get(_, prop) {
    return getStripeServer()[prop as keyof Stripe];
  },
});

// Client-side Stripe promise (singleton)
let stripePromise: Promise<StripeJS | null> | null = null;

export const getStripe = () => {
  if (!stripePromise) {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!publishableKey) {
      console.warn("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY no está configurada");
      return Promise.resolve(null);
    }
    stripePromise = loadStripe(publishableKey);
  }
  return stripePromise;
};

// Generate unique protection code for orders
export function generateProtectionCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // No confusing chars (0/O, 1/I/L)
  let code = "PP-";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Shipping carriers in Spain
export const CARRIERS = [
  { id: "seur", name: "SEUR", trackingUrl: "https://www.seur.com/livetracking/?segOnlineIdentificador=" },
  { id: "mrw", name: "MRW", trackingUrl: "https://www.mrw.es/seguimiento_envios/" },
  { id: "correos", name: "Correos", trackingUrl: "https://www.correos.es/es/es/herramientas/localizador/envios/" },
  { id: "gls", name: "GLS", trackingUrl: "https://www.gls-spain.es/es/seguimiento-envios/?match=" },
  { id: "ups", name: "UPS", trackingUrl: "https://www.ups.com/track?tracknum=" },
  { id: "dhl", name: "DHL", trackingUrl: "https://www.dhl.com/es-es/home/tracking.html?tracking-id=" },
  { id: "fedex", name: "FedEx", trackingUrl: "https://www.fedex.com/fedextrack/?tracknumbers=" },
  { id: "nacex", name: "Nacex", trackingUrl: "https://www.nacex.es/seguimientoEnvio/" },
  { id: "ctt", name: "CTT Express", trackingUrl: "https://www.ctt.pt/feapl_2/app/open/tracking.jspx?code=" },
  { id: "other", name: "Otro", trackingUrl: "" },
];

// Calculate fees
export function calculateOrderFees(price: number, shippingCost: number = 0, hasProtection: boolean = true) {
  const amount = price;
  const shippingAmount = shippingCost;
  const feeMarketplace = Math.round(amount * 0.05 * 100) / 100; // 5% marketplace fee
  const feeProtection = hasProtection ? Math.min(Math.round(amount * 0.02 * 100) / 100, 25) : 0; // 2% capped at €25
  const total = Math.round((amount + shippingAmount + feeProtection) * 100) / 100;
  const sellerPayout = Math.round((amount - feeMarketplace) * 100) / 100;

  return {
    amount,
    shippingAmount,
    feeMarketplace,
    feeProtection,
    total,
    sellerPayout,
  };
}
