import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format price with currency
export function formatPrice(
  amount: number | string,
  currency: string = "EUR",
  locale: string = "es-ES"
): string {
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(numAmount);
}

// Format date
export function formatDate(
  date: Date | string,
  options?: Intl.DateTimeFormatOptions
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...options,
  }).format(d);
}

// Calculate marketplace fee (6-8%)
export function calculateMarketplaceFee(price: number): number {
  const feeRate = 0.05; // 5%
  return Math.round(price * feeRate * 100) / 100;
}

// Calculate protection fee (1-2.5% with cap)
export function calculateProtectionFee(price: number): number {
  const feeRate = 0.02; // 2%
  const maxFee = 25; // €25 cap
  const fee = price * feeRate;
  return Math.round(Math.min(fee, maxFee) * 100) / 100;
}

// Hash identifier (for IMEI/serial)
export async function hashIdentifier(identifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(identifier);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Get last 4 characters
export function getLast4(str: string): string {
  return str.slice(-4);
}

// Calculate price recommendations
export function getPriceRecommendations(estimatedValue: number) {
  return {
    fast: Math.round(estimatedValue * 0.85), // -15% for quick sale
    fair: Math.round(estimatedValue * 0.95), // -5% balanced
    max: Math.round(estimatedValue * 1.05), // +5% premium
  };
}

// Calculate depreciation percentage
export function calculateDepreciation(
  purchasePrice: number,
  currentValue: number
): number {
  if (purchasePrice <= 0) return 0;
  const depreciation = ((purchasePrice - currentValue) / purchasePrice) * 100;
  return Math.round(depreciation);
}

// Check if warranty is valid
export function isWarrantyValid(warrantyEndDate: Date | string | null): boolean {
  if (!warrantyEndDate) return false;
  const endDate = typeof warrantyEndDate === "string" ? new Date(warrantyEndDate) : warrantyEndDate;
  return endDate > new Date();
}

// Get days until warranty expires
export function getDaysUntilWarrantyExpires(warrantyEndDate: Date | string | null): number | null {
  if (!warrantyEndDate) return null;
  const endDate = typeof warrantyEndDate === "string" ? new Date(warrantyEndDate) : warrantyEndDate;
  const now = new Date();
  const diffTime = endDate.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Truncate text
export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

// Generate random ID
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

// Delay utility for animations
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
