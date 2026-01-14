import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Product, Listing, Conversation, Order, Alert, FilterOptions } from "@/types";
import {
  mockProducts,
  mockListings,
  mockConversations,
  mockOrders,
  mockAlerts,
} from "@/lib/mock-data";

// ==========================================
// WALLET STORE (con persistencia)
// ==========================================

interface WalletState {
  products: Product[];
  isLoading: boolean;
  selectedProduct: Product | null;
  
  // Actions
  setProducts: (products: Product[]) => void;
  addProduct: (product: Product) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  selectProduct: (product: Product | null) => void;
  fetchProducts: () => Promise<void>;
}

// Función para limpiar fotos base64 antes de guardar en localStorage
const sanitizeProductForStorage = (product: Product): Product => {
  return {
    ...product,
    // No guardar fotos base64 en localStorage (son muy grandes)
    // Solo guardar URLs (empiezan con http)
    photos: (product.photos || []).filter(p => p.startsWith("http")),
    stockPhotos: (product.stockPhotos || []).filter(p => p.startsWith("http")),
    // No guardar proofOfPurchaseUrl si es base64
    proofOfPurchaseUrl: product.proofOfPurchaseUrl?.startsWith("http") 
      ? product.proofOfPurchaseUrl 
      : undefined,
  };
};

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      products: mockProducts, // Inicializar con los productos mock
      isLoading: false,
      selectedProduct: null,

      setProducts: (products) => set({ products }),
      
      addProduct: (product) =>
        set((state) => ({ products: [product, ...state.products] })), // Añadir al principio
      
      updateProduct: (id, updates) =>
        set((state) => ({
          products: state.products.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        })),
      
      deleteProduct: (id) =>
        set((state) => ({
          products: state.products.filter((p) => p.id !== id),
        })),
      
      selectProduct: (product) => set({ selectedProduct: product }),
      
      fetchProducts: async () => {
        // Solo cargar si no hay productos (primera vez)
        if (get().products.length > 0) {
          return;
        }
        set({ isLoading: true });
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 500));
        set({ products: mockProducts, isLoading: false });
      },
    }),
    {
      name: "passproduct-wallet", // Nombre en localStorage
      // Sanitizar productos antes de guardar para evitar QuotaExceededError
      partialize: (state) => ({ 
        products: state.products.map(sanitizeProductForStorage)
      }),
      // Manejar errores de storage
      onRehydrateStorage: () => (state) => {
        // Si hay error al cargar, usar productos mock
        if (!state) {
          console.warn("Error al cargar datos del localStorage, usando datos por defecto");
        }
      },
    }
  )
);

// ==========================================
// MARKETPLACE STORE
// ==========================================

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
  createListing: (listing: Listing) => Promise<void>;
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
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    
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
    if (filters?.hasVerifiedPurchase) {
      filtered = filtered.filter((l) => l.hasVerifiedPurchase);
    }
    if (filters?.shippingEnabled !== undefined) {
      filtered = filtered.filter((l) => l.shippingEnabled === filters.shippingEnabled);
    }
    
    // Sort
    if (filters?.sortBy) {
      switch (filters.sortBy) {
        case "price_asc":
          filtered.sort((a, b) => a.price - b.price);
          break;
        case "price_desc":
          filtered.sort((a, b) => b.price - a.price);
          break;
        case "date_desc":
          filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          break;
        case "date_asc":
          filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
          break;
      }
    }
    
    set({ listings: filtered, isLoading: false, filters: filters || {} });
  },
  
  createListing: async (listing) => {
    set({ isLoading: true });
    await new Promise((resolve) => setTimeout(resolve, 500));
    set((state) => ({
      listings: [listing, ...state.listings],
      isLoading: false,
    }));
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
    await new Promise((resolve) => setTimeout(resolve, 300));
    set({ conversations: mockConversations, isLoading: false });
  },
  
  sendMessage: async (conversationId, text, isOffer = false, offerAmount) => {
    const newMessage = {
      id: `msg-${Date.now()}`,
      conversationId,
      senderId: "user-1", // Current user
      text,
      isOffer,
      offerAmount,
      isSystemMessage: false,
      createdAt: new Date(),
    };
    
    set((state) => ({
      conversations: state.conversations.map((conv) =>
        conv.id === conversationId
          ? { ...conv, messages: [...conv.messages, newMessage], updatedAt: new Date() }
          : conv
      ),
      activeConversation:
        state.activeConversation?.id === conversationId
          ? {
              ...state.activeConversation,
              messages: [...state.activeConversation.messages, newMessage],
            }
          : state.activeConversation,
    }));
  },
  
  makeOffer: async (conversationId, amount) => {
    await get().sendMessage(conversationId, `Te ofrezco ${amount}€`, true, amount);
    set((state) => ({
      conversations: state.conversations.map((conv) =>
        conv.id === conversationId
          ? { ...conv, currentOffer: amount, offerStatus: "pending" }
          : conv
      ),
    }));
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
    const feeMarketplace = amount * 0.07; // 7%
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
