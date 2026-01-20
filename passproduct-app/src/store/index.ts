import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Product, Listing, Conversation, Order, Alert, FilterOptions, Notification, Follow, SellerProfile } from "@/types";
import {
  mockConversations,
  mockOrders,
  mockAlerts,
  mockSellers,
  mockListings,
} from "@/lib/mock-data";

// ==========================================
// WALLET STORE (conectado a PostgreSQL)
// ==========================================

interface WalletState {
  products: Product[];
  isLoading: boolean;
  selectedProduct: Product | null;
  error: string | null;
  
  // Actions
  setProducts: (products: Product[]) => void;
  addProduct: (productData: Partial<Product>) => Promise<Product | null>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<boolean>;
  deleteProduct: (id: string) => Promise<boolean>;
  selectProduct: (product: Product | null) => void;
  fetchProducts: () => Promise<void>;
  clearError: () => void;
}

// Transformar producto de la API al formato del frontend
const transformProductFromAPI = (apiProduct: Record<string, unknown>): Product => {
  const attributes = apiProduct.attributes as Record<string, unknown> | null;
  return {
    id: apiProduct.id as string,
    userId: apiProduct.userId as string,
    categoryId: apiProduct.categoryId as string,
    category: apiProduct.category as Product["category"],
    brand: apiProduct.brand as string,
    model: apiProduct.model as string,
    variant: apiProduct.variant as string | undefined,
    condition: (apiProduct.condition as string)?.toUpperCase() as Product["condition"],
    purchaseDate: apiProduct.purchaseDate ? new Date(apiProduct.purchaseDate as string) : undefined,
    purchasePrice: apiProduct.purchasePrice ? Number(apiProduct.purchasePrice) : undefined,
    purchaseStore: apiProduct.purchaseStore as string | undefined,
    proofOfPurchaseUrl: apiProduct.proofOfPurchaseUrl as string | undefined,
    warrantyEndDate: apiProduct.warrantyEndDate ? new Date(apiProduct.warrantyEndDate as string) : undefined,
    warrantyNotes: attributes?.warrantyNotes as string | undefined,
    imeiLast4: apiProduct.imeiLast4 as string | undefined,
    serialLast4: apiProduct.serialLast4 as string | undefined,
    photos: apiProduct.photos as string[] || [],
    stockPhotos: attributes?.stockPhotos as string[] || [],
    accessories: apiProduct.accessories as Record<string, boolean> | undefined,
    estimatedValue: apiProduct.estimatedValue ? Number(apiProduct.estimatedValue) : undefined,
    manualUrl: attributes?.manualUrl as string | undefined,
    specs: attributes?.specs as Array<{ label: string; value: string }> | undefined,
    createdAt: new Date(apiProduct.createdAt as string),
    updatedAt: new Date(apiProduct.updatedAt as string),
  };
};

