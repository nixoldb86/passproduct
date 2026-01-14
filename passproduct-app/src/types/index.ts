// ==========================================
// ENUMS
// ==========================================

export type ProductCondition = "NEW" | "LIKE_NEW" | "VERY_GOOD" | "GOOD" | "ACCEPTABLE";

export type ListingStatus = "DRAFT" | "PUBLISHED" | "RESERVED" | "SOLD" | "CANCELLED";

export type VerificationLevel = "LEVEL_0" | "LEVEL_1" | "LEVEL_2";

export type OrderStatus =
  | "CREATED"
  | "PAID"
  | "ESCROW_HOLD"
  | "SHIPPED"
  | "HANDED_OVER"
  | "DELIVERED"
  | "ACCEPTED"
  | "RELEASED"
  | "DISPUTED"
  | "REFUNDED";

export type DisputeReason = "NOT_RECEIVED" | "NOT_AS_DESCRIBED" | "NOT_WORKING";

export type DisputeStatus = "OPENED" | "UNDER_REVIEW" | "RESOLVED";

export type DisputeOutcome = "RELEASE" | "REFUND" | "RETURN";

// ==========================================
// CORE TYPES
// ==========================================

export interface User {
  id: string;
  clerkId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  country: string;
  language: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SellerProfile {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string;
  location: string;
  // Estadísticas
  totalSales: number;
  totalProducts: number;
  rating: number; // 0-5
  reviewCount: number;
  responseTime: string; // ej: "< 1 hora", "< 24 horas"
  responseRate: number; // 0-100%
  // Verificaciones
  isVerified: boolean;
  isIdentityVerified: boolean;
  hasPhoneVerified: boolean;
  // Fechas
  memberSince: Date;
  lastActive: Date;
  // Bio
  bio?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  parentId?: string;
  children?: Category[];
  attributeSchema?: Record<string, unknown>;
  minPhotos: number;
  requiresTicket: boolean;
  requiresSerial: boolean;
}

export interface WarrantyContact {
  phone?: string;
  email?: string;
  url?: string;
  hours?: string;
  notes?: string;
}

export interface ResaleValue {
  percentage: number;
  minPrice: number;
  maxPrice: number;
  marketTrend: "stable" | "rising" | "falling";
  notes?: string;
}

export interface Product {
  id: string;
  userId: string;
  categoryId: string;
  category?: Category;
  brand: string;
  model: string;
  variant?: string;
  condition: ProductCondition;
  purchaseDate?: Date;
  purchasePrice?: number;
  purchaseStore?: string;
  proofOfPurchaseUrl?: string;
  warrantyEndDate?: Date;
  warrantyNotes?: string;
  warrantyContact?: WarrantyContact;
  // Seguro adicional
  hasAdditionalInsurance?: boolean;
  additionalInsuranceEndDate?: Date;
  additionalInsuranceProvider?: string;
  additionalInsuranceNotes?: string;
  imeiHash?: string;
  imeiLast4?: string;
  serialHash?: string;
  serialLast4?: string;
  photos: string[];
  // Imágenes de stock (solo visualización, NO válidas para venta)
  stockPhotos?: string[];
  accessories?: Record<string, boolean>;
  attributes?: Record<string, unknown>;
  estimatedValue?: number;
  estimatedValueUpdatedAt?: Date;
  resaleValue?: ResaleValue;
  manualUrl?: string;
  specs?: Array<{ label: string; value: string }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Listing {
  id: string;
  productId?: string;
  product?: Product;
  sellerId: string;
  seller?: SellerProfile;
  categoryId: string;
  category?: Category;
  title: string;
  description: string;
  price: number;
  location?: string;
  latitude?: number;
  longitude?: number;
  shippingEnabled: boolean;
  shippingCost?: number;
  verificationLevel: VerificationLevel;
  hasVerifiedPurchase: boolean;
  hasValidWarranty: boolean;
  hasVerifiedAccessories: boolean;
  hasVerifiedIdentifier: boolean;
  status: ListingStatus;
  photos: string[];
  isBoosted: boolean;
  boostedUntil?: Date;
  viewCount: number;
  favoriteCount: number;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  soldAt?: Date;
}

export interface Conversation {
  id: string;
  listingId: string;
  listing?: Listing;
  buyerId: string;
  buyer?: User;
  sellerId: string;
  seller?: User;
  currentOffer?: number;
  offerStatus?: "pending" | "accepted" | "rejected";
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  sender?: User;
  text: string;
  isOffer: boolean;
  offerAmount?: number;
  isSystemMessage: boolean;
  readAt?: Date;
  createdAt: Date;
}

export interface Order {
  id: string;
  listingId: string;
  listing?: Listing;
  buyerId: string;
  buyer?: User;
  sellerId: string;
  seller?: User;
  amount: number;
  shippingAmount: number;
  feeMarketplace: number;
  feeProtection: number;
  total: number;
  sellerPayout: number;
  status: OrderStatus;
  trackingNumber?: string;
  carrier?: string;
  isLocalPickup: boolean;
  paidAt?: Date;
  shippedAt?: Date;
  deliveredAt?: Date;
  acceptedAt?: Date;
  releasedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Dispute {
  id: string;
  orderId: string;
  order?: Order;
  openedById: string;
  openedBy?: User;
  reason: DisputeReason;
  description: string;
  evidenceUrls: string[];
  status: DisputeStatus;
  outcome?: DisputeOutcome;
  adminNotes?: string;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Alert {
  id: string;
  userId: string;
  productId?: string;
  type: "price_drop" | "sell_now" | "warranty_expiring";
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
}

// ==========================================
// UI TYPES
// ==========================================

export interface PriceRecommendation {
  fast: number;
  fair: number;
  max: number;
}

export interface FilterOptions {
  categoryId?: string;
  categoryGroupId?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: ProductCondition[];
  location?: string;
  shippingEnabled?: boolean;
  hasVerifiedPurchase?: boolean;
  hasWarranty?: boolean;
  sortBy?: "price_asc" | "price_desc" | "date_desc" | "date_asc";
}

export const CONDITION_LABELS: Record<ProductCondition, string> = {
  NEW: "Nuevo",
  LIKE_NEW: "Como nuevo",
  VERY_GOOD: "Muy bueno",
  GOOD: "Bueno",
  ACCEPTABLE: "Aceptable",
};

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  CREATED: "Creado",
  PAID: "Pagado",
  ESCROW_HOLD: "Pago retenido",
  SHIPPED: "Enviado",
  HANDED_OVER: "Entregado",
  DELIVERED: "Recibido",
  ACCEPTED: "Aceptado",
  RELEASED: "Pago liberado",
  DISPUTED: "En disputa",
  REFUNDED: "Reembolsado",
};

export const DISPUTE_REASON_LABELS: Record<DisputeReason, string> = {
  NOT_RECEIVED: "No ha llegado",
  NOT_AS_DESCRIBED: "No coincide con el anuncio",
  NOT_WORKING: "No funciona",
};