export const useWalletStore = create<WalletState>((set, get) => ({
  products: [],
  isLoading: false,
  selectedProduct: null,
  error: null,

  setProducts: (products) => set({ products }),
  
  clearError: () => set({ error: null }),
  
  // Cargar productos del usuario desde la BD
  fetchProducts: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch("/api/db/products");
      
      // Si no está autenticado, devolver lista vacía sin error
      if (response.status === 401 || response.redirected) {
        set({ products: [], isLoading: false });
        return;
      }
      
      // Verificar que la respuesta sea JSON
      const contentType = response.headers.get("content-type");
      if (!contentType?.includes("application/json")) {
        // Si no es JSON, probablemente es una página de login
        set({ products: [], isLoading: false });
        return;
      }
      
      const data = await response.json();
      
      if (data.success && data.products) {
        const products = data.products.map(transformProductFromAPI);
        set({ products, isLoading: false });
      } else {
        set({ products: [], isLoading: false, error: data.error });
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      set({ products: [], isLoading: false, error: "Error de conexión" });
    }
  },
  
  // Crear nuevo producto en la BD
  addProduct: async (productData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch("/api/db/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryId: productData.categoryId,
          brand: productData.brand,
          model: productData.model,
          variant: productData.variant,
          condition: productData.condition?.toUpperCase() || "GOOD",
          purchaseDate: productData.purchaseDate,
          purchasePrice: productData.purchasePrice,
          purchaseStore: productData.purchaseStore,
          warrantyEndDate: productData.warrantyEndDate,
          photos: productData.photos || [],
          stockPhotos: productData.stockPhotos || [],
          accessories: productData.accessories,
          imeiLast4: productData.imeiLast4,
          serialLast4: productData.serialLast4,
          warrantyNotes: productData.warrantyNotes,
          manualUrl: productData.manualUrl,
          specs: productData.specs,
          estimatedValue: productData.estimatedValue,
        }),
      });
      
      // Verificar autenticación
      if (response.status === 401 || response.redirected) {
        set({ isLoading: false, error: "Debes iniciar sesión para añadir productos" });
        return null;
      }
      
      // Verificar que sea JSON
      const contentType = response.headers.get("content-type");
      if (!contentType?.includes("application/json")) {
        set({ isLoading: false, error: "Error de servidor. Intenta de nuevo." });
        return null;
      }
      
      const data = await response.json();
      
      if (data.success && data.product) {
        const newProduct = transformProductFromAPI(data.product);
        set((state) => ({
          products: [newProduct, ...state.products],
          isLoading: false,
        }));
        return newProduct;
      } else {
        console.error("Error creating product:", data.error);
        set({ isLoading: false, error: data.error || "Error al crear producto" });
        return null;
      }
    } catch (error) {
      console.error("Error creating product:", error);
      set({ isLoading: false, error: "Error de conexión" });
      return null;
    }
  },
  
  // Actualizar producto en la BD
  updateProduct: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`/api/db/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...updates,
          condition: updates.condition?.toUpperCase(),
        }),
      });
      
      // Verificar autenticación
      if (response.status === 401 || response.redirected) {
        set({ isLoading: false, error: "Sesión expirada. Inicia sesión de nuevo." });
        return false;
      }
      
      const contentType = response.headers.get("content-type");
      if (!contentType?.includes("application/json")) {
        set({ isLoading: false, error: "Error de servidor" });
        return false;
      }
      
      const data = await response.json();
      
      if (data.success && data.product) {
        const updatedProduct = transformProductFromAPI(data.product);
        set((state) => ({
          products: state.products.map((p) =>
            p.id === id ? updatedProduct : p
          ),
          isLoading: false,
        }));
        return true;
      } else {
        set({ isLoading: false, error: data.error || "Error al actualizar" });
        return false;
      }
    } catch (error) {
      console.error("Error updating product:", error);
      set({ isLoading: false, error: "Error de conexión" });
      return false;
    }
  },
  
  // Eliminar producto de la BD
  deleteProduct: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`/api/db/products/${id}`, {
        method: "DELETE",
      });
      
      // Verificar autenticación
      if (response.status === 401 || response.redirected) {
        set({ isLoading: false, error: "Sesión expirada. Inicia sesión de nuevo." });
        return false;
      }
      
      const contentType = response.headers.get("content-type");
      if (!contentType?.includes("application/json")) {
        set({ isLoading: false, error: "Error de servidor" });
        return false;
      }
      
      const data = await response.json();
      
      if (data.success) {
        set((state) => ({
          products: state.products.filter((p) => p.id !== id),
          isLoading: false,
        }));
        return true;
      } else {
        set({ isLoading: false, error: data.error || "Error al eliminar" });
        return false;
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      set({ isLoading: false, error: "Error de conexión" });
      return false;
    }
  },
  
  selectProduct: (product) => set({ selectedProduct: product }),
}));

// ==========================================
// MARKETPLACE STORE
// ==========================================

interface CreateListingData {
  productId: string;
  title: string;
  description: string;
  price: number;
  location: string;
  shippingEnabled: boolean;
  shippingCost?: number;
  photos: string[];
}

interface MarketplaceState {
  listings: Listing[];
  isLoading: boolean;
  selectedListing: Listing | null;
  filters: FilterOptions;
  
  // Actions
  setListings: (listings: Listing[]) => void;
  selectListing: (listing: Listing | null) => void;
  setFilters: (filters: FilterOptions) => void;
  fetchListings: (filters?: FilterOptions) => Promise<void>;
  createListing: (data: CreateListingData) => Promise<Listing>;
}

export const useMarketplaceStore = create<MarketplaceState>((set, get) => ({
  listings: [],
  isLoading: false,
  selectedListing: null,
  filters: {},

  setListings: (listings) => set({ listings }),
  
  selectListing: (listing) => set({ selectedListing: listing }),
  
  setFilters: (filters) => set({ filters }),
  
  fetchListings: async (filters) => {
    set({ isLoading: true });
    
    try {
      // Construir query params
      const params = new URLSearchParams();
      if (filters?.categoryId) params.set("category", filters.categoryId);
      if (filters?.minPrice) params.set("minPrice", filters.minPrice.toString());
      if (filters?.maxPrice) params.set("maxPrice", filters.maxPrice.toString());
      if (filters?.hasWarranty) params.set("hasWarranty", "true");
      if (filters?.search) params.set("search", filters.search);
      if (filters?.sortBy) {
        const sortMap: Record<string, string> = {
          "date_desc": "recent",
          "date_asc": "oldest",
          "price_asc": "price_asc",
          "price_desc": "price_desc",
        };
        params.set("sortBy", sortMap[filters.sortBy] || "recent");
      }
      
      const response = await fetch(`/api/db/listings?${params.toString()}`);
      const data = await response.json();
      
      if (data.success && data.listings) {
        // Aplicar filtros adicionales del lado del cliente si es necesario
        let filtered = data.listings;
        
        if (filters?.hasVerifiedPurchase) {
          filtered = filtered.filter((l: Listing) => l.hasVerifiedPurchase);
        }
        if (filters?.shippingEnabled !== undefined) {
          filtered = filtered.filter((l: Listing) => l.shippingEnabled === filters.shippingEnabled);
        }
        
        set({ listings: filtered, isLoading: false, filters: filters || {} });
      } else {
        // Fallback a datos mock si falla la API
        console.warn("API error, usando datos mock:", data.error);
        let filtered = [...mockListings];
        
        if (filters?.categoryId) {
          filtered = filtered.filter((l) => l.categoryId === filters.categoryId);
        }
        if (filters?.minPrice) {
          filtered = filtered.filter((l) => l.price >= filters.minPrice!);
        }
        if (filters?.maxPrice) {
          filtered = filtered.filter((l) => l.price <= filters.maxPrice!);
        }
        
        set({ listings: filtered, isLoading: false, filters: filters || {} });
      }
    } catch (error) {
      console.error("Error fetching listings from API:", error);
      // Fallback a datos mock
      set({ listings: mockListings, isLoading: false, filters: filters || {} });
    }
  },
  
  createListing: async (listingData) => {
    set({ isLoading: true });
    
    try {
      const response = await fetch("/api/db/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: listingData.productId,
          title: listingData.title,
          description: listingData.description,
          price: listingData.price,
          location: listingData.location,
          shippingEnabled: listingData.shippingEnabled,
          shippingCost: listingData.shippingCost,
          photos: listingData.photos,
        }),
      });
      
      if (response.status === 401) {
        set({ isLoading: false });
        throw new Error("Debes iniciar sesión para vender");
      }
      
      const data = await response.json();
      
      if (data.success && data.listing) {
        // Refrescar listings para incluir el nuevo
        await get().fetchListings();
        
        // Notificar a seguidores del nuevo listing
        // En una implementación real, esto se haría en el backend
        if (data.listing.seller) {
          notifyFollowersOfNewListing(
            data.listing.sellerId,
            data.listing,
            data.listing.seller
          );
        }
        
        return data.listing;
      } else {
        throw new Error(data.error || "Error al crear el anuncio");
      }
    } catch (error) {
      console.error("Error creating listing:", error);
      set({ isLoading: false });
      throw error;
    }
  },
}));

// ==========================================
// CHAT STORE
// ==========================================

interface ChatState {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  isLoading: boolean;
  
  // Actions
  setConversations: (conversations: Conversation[]) => void;
  setActiveConversation: (conversation: Conversation | null) => void;
  fetchConversations: () => Promise<void>;
  fetchConversation: (id: string) => Promise<void>;
  startConversation: (listingId: string, initialMessage?: string) => Promise<Conversation | null>;
  sendMessage: (conversationId: string, text: string, isOffer?: boolean, offerAmount?: number) => Promise<void>;
  makeOffer: (conversationId: string, amount: number) => Promise<void>;
  respondToOffer: (conversationId: string, accept: boolean) => Promise<void>;
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  activeConversation: null,
  isLoading: false,

  setConversations: (conversations) => set({ conversations }),
  
  setActiveConversation: (conversation) => set({ activeConversation: conversation }),
  
  fetchConversations: async () => {
    set({ isLoading: true });
    try {
      const response = await fetch("/api/db/conversations");
      
      if (response.status === 401) {
        set({ conversations: [], isLoading: false });
        return;
      }
      
      const data = await response.json();
      
      if (data.success) {
        set({ conversations: data.conversations || [], isLoading: false });
      } else {
        console.warn("Error fetching conversations:", data.error);
        set({ conversations: mockConversations, isLoading: false });
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
      set({ conversations: mockConversations, isLoading: false });
    }
  },
  
  fetchConversation: async (id) => {
    set({ isLoading: true });
    try {
      const response = await fetch(`/api/db/conversations/${id}`);
      const data = await response.json();
      
      if (data.success && data.conversation) {
        set({ activeConversation: data.conversation, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error("Error fetching conversation:", error);
      set({ isLoading: false });
    }
  },
  
  startConversation: async (listingId, initialMessage) => {
    try {
      const response = await fetch("/api/db/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId, initialMessage }),
      });
      
      if (response.status === 401) {
        throw new Error("Debes iniciar sesión para contactar");
      }
      
      const data = await response.json();
      
      if (data.success && data.conversation) {
        // Añadir a la lista si no existe
        set((state) => ({
          conversations: state.conversations.some(c => c.id === data.conversation.id)
            ? state.conversations
            : [data.conversation, ...state.conversations],
          activeConversation: data.conversation,
        }));
        return data.conversation;
      }
      
      throw new Error(data.error || "Error al iniciar conversación");
    } catch (error) {
      console.error("Error starting conversation:", error);
      throw error;
    }
  },
  
  sendMessage: async (conversationId, text, isOffer = false, offerAmount) => {
    try {
      const response = await fetch(`/api/db/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, isOffer, offerAmount }),
      });
      
      const data = await response.json();
      
      if (data.success && data.message) {
        // Actualizar estado local
        set((state) => ({
          conversations: state.conversations.map((conv) =>
            conv.id === conversationId
              ? { 
                  ...conv, 
                  lastMessage: data.message,
                  updatedAt: new Date(),
                  ...(isOffer && { currentOffer: offerAmount, offerStatus: "pending" }),
                }
              : conv
          ),
          activeConversation:
            state.activeConversation?.id === conversationId
              ? {
                  ...state.activeConversation,
                  messages: [...(state.activeConversation.messages || []), data.message],
                }
              : state.activeConversation,
        }));
      }
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  },
  
  makeOffer: async (conversationId, amount) => {
    await get().sendMessage(conversationId, `Te ofrezco ${amount}€`, true, amount);
  },
  
  respondToOffer: async (conversationId, accept) => {
    const status = accept ? "accepted" : "rejected";
    const text = accept ? "Oferta aceptada ✓" : "Oferta rechazada";
    
    set((state) => ({
      conversations: state.conversations.map((conv) =>
        conv.id === conversationId
          ? { ...conv, offerStatus: status }
          : conv
      ),
    }));
    
    // Add system message
    const systemMessage = {
      id: `msg-${Date.now()}`,
      conversationId,
      senderId: "system",
      text,
      isOffer: false,
      isSystemMessage: true,
      createdAt: new Date(),
    };
    
    set((state) => ({
      conversations: state.conversations.map((conv) =>
        conv.id === conversationId
          ? { ...conv, messages: [...conv.messages, systemMessage] }
          : conv
      ),
    }));
  },
}));

// ==========================================
// ORDER STORE
// ==========================================

interface OrderState {
  orders: Order[];
  activeOrder: Order | null;
  isLoading: boolean;
  
  // Actions
  setOrders: (orders: Order[]) => void;
  setActiveOrder: (order: Order | null) => void;
  fetchOrders: () => Promise<void>;
  createOrder: (listingId: string, sellerId: string) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: Order["status"]) => Promise<void>;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],
  activeOrder: null,
  isLoading: false,

  setOrders: (orders) => set({ orders }),
  
  setActiveOrder: (order) => set({ activeOrder: order }),
  
  fetchOrders: async () => {
    set({ isLoading: true });
    await new Promise((resolve) => setTimeout(resolve, 300));
    set({ orders: mockOrders, isLoading: false });
  },
  
  createOrder: async (listingId, sellerId) => {
    const listing = mockListings.find((l) => l.id === listingId);
    if (!listing) throw new Error("Listing not found");
    
    const amount = listing.price;
    const shippingAmount = listing.shippingCost || 0;
    const feeMarketplace = amount * 0.05; // 5%
    const feeProtection = Math.min(amount * 0.02, 25); // 2% with €25 cap
    const total = amount + shippingAmount + feeProtection;
    const sellerPayout = amount - feeMarketplace;
    
    const newOrder: Order = {
      id: `order-${Date.now()}`,
      listingId,
      buyerId: "user-1",
      sellerId,
      amount,
      shippingAmount,
      feeMarketplace,
      feeProtection,
      total,
      sellerPayout,
      status: "CREATED",
      isLocalPickup: !listing.shippingEnabled,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    set((state) => ({
      orders: [...state.orders, newOrder],
      activeOrder: newOrder,
    }));
    
    return newOrder;
  },
  
  updateOrderStatus: async (orderId, status) => {
    const now = new Date();
    const updates: Partial<Order> = { status, updatedAt: now };
    
    switch (status) {
      case "PAID":
        updates.paidAt = now;
        break;
      case "SHIPPED":
        updates.shippedAt = now;
        break;
      case "DELIVERED":
        updates.deliveredAt = now;
        break;
      case "ACCEPTED":
        updates.acceptedAt = now;
        break;
      case "RELEASED":
        updates.releasedAt = now;
        break;
    }
    
    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === orderId ? { ...o, ...updates } : o
      ),
      activeOrder:
        state.activeOrder?.id === orderId
          ? { ...state.activeOrder, ...updates }
          : state.activeOrder,
    }));
  },
}));

// ==========================================
// ALERT STORE
// ==========================================

interface AlertState {
  alerts: Alert[];
  unreadCount: number;
  
  // Actions
  setAlerts: (alerts: Alert[]) => void;
  markAsRead: (alertId: string) => void;
  markAllAsRead: () => void;
  fetchAlerts: () => Promise<void>;
}

export const useAlertStore = create<AlertState>((set, get) => ({
  alerts: [],
  unreadCount: 0,

  setAlerts: (alerts) =>
    set({
      alerts,
      unreadCount: alerts.filter((a) => !a.isRead).length,
    }),
  
  markAsRead: (alertId) =>
    set((state) => {
      const alerts = state.alerts.map((a) =>
        a.id === alertId ? { ...a, isRead: true } : a
      );
      return {
        alerts,
        unreadCount: alerts.filter((a) => !a.isRead).length,
      };
    }),
  
  markAllAsRead: () =>
    set((state) => ({
      alerts: state.alerts.map((a) => ({ ...a, isRead: true })),
      unreadCount: 0,
    })),
  
  fetchAlerts: async () => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    set({
      alerts: mockAlerts,
      unreadCount: mockAlerts.filter((a) => !a.isRead).length,
    });
  },
}));

// ==========================================
// UI STORE
// ==========================================

interface UIState {
  isSidebarOpen: boolean;
  isAddProductModalOpen: boolean;
  isCreateListingModalOpen: boolean;
  activeTab: "wallet" | "marketplace" | "orders" | "chat";
  
  // Actions
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setAddProductModalOpen: (open: boolean) => void;
  setCreateListingModalOpen: (open: boolean) => void;
  setActiveTab: (tab: UIState["activeTab"]) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isSidebarOpen: true,
  isAddProductModalOpen: false,
  isCreateListingModalOpen: false,
  activeTab: "wallet",

  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarOpen: (open) => set({ isSidebarOpen: open }),
  setAddProductModalOpen: (open) => set({ isAddProductModalOpen: open }),
  setCreateListingModalOpen: (open) => set({ isCreateListingModalOpen: open }),
  setActiveTab: (tab) => set({ activeTab: tab }),
}));

// ==========================================
// NOTIFICATION STORE
// ==========================================

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  
  // Actions
  fetchNotifications: () => Promise<void>;
  addNotification: (notification: Omit<Notification, "id" | "createdAt" | "isRead">) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (notificationId: string) => void;
  clearAll: () => void;
}

// Datos mock de notificaciones
const mockNotifications: Notification[] = [
  {
    id: "notif-1",
    userId: "user-1",
    type: "new_listing",
    title: "Carlos G. ha publicado un nuevo producto",
    message: "iPhone 15 Pro 256GB Titanio - 899€",
    fromUserId: "seller-1",
    fromUser: mockSellers[0],
    listingId: "listing-1",
    imageUrl: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=100&q=80",
    actionUrl: "/marketplace/listing-1",
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 min ago
  },
  {
    id: "notif-2",
    userId: "user-1",
    type: "new_follower",
    title: "María L. ha empezado a seguirte",
    message: "Ahora recibirás notificaciones cuando publiques",
    fromUserId: "seller-2",
    fromUser: mockSellers[1],
    imageUrl: mockSellers[1]?.avatarUrl,
    actionUrl: "/marketplace?seller=seller-2",
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
  },
  {
    id: "notif-3",
    userId: "user-1",
    type: "price_drop",
    title: "Bajada de precio",
    message: "MacBook Air M2 que sigues ha bajado a 899€",
    listingId: "listing-2",
    imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=100&q=80",
    actionUrl: "/marketplace/listing-2",
    isRead: true,
    readAt: new Date(Date.now() - 1000 * 60 * 60),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
  },
  {
    id: "notif-4",
    userId: "user-1",
    type: "order_update",
    title: "Tu pedido ha sido enviado",
    message: "El vendedor ha enviado tu iPhone. Tracking: ES123456789",
    orderId: "order-1",
    actionUrl: "/orders/order-1",
    isRead: true,
    readAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
  },
];

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  fetchNotifications: async () => {
    set({ isLoading: true });
    // Simular carga desde API
    await new Promise((resolve) => setTimeout(resolve, 300));
    const notifications = mockNotifications;
    set({
      notifications,
      unreadCount: notifications.filter((n) => !n.isRead).length,
      isLoading: false,
    });
  },

  addNotification: (notificationData) => {
    const newNotification: Notification = {
      ...notificationData,
      id: `notif-${Date.now()}`,
      isRead: false,
      createdAt: new Date(),
    };
    
    set((state) => ({
      notifications: [newNotification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
  },

  markAsRead: (notificationId) =>
    set((state) => {
      const notifications = state.notifications.map((n) =>
        n.id === notificationId ? { ...n, isRead: true, readAt: new Date() } : n
      );
      return {
        notifications,
        unreadCount: notifications.filter((n) => !n.isRead).length,
      };
    }),

  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({
        ...n,
        isRead: true,
        readAt: n.readAt || new Date(),
      })),
      unreadCount: 0,
    })),

  deleteNotification: (notificationId) =>
    set((state) => {
      const notification = state.notifications.find((n) => n.id === notificationId);
      const wasUnread = notification && !notification.isRead;
      return {
        notifications: state.notifications.filter((n) => n.id !== notificationId),
        unreadCount: wasUnread ? state.unreadCount - 1 : state.unreadCount,
      };
    }),

  clearAll: () => set({ notifications: [], unreadCount: 0 }),
}));

// ==========================================
// FOLLOW STORE
// ==========================================

interface FollowState {
  following: Follow[];      // Usuarios que yo sigo
  followers: Follow[];      // Usuarios que me siguen
  isLoading: boolean;
  
  // Actions
  fetchFollowing: () => Promise<void>;
  fetchFollowers: () => Promise<void>;
  followUser: (userId: string) => Promise<void>;
  unfollowUser: (userId: string) => Promise<void>;
  isFollowing: (userId: string) => boolean;
  getFollowersCount: (userId: string) => number;
  getFollowingCount: (userId: string) => number;
}

// Datos mock de follows
const mockFollows: Follow[] = [
  {
    id: "follow-1",
    followerId: "user-1",      // Yo sigo a...
    followingId: "seller-1",   // Carlos G.
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
  },
  {
    id: "follow-2",
    followerId: "user-1",
    followingId: "seller-3",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
  },
  {
    id: "follow-3",
    followerId: "seller-2",    // María me sigue
    followingId: "user-1",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
  },
];

export const useFollowStore = create(
  persist<FollowState>(
    (set, get) => ({
      following: [],
      followers: [],
      isLoading: false,

      fetchFollowing: async () => {
        set({ isLoading: true });
        await new Promise((resolve) => setTimeout(resolve, 200));
        // Filtrar los que yo sigo (followerId = mi usuario)
        const following = mockFollows.filter((f) => f.followerId === "user-1");
        set({ following, isLoading: false });
      },

      fetchFollowers: async () => {
        set({ isLoading: true });
        await new Promise((resolve) => setTimeout(resolve, 200));
        // Filtrar los que me siguen (followingId = mi usuario)
        const followers = mockFollows.filter((f) => f.followingId === "user-1");
        set({ followers, isLoading: false });
      },

      followUser: async (userId) => {
        const { following, isFollowing } = get();
        
        // No seguir si ya lo sigo
        if (isFollowing(userId)) return;
        
        const newFollow: Follow = {
          id: `follow-${Date.now()}`,
          followerId: "user-1",
          followingId: userId,
          createdAt: new Date(),
        };
        
        set({ following: [...following, newFollow] });
        
        // Notificar al usuario seguido
        const seller = mockSellers.find((s) => s.id === userId);
        if (seller) {
          useNotificationStore.getState().addNotification({
            userId: userId, // El usuario seguido recibe la notificación
            type: "new_follower",
            title: "Nuevo seguidor",
            message: "Un usuario ha empezado a seguirte",
            fromUserId: "user-1",
            imageUrl: "https://randomuser.me/api/portraits/men/1.jpg",
            actionUrl: `/marketplace?seller=user-1`,
          });
        }
      },

      unfollowUser: async (userId) => {
        set((state) => ({
          following: state.following.filter((f) => f.followingId !== userId),
        }));
      },

      isFollowing: (userId) => {
        return get().following.some((f) => f.followingId === userId);
      },

      getFollowersCount: (userId) => {
        // En una implementación real, esto vendría de la API
        return mockFollows.filter((f) => f.followingId === userId).length;
      },

      getFollowingCount: (userId) => {
        return mockFollows.filter((f) => f.followerId === userId).length;
      },
    }),
    {
      name: "follow-storage",
      partialize: (state) => ({ following: state.following }),
    }
  )
);

// ==========================================
// HELPER: Notificar nueva publicación a seguidores
// ==========================================

export const notifyFollowersOfNewListing = (
  sellerId: string,
  listing: Partial<Listing>,
  sellerProfile: SellerProfile
) => {
  // Obtener seguidores del vendedor
  const followers = mockFollows.filter((f) => f.followingId === sellerId);
  
  // Crear notificación para cada seguidor
  followers.forEach((follow) => {
    useNotificationStore.getState().addNotification({
      userId: follow.followerId,
      type: "new_listing",
      title: `${sellerProfile.firstName} ${sellerProfile.lastName} ha publicado`,
      message: `${listing.title} - ${listing.price}€`,
      fromUserId: sellerId,
      fromUser: sellerProfile,
      listingId: listing.id,
      imageUrl: listing.photos?.[0],
      actionUrl: `/marketplace/${listing.id}`,
    });
  });
};
