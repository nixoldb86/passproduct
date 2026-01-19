// ==========================================
// TRADUCCIONES - ES, EN, FR, IT, PT
// ==========================================

export type Locale = "es" | "en" | "fr" | "it" | "pt";

export const locales: Locale[] = ["es", "en", "fr", "it", "pt"];

export const localeNames: Record<Locale, string> = {
  es: "Español",
  en: "English",
  fr: "Français",
  it: "Italiano",
  pt: "Português",
};

// Emoji flags (backup)
export const localeEmojis: Record<Locale, string> = {
  es: "🇪🇸",
  en: "🇬🇧",
  fr: "🇫🇷",
  it: "🇮🇹",
  pt: "🇵🇹",
};

// Short codes
export const localeCodes: Record<Locale, string> = {
  es: "ES",
  en: "EN",
  fr: "FR",
  it: "IT",
  pt: "PT",
};

// Colors inspired by flags (for dots/circles)
export const localeColors: Record<Locale, string> = {
  es: "#c60b1e", // Spanish red
  en: "#012169", // UK blue
  fr: "#0055a4", // French blue
  it: "#009246", // Italian green
  pt: "#006600", // Portuguese green
};

export type TranslationKeys = {
  // Common
  common: {
    search: string;
    save: string;
    cancel: string;
    confirm: string;
    delete: string;
    edit: string;
    back: string;
    next: string;
    loading: string;
    error: string;
    success: string;
    free: string;
    verified: string;
    warranty: string;
    freeShipping: string;
    contact: string;
    featured: string;
    idVerified: string;
    sales: string;
  };
  // Navigation
  nav: {
    whyItWorks: string;
    pricing: string;
    marketplace: string;
    myWallet: string;
    signIn: string;
    signUp: string;
    createAccount: string;
    addProduct: string;
  };
  // Landing page
  landing: {
    heroTitle: string;
    heroTitleHighlight: string;
    heroSubtitle: string;
    getStarted: string;
    freeProducts: string;
    noCard: string;
    seconds: string;
    problemTitle: string;
    problemText: string;
    discoverWhy: string;
    howItWorks: string;
    noComplications: string;
    // Features
    features: {
      invoice: { title: string; description: string };
      alerts: { title: string; description: string };
      value: { title: string; description: string };
      allInOne: { title: string; description: string };
      sellers: { title: string; description: string };
      protection: { title: string; description: string };
    };
    // Wallet section
    wallet: {
      title: string;
      subtitle: string;
      items: string[];
      free: string;
    };
    // Marketplace section
    marketplaceSection: {
      title: string;
      subtitle: string;
      items: string[];
      fee: string;
    };
    // Numbers
    numbers: {
      title: string;
      publish: string;
      onlySell: string;
      protected: string;
    };
    // CTA
    cta: {
      title: string;
      text1: string;
      text2: string;
      createFree: string;
      explore: string;
      reallySeconds: string;
    };
    badge: string;
  };
  // Dashboard header
  header: {
    searchPlaceholder: string;
    notifications: string;
  };
  // Wallet
  wallet: {
    title: string;
    subtitle: string;
    empty: string;
    emptyAction: string;
    addFirst: string;
    products: string;
    totalValue: string;
    condition: {
      NEW: string;
      LIKE_NEW: string;
      VERY_GOOD: string;
      GOOD: string;
      ACCEPTABLE: string;
    };
    warrantyValid: string;
    warrantyExpiring: string;
    warrantyExpired: string;
    sellProduct: string;
    viewDetails: string;
    purchaseDate: string;
    purchasePrice: string;
    purchaseStore: string;
    warrantyUntil: string;
    accessories: string;
    accessoriesIncluded: string;
    stockPhoto: string;
    stockPhotoWarning: string;
    referenceImage: string;
  };
  // Marketplace
  marketplace: {
    title: string;
    filters: string;
    allCategories: string;
    priceRange: string;
    minPrice: string;
    maxPrice: string;
    verifiedPurchase: string;
    withWarranty: string;
    withShipping: string;
    sortBy: string;
    sortOptions: {
      recent: string;
      oldest: string;
      priceLow: string;
      priceHigh: string;
    };
    views: {
      grid: string;
      list: string;
      map: string;
    };
    noResults: string;
    results: string;
    contactSeller: string;
    makeOffer: string;
    buy: string;
  };
  // Add product modal
  addProduct: {
    title: string;
    step1: string;
    step1Desc: string;
    attachFile: string;
    takePhoto: string;
    dragDrop: string;
    supportedFormats: string;
    analyzing: string;
    multipleProducts: string;
    selectProduct: string;
    step2: string;
    step2Desc: string;
    brand: string;
    model: string;
    variant: string;
    category: string;
    step3: string;
    step3Desc: string;
    estimatedValue: string;
    detectingAccessories: string;
    addAccessory: string;
    toggleAccessoryHelp: string;
    saveProduct: string;
    loadingInfo: string;
  };
  // Sell page
  sell: {
    title: string;
    subtitle: string;
    selectProduct: string;
    price: string;
    pricePlaceholder: string;
    priceRecommendation: string;
    fast: string;
    fair: string;
    max: string;
    description: string;
    descriptionPlaceholder: string;
    shipping: string;
    shippingEnabled: string;
    shippingCost: string;
    location: string;
    locationPlaceholder: string;
    publish: string;
    minPhotos: string;
    minPhotosWarning: string;
  };
  // Orders
  orders: {
    title: string;
    empty: string;
    status: {
      CREATED: string;
      PAID: string;
      ESCROW_HOLD: string;
      SHIPPED: string;
      HANDED_OVER: string;
      DELIVERED: string;
      ACCEPTED: string;
      RELEASED: string;
      DISPUTED: string;
      REFUNDED: string;
    };
    buyer: string;
    seller: string;
    total: string;
    tracking: string;
    confirmDelivery: string;
    acceptProduct: string;
    openDispute: string;
  };
  // Why it works page
  whyItWorks: {
    title: string;
    subtitle: string;
    // Add more specific keys as needed
  };
  // Pricing page
  pricingPage: {
    title: string;
    subtitle: string;
    free: string;
    pro: string;
    perMonth: string;
    popular: string;
    getStarted: string;
    // Add more specific keys as needed
  };
  // Verification
  verification: {
    title: string;
    subtitle: string;
    requiredTitle: string;
    requiredSubtitle: string;
    verifyButton: string;
    whyNeeded: string;
    reasons: string[];
    alreadyVerified: string;
    alreadyVerifiedDesc: string;
    stepIntro: string;
    stepDocument: string;
    stepSelfie: string;
    stepResult: string;
    whatYouNeed: string;
    documentId: string;
    documentIdDesc: string;
    camera: string;
    cameraDesc: string;
    goodLighting: string;
    goodLightingDesc: string;
    privacyTitle: string;
    privacyDesc: string;
    startVerification: string;
    photoDocument: string;
    photoDocumentDesc: string;
    useCamera: string;
    uploadPhoto: string;
    centerDocument: string;
    readingDocument: string;
    extractedData: string;
    confidence: string;
    retake: string;
    facialVerification: string;
    facialDesc: string;
    activateCamera: string;
    noFaceDetected: string;
    moveCloser: string;
    moveAway: string;
    centerFace: string;
    perfect: string;
    startVerificationBtn: string;
    blink2Times: string;
    blinksDetected: string;
    verifyingIdentity: string;
    verificationComplete: string;
    verificationPartial: string;
    verificationFailed: string;
    identityVerified: string;
    someStepsFailed: string;
    couldNotVerify: string;
    checks: string;
    completed: string;
    checkDocumentReadable: string;
    checkDataExtracted: string;
    checkNotExpired: string;
    checkLiveness: string;
    checkFaceMatch: string;
    verifiedInfo: string;
    tryAgain: string;
    continueAnyway: string;
    securityNote: string;
  };
  // Settings
  settings: {
    title: string;
    privacyTitle: string;
    showLastSeenLabel: string;
    showLastSeenDescription: string;
    showReadReceiptsLabel: string;
    showReadReceiptsDescription: string;
  };
};

const es: TranslationKeys = {
  common: {
    search: "Buscar",
    save: "Guardar",
    cancel: "Cancelar",
    confirm: "Confirmar",
    delete: "Eliminar",
    edit: "Editar",
    back: "Atrás",
    next: "Siguiente",
    loading: "Cargando...",
    error: "Error",
    success: "Éxito",
    free: "Gratis",
    verified: "Verificado",
    warranty: "Garantía",
    freeShipping: "Envío gratis",
    contact: "Contactar",
    featured: "Destacado",
    idVerified: "ID verificado",
    sales: "ventas",
  },
  nav: {
    whyItWorks: "¿Por qué funciona?",
    pricing: "Precios",
    marketplace: "Marketplace",
    myWallet: "Mi wallet",
    signIn: "Iniciar sesión",
    signUp: "Registrarse",
    createAccount: "Crear cuenta",
    addProduct: "Añadir producto",
  },
  landing: {
    heroTitle: "La segunda mano",
    heroTitleHighlight: "sin sustos",
    heroSubtitle: "Solo productos con factura. Solo vendedores verificados. Solo tranquilidad.",
    getStarted: "Empezar gratis",
    freeProducts: "5 productos gratis",
    noCard: "Sin tarjeta",
    seconds: "30 segundos",
    problemTitle: "El mercado de segunda mano está roto.",
    problemText: "No porque no haya demanda. Está roto porque nadie se fía de nadie. Y tienen razón. Sin factura, no hay forma de saber si ese producto es legítimo.",
    discoverWhy: "Descubre por qué funciona",
    howItWorks: "Así funciona",
    noComplications: "Sin complicaciones. Sin letra pequeña.",
    features: {
      invoice: {
        title: "Factura = confianza",
        description: "Sin factura, no entras. Así de simple. Así de seguro.",
      },
      alerts: {
        title: "Te avisamos antes de que sea tarde",
        description: "Garantía a punto de expirar. Precio cayendo. Lo sabrás.",
      },
      value: {
        title: "Sabes lo que vale. Hoy.",
        description: "No lo que pagaste. Lo que puedes pedir ahora mismo.",
      },
      allInOne: {
        title: "Todo en un sitio",
        description: "Factura, garantía, fotos, accesorios. Deja de buscar en cajones.",
      },
      sellers: {
        title: "Vendedores con cara",
        description: "Verificados. Con historial. Sin cuentas falsas.",
      },
      protection: {
        title: "Tu dinero, protegido",
        description: "Pago retenido hasta que confirmes. Si algo falla, te devolvemos.",
      },
    },
    wallet: {
      title: "Tu Wallet",
      subtitle: "Tus productos, documentados",
      items: [
        "Guarda facturas y garantías",
        "Sabes cuánto vale cada cosa (hoy)",
        "Te avisamos cuando es mejor vender",
        "Un clic para publicar en marketplace",
      ],
      free: "5 productos gratis. Para siempre.",
    },
    marketplaceSection: {
      title: "Marketplace",
      subtitle: "Solo productos con factura",
      items: [
        "Todo verificado. Todo legítimo.",
        "Vendedores con cara y DNI",
        "Pago protegido hasta que confirmes",
        "Si algo falla, te devolvemos",
      ],
      fee: "Solo 5% cuando vendes. Sin costes ocultos.",
    },
    numbers: {
      title: "Los números",
      publish: "Publicar",
      onlySell: "Solo si vendes",
      protected: "Protegido",
    },
    cta: {
      title: "¿Probamos?",
      text1: "Puedes seguir en Vinted o Wallapop rezando para que no te estafen.",
      text2: "O puedes probar algo diferente.",
      createFree: "Crear cuenta gratis",
      explore: "Explorar marketplace",
      reallySeconds: "30 segundos. En serio.",
    },
    badge: "Sin factura, no entras",
  },
  header: {
    searchPlaceholder: "Buscar en marketplace...",
    notifications: "Notificaciones",
  },
  wallet: {
    title: "Mi Wallet",
    subtitle: "Tus productos documentados y listos para vender",
    empty: "Tu wallet está vacío",
    emptyAction: "Añade tu primer producto para empezar",
    addFirst: "Añadir primer producto",
    products: "productos",
    totalValue: "Valor total estimado",
    condition: {
      NEW: "Nuevo",
      LIKE_NEW: "Como nuevo",
      VERY_GOOD: "Muy bueno",
      GOOD: "Bueno",
      ACCEPTABLE: "Aceptable",
    },
    warrantyValid: "Garantía válida",
    warrantyExpiring: "Próxima a expirar",
    warrantyExpired: "Expirada",
    sellProduct: "Vender",
    viewDetails: "Ver detalles",
    purchaseDate: "Fecha de compra",
    purchasePrice: "Precio de compra",
    purchaseStore: "Tienda",
    warrantyUntil: "Garantía hasta",
    accessories: "Accesorios",
    accessoriesIncluded: "Accesorios incluidos",
    stockPhoto: "Foto de referencia",
    stockPhotoWarning: "Para vender necesitas fotos reales del producto",
    referenceImage: "Referencia",
  },
  marketplace: {
    title: "Marketplace",
    filters: "Filtros",
    allCategories: "Todas las categorías",
    priceRange: "Rango de precio",
    minPrice: "Mín",
    maxPrice: "Máx",
    verifiedPurchase: "Compra verificada",
    withWarranty: "Con garantía",
    withShipping: "Con envío",
    sortBy: "Ordenar por",
    sortOptions: {
      recent: "Más recientes",
      oldest: "Más antiguos",
      priceLow: "Precio: menor a mayor",
      priceHigh: "Precio: mayor a menor",
    },
    views: {
      grid: "Cuadrícula",
      list: "Lista",
      map: "Mapa",
    },
    noResults: "No se encontraron resultados",
    results: "resultados",
    contactSeller: "Contactar vendedor",
    makeOffer: "Hacer oferta",
    buy: "Comprar",
  },
  addProduct: {
    title: "Añadir producto",
    step1: "Sube tu factura",
    step1Desc: "Sube tu factura o ticket de compra",
    attachFile: "Adjuntar archivo",
    takePhoto: "Hacer foto",
    dragDrop: "o arrastra y suelta aquí",
    supportedFormats: "PDF, JPG, PNG hasta 10MB",
    analyzing: "Analizando factura...",
    multipleProducts: "Hemos detectado varios productos",
    selectProduct: "Selecciona el producto que quieres añadir",
    step2: "Información del producto",
    step2Desc: "Verifica los datos extraídos",
    brand: "Marca",
    model: "Modelo",
    variant: "Variante",
    category: "Categoría",
    step3: "Detalles adicionales",
    step3Desc: "Completa la información",
    estimatedValue: "Valor estimado",
    detectingAccessories: "Detectando accesorios...",
    addAccessory: "Añadir accesorio...",
    toggleAccessoryHelp: "Haz clic en un accesorio para marcarlo como incluido/no incluido. Pulsa la X para eliminarlo.",
    saveProduct: "Guardar producto",
    loadingInfo: "Cargando info...",
  },
  sell: {
    title: "Vender producto",
    subtitle: "Publica tu producto en el marketplace",
    selectProduct: "Selecciona un producto",
    price: "Precio",
    pricePlaceholder: "0.00",
    priceRecommendation: "Precio recomendado",
    fast: "Venta rápida",
    fair: "Precio justo",
    max: "Máximo",
    description: "Descripción",
    descriptionPlaceholder: "Describe el estado del producto, accesorios incluidos...",
    shipping: "Envío",
    shippingEnabled: "Ofrecer envío",
    shippingCost: "Coste de envío",
    location: "Ubicación",
    locationPlaceholder: "Ciudad o código postal",
    publish: "Publicar anuncio",
    minPhotos: "Mínimo 2 fotos reales",
    minPhotosWarning: "Necesitas al menos 2 fotos reales del producto para publicar",
  },
  orders: {
    title: "Mis pedidos",
    empty: "No tienes pedidos aún",
    status: {
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
    },
    buyer: "Comprador",
    seller: "Vendedor",
    total: "Total",
    tracking: "Seguimiento",
    confirmDelivery: "Confirmar entrega",
    acceptProduct: "Aceptar producto",
    openDispute: "Abrir disputa",
  },
  whyItWorks: {
    title: "¿Por qué funciona?",
    subtitle: "Todo lo que necesitas saber",
  },
  pricingPage: {
    title: "Precios simples y transparentes",
    subtitle: "Sin costes ocultos. Sin sorpresas.",
    free: "Gratis",
    pro: "Pro",
    perMonth: "/mes",
    popular: "Popular",
    getStarted: "Empezar",
  },
  verification: {
    title: "Verificación de identidad",
    subtitle: "Para vender en PassProduct necesitamos verificar tu identidad",
    requiredTitle: "Verificación requerida",
    requiredSubtitle: "Para vender en PassProduct necesitas verificar tu identidad primero. Es un proceso rápido y seguro.",
    verifyButton: "Verificar mi identidad",
    whyNeeded: "¿Por qué necesito verificarme?",
    reasons: [
      "Protege a compradores y vendedores de fraudes",
      "Aumenta la confianza en tus anuncios",
      "Solo necesitas hacerlo una vez",
    ],
    alreadyVerified: "Ya estás verificado",
    alreadyVerifiedDesc: "Tu identidad ya ha sido verificada anteriormente.",
    stepIntro: "Introducción",
    stepDocument: "Documento",
    stepSelfie: "Selfie",
    stepResult: "Resultado",
    whatYouNeed: "¿Qué necesitarás?",
    documentId: "Documento de identidad",
    documentIdDesc: "DNI, NIE o Pasaporte válido y no caducado",
    camera: "Cámara del dispositivo",
    cameraDesc: "Para tomar foto del documento y un selfie",
    goodLighting: "Buena iluminación",
    goodLightingDesc: "Asegúrate de estar en un lugar bien iluminado",
    privacyTitle: "Tu privacidad es importante",
    privacyDesc: "Solo almacenamos un hash de tu número de documento para prevenir duplicados. Tu información personal no se comparte con terceros.",
    startVerification: "Comenzar verificación",
    photoDocument: "Foto de tu documento de identidad",
    photoDocumentDesc: "DNI, NIE o Pasaporte español/europeo",
    useCamera: "Usar cámara",
    uploadPhoto: "Subir foto",
    centerDocument: "Centra tu documento dentro del recuadro",
    readingDocument: "Leyendo documento...",
    extractedData: "Datos extraídos",
    confidence: "Confianza",
    retake: "Volver a capturar",
    facialVerification: "Verificación facial",
    facialDesc: "Tomaremos un selfie para compararlo con tu documento",
    activateCamera: "Activar cámara",
    noFaceDetected: "No se detecta cara",
    moveCloser: "Acércate más",
    moveAway: "Aléjate un poco",
    centerFace: "Centra tu cara",
    perfect: "¡Perfecto!",
    startVerificationBtn: "Comenzar verificación",
    blink2Times: "Parpadea 2 veces",
    blinksDetected: "Parpadeos detectados",
    verifyingIdentity: "Verificando identidad...",
    verificationComplete: "¡Verificación completada!",
    verificationPartial: "Verificación parcial",
    verificationFailed: "Verificación fallida",
    identityVerified: "Tu identidad ha sido verificada correctamente",
    someStepsFailed: "Algunos pasos no se completaron correctamente",
    couldNotVerify: "No se pudo verificar tu identidad",
    checks: "Comprobaciones",
    completed: "completadas",
    checkDocumentReadable: "Documento de identidad legible",
    checkDataExtracted: "Datos del documento extraídos",
    checkNotExpired: "Documento no caducado",
    checkLiveness: "Verificación de presencia (parpadeo)",
    checkFaceMatch: "Coincidencia facial",
    verifiedInfo: "Información verificada",
    tryAgain: "Intentar de nuevo",
    continueAnyway: "Continuar de todas formas",
    securityNote: "Tu información se procesa de forma segura y no se almacena en texto plano. Solo guardamos un hash de tu número de documento para prevenir duplicados.",
  },
  settings: {
    title: "Ajustes",
    privacyTitle: "Privacidad",
    showLastSeenLabel: "Mostrar última conexión",
    showLastSeenDescription: "Permite a otros usuarios ver cuándo estuviste conectado por última vez.",
    showReadReceiptsLabel: "Confirmaciones de lectura",
    showReadReceiptsDescription: "Muestra a otros usuarios cuando has leído sus mensajes.",
  },
};

const en: TranslationKeys = {
  common: {
    search: "Search",
    save: "Save",
    cancel: "Cancel",
    confirm: "Confirm",
    delete: "Delete",
    edit: "Edit",
    back: "Back",
    next: "Next",
    loading: "Loading...",
    error: "Error",
    success: "Success",
    free: "Free",
    verified: "Verified",
    warranty: "Warranty",
    freeShipping: "Free shipping",
    contact: "Contact",
    featured: "Featured",
    idVerified: "ID verified",
    sales: "sales",
  },
  nav: {
    whyItWorks: "Why it works",
    pricing: "Pricing",
    marketplace: "Marketplace",
    myWallet: "My wallet",
    signIn: "Sign in",
    signUp: "Sign up",
    createAccount: "Create account",
    addProduct: "Add product",
  },
  landing: {
    heroTitle: "Second-hand",
    heroTitleHighlight: "without surprises",
    heroSubtitle: "Only products with invoice. Only verified sellers. Only peace of mind.",
    getStarted: "Get started free",
    freeProducts: "5 free products",
    noCard: "No card required",
    seconds: "30 seconds",
    problemTitle: "The second-hand market is broken.",
    problemText: "Not because there's no demand. It's broken because nobody trusts anyone. And they're right. Without an invoice, there's no way to know if a product is legitimate.",
    discoverWhy: "Discover why it works",
    howItWorks: "How it works",
    noComplications: "No complications. No fine print.",
    features: {
      invoice: {
        title: "Invoice = trust",
        description: "No invoice, no entry. Simple as that. Safe as that.",
      },
      alerts: {
        title: "We alert you before it's too late",
        description: "Warranty about to expire. Price dropping. You'll know.",
      },
      value: {
        title: "You know what it's worth. Today.",
        description: "Not what you paid. What you can ask for right now.",
      },
      allInOne: {
        title: "Everything in one place",
        description: "Invoice, warranty, photos, accessories. Stop searching through drawers.",
      },
      sellers: {
        title: "Sellers with a face",
        description: "Verified. With history. No fake accounts.",
      },
      protection: {
        title: "Your money, protected",
        description: "Payment held until you confirm. If something fails, we refund you.",
      },
    },
    wallet: {
      title: "Your Wallet",
      subtitle: "Your products, documented",
      items: [
        "Store invoices and warranties",
        "Know what everything is worth (today)",
        "We alert you when it's best to sell",
        "One click to publish on marketplace",
      ],
      free: "5 free products. Forever.",
    },
    marketplaceSection: {
      title: "Marketplace",
      subtitle: "Only products with invoice",
      items: [
        "Everything verified. Everything legitimate.",
        "Sellers with face and ID",
        "Payment protected until you confirm",
        "If something fails, we refund you",
      ],
      fee: "Only 5% when you sell. No hidden costs.",
    },
    numbers: {
      title: "The numbers",
      publish: "Publish",
      onlySell: "Only if you sell",
      protected: "Protected",
    },
    cta: {
      title: "Shall we try?",
      text1: "You can keep using Vinted or eBay hoping you don't get scammed.",
      text2: "Or you can try something different.",
      createFree: "Create free account",
      explore: "Explore marketplace",
      reallySeconds: "30 seconds. Really.",
    },
    badge: "No invoice, no entry",
  },
  header: {
    searchPlaceholder: "Search marketplace...",
    notifications: "Notifications",
  },
  wallet: {
    title: "My Wallet",
    subtitle: "Your documented products ready to sell",
    empty: "Your wallet is empty",
    emptyAction: "Add your first product to get started",
    addFirst: "Add first product",
    products: "products",
    totalValue: "Total estimated value",
    condition: {
      NEW: "New",
      LIKE_NEW: "Like new",
      VERY_GOOD: "Very good",
      GOOD: "Good",
      ACCEPTABLE: "Acceptable",
    },
    warrantyValid: "Warranty valid",
    warrantyExpiring: "Expiring soon",
    warrantyExpired: "Expired",
    sellProduct: "Sell",
    viewDetails: "View details",
    purchaseDate: "Purchase date",
    purchasePrice: "Purchase price",
    purchaseStore: "Store",
    warrantyUntil: "Warranty until",
    accessories: "Accessories",
    accessoriesIncluded: "Accessories included",
    stockPhoto: "Reference photo",
    stockPhotoWarning: "You need real photos to sell this product",
    referenceImage: "Reference",
  },
  marketplace: {
    title: "Marketplace",
    filters: "Filters",
    allCategories: "All categories",
    priceRange: "Price range",
    minPrice: "Min",
    maxPrice: "Max",
    verifiedPurchase: "Verified purchase",
    withWarranty: "With warranty",
    withShipping: "With shipping",
    sortBy: "Sort by",
    sortOptions: {
      recent: "Most recent",
      oldest: "Oldest",
      priceLow: "Price: low to high",
      priceHigh: "Price: high to low",
    },
    views: {
      grid: "Grid",
      list: "List",
      map: "Map",
    },
    noResults: "No results found",
    results: "results",
    contactSeller: "Contact seller",
    makeOffer: "Make offer",
    buy: "Buy",
  },
  addProduct: {
    title: "Add product",
    step1: "Upload your invoice",
    step1Desc: "Upload your invoice or receipt",
    attachFile: "Attach file",
    takePhoto: "Take photo",
    dragDrop: "or drag and drop here",
    supportedFormats: "PDF, JPG, PNG up to 10MB",
    analyzing: "Analyzing invoice...",
    multipleProducts: "We detected multiple products",
    selectProduct: "Select the product you want to add",
    step2: "Product information",
    step2Desc: "Verify the extracted data",
    brand: "Brand",
    model: "Model",
    variant: "Variant",
    category: "Category",
    step3: "Additional details",
    step3Desc: "Complete the information",
    estimatedValue: "Estimated value",
    detectingAccessories: "Detecting accessories...",
    addAccessory: "Add accessory...",
    toggleAccessoryHelp: "Click an accessory to mark as included/not included. Press X to remove.",
    saveProduct: "Save product",
    loadingInfo: "Loading info...",
  },
  sell: {
    title: "Sell product",
    subtitle: "Publish your product on the marketplace",
    selectProduct: "Select a product",
    price: "Price",
    pricePlaceholder: "0.00",
    priceRecommendation: "Recommended price",
    fast: "Quick sale",
    fair: "Fair price",
    max: "Maximum",
    description: "Description",
    descriptionPlaceholder: "Describe the product condition, included accessories...",
    shipping: "Shipping",
    shippingEnabled: "Offer shipping",
    shippingCost: "Shipping cost",
    location: "Location",
    locationPlaceholder: "City or postal code",
    publish: "Publish listing",
    minPhotos: "Minimum 2 real photos",
    minPhotosWarning: "You need at least 2 real photos to publish",
  },
  orders: {
    title: "My orders",
    empty: "You have no orders yet",
    status: {
      CREATED: "Created",
      PAID: "Paid",
      ESCROW_HOLD: "Payment held",
      SHIPPED: "Shipped",
      HANDED_OVER: "Handed over",
      DELIVERED: "Delivered",
      ACCEPTED: "Accepted",
      RELEASED: "Payment released",
      DISPUTED: "Disputed",
      REFUNDED: "Refunded",
    },
    buyer: "Buyer",
    seller: "Seller",
    total: "Total",
    tracking: "Tracking",
    confirmDelivery: "Confirm delivery",
    acceptProduct: "Accept product",
    openDispute: "Open dispute",
  },
  whyItWorks: {
    title: "Why it works",
    subtitle: "Everything you need to know",
  },
  pricingPage: {
    title: "Simple and transparent pricing",
    subtitle: "No hidden costs. No surprises.",
    free: "Free",
    pro: "Pro",
    perMonth: "/month",
    popular: "Popular",
    getStarted: "Get started",
  },
  verification: {
    title: "Identity verification",
    subtitle: "To sell on PassProduct we need to verify your identity",
    requiredTitle: "Verification required",
    requiredSubtitle: "To sell on PassProduct you need to verify your identity first. It's a quick and secure process.",
    verifyButton: "Verify my identity",
    whyNeeded: "Why do I need to verify?",
    reasons: [
      "Protects buyers and sellers from fraud",
      "Increases trust in your listings",
      "You only need to do it once",
    ],
    alreadyVerified: "You're already verified",
    alreadyVerifiedDesc: "Your identity has already been verified.",
    stepIntro: "Introduction",
    stepDocument: "Document",
    stepSelfie: "Selfie",
    stepResult: "Result",
    whatYouNeed: "What you'll need",
    documentId: "Identity document",
    documentIdDesc: "Valid, non-expired ID card or passport",
    camera: "Device camera",
    cameraDesc: "To take a photo of your document and a selfie",
    goodLighting: "Good lighting",
    goodLightingDesc: "Make sure you're in a well-lit area",
    privacyTitle: "Your privacy matters",
    privacyDesc: "We only store a hash of your document number to prevent duplicates. Your personal information is not shared with third parties.",
    startVerification: "Start verification",
    photoDocument: "Photo of your identity document",
    photoDocumentDesc: "ID card or passport",
    useCamera: "Use camera",
    uploadPhoto: "Upload photo",
    centerDocument: "Center your document within the frame",
    readingDocument: "Reading document...",
    extractedData: "Extracted data",
    confidence: "Confidence",
    retake: "Retake",
    facialVerification: "Facial verification",
    facialDesc: "We'll take a selfie to compare with your document",
    activateCamera: "Activate camera",
    noFaceDetected: "No face detected",
    moveCloser: "Move closer",
    moveAway: "Move back",
    centerFace: "Center your face",
    perfect: "Perfect!",
    startVerificationBtn: "Start verification",
    blink2Times: "Blink 2 times",
    blinksDetected: "Blinks detected",
    verifyingIdentity: "Verifying identity...",
    verificationComplete: "Verification complete!",
    verificationPartial: "Partial verification",
    verificationFailed: "Verification failed",
    identityVerified: "Your identity has been verified successfully",
    someStepsFailed: "Some steps were not completed correctly",
    couldNotVerify: "Could not verify your identity",
    checks: "Checks",
    completed: "completed",
    checkDocumentReadable: "Identity document readable",
    checkDataExtracted: "Document data extracted",
    checkNotExpired: "Document not expired",
    checkLiveness: "Presence verification (blink)",
    checkFaceMatch: "Facial match",
    verifiedInfo: "Verified information",
    tryAgain: "Try again",
    continueAnyway: "Continue anyway",
    securityNote: "Your information is processed securely and not stored in plain text. We only store a hash of your document number to prevent duplicates.",
  },
  settings: {
    title: "Settings",
    privacyTitle: "Privacy",
    showLastSeenLabel: "Show last seen",
    showLastSeenDescription: "Allow other users to see when you were last online.",
    showReadReceiptsLabel: "Read receipts",
    showReadReceiptsDescription: "Show other users when you've read their messages.",
  },
};

const fr: TranslationKeys = {
  common: {
    search: "Rechercher",
    save: "Enregistrer",
    cancel: "Annuler",
    confirm: "Confirmer",
    delete: "Supprimer",
    edit: "Modifier",
    back: "Retour",
    next: "Suivant",
    loading: "Chargement...",
    error: "Erreur",
    success: "Succès",
    free: "Gratuit",
    verified: "Vérifié",
    warranty: "Garantie",
    freeShipping: "Livraison gratuite",
    contact: "Contacter",
    featured: "En vedette",
    idVerified: "ID vérifié",
    sales: "ventes",
  },
  nav: {
    whyItWorks: "Pourquoi ça marche",
    pricing: "Tarifs",
    marketplace: "Marketplace",
    myWallet: "Mon wallet",
    signIn: "Connexion",
    signUp: "S'inscrire",
    createAccount: "Créer un compte",
    addProduct: "Ajouter un produit",
  },
  landing: {
    heroTitle: "La seconde main",
    heroTitleHighlight: "sans mauvaises surprises",
    heroSubtitle: "Uniquement des produits avec facture. Uniquement des vendeurs vérifiés. Uniquement la tranquillité.",
    getStarted: "Commencer gratuitement",
    freeProducts: "5 produits gratuits",
    noCard: "Sans carte",
    seconds: "30 secondes",
    problemTitle: "Le marché de l'occasion est cassé.",
    problemText: "Pas parce qu'il n'y a pas de demande. Il est cassé parce que personne ne fait confiance à personne. Et ils ont raison. Sans facture, il est impossible de savoir si un produit est légitime.",
    discoverWhy: "Découvrez pourquoi ça marche",
    howItWorks: "Comment ça marche",
    noComplications: "Sans complications. Sans petits caractères.",
    features: {
      invoice: {
        title: "Facture = confiance",
        description: "Pas de facture, pas d'entrée. Aussi simple. Aussi sûr.",
      },
      alerts: {
        title: "On vous alerte avant qu'il soit trop tard",
        description: "Garantie sur le point d'expirer. Prix en baisse. Vous le saurez.",
      },
      value: {
        title: "Vous savez ce que ça vaut. Aujourd'hui.",
        description: "Pas ce que vous avez payé. Ce que vous pouvez demander maintenant.",
      },
      allInOne: {
        title: "Tout au même endroit",
        description: "Facture, garantie, photos, accessoires. Arrêtez de chercher dans les tiroirs.",
      },
      sellers: {
        title: "Vendeurs avec un visage",
        description: "Vérifiés. Avec historique. Sans faux comptes.",
      },
      protection: {
        title: "Votre argent, protégé",
        description: "Paiement retenu jusqu'à confirmation. Si quelque chose échoue, on vous rembourse.",
      },
    },
    wallet: {
      title: "Votre Wallet",
      subtitle: "Vos produits, documentés",
      items: [
        "Conservez factures et garanties",
        "Sachez combien vaut chaque chose (aujourd'hui)",
        "On vous alerte quand c'est le meilleur moment de vendre",
        "Un clic pour publier sur le marketplace",
      ],
      free: "5 produits gratuits. Pour toujours.",
    },
    marketplaceSection: {
      title: "Marketplace",
      subtitle: "Uniquement des produits avec facture",
      items: [
        "Tout vérifié. Tout légitime.",
        "Vendeurs avec visage et pièce d'identité",
        "Paiement protégé jusqu'à confirmation",
        "Si quelque chose échoue, on vous rembourse",
      ],
      fee: "Seulement 5% quand vous vendez. Sans coûts cachés.",
    },
    numbers: {
      title: "Les chiffres",
      publish: "Publier",
      onlySell: "Seulement si vous vendez",
      protected: "Protégé",
    },
    cta: {
      title: "On essaie ?",
      text1: "Vous pouvez continuer sur Vinted ou Leboncoin en priant pour ne pas vous faire arnaquer.",
      text2: "Ou vous pouvez essayer quelque chose de différent.",
      createFree: "Créer un compte gratuit",
      explore: "Explorer le marketplace",
      reallySeconds: "30 secondes. Vraiment.",
    },
    badge: "Pas de facture, pas d'entrée",
  },
  header: {
    searchPlaceholder: "Rechercher sur le marketplace...",
    notifications: "Notifications",
  },
  wallet: {
    title: "Mon Wallet",
    subtitle: "Vos produits documentés prêts à vendre",
    empty: "Votre wallet est vide",
    emptyAction: "Ajoutez votre premier produit pour commencer",
    addFirst: "Ajouter premier produit",
    products: "produits",
    totalValue: "Valeur totale estimée",
    condition: {
      NEW: "Neuf",
      LIKE_NEW: "Comme neuf",
      VERY_GOOD: "Très bon",
      GOOD: "Bon",
      ACCEPTABLE: "Acceptable",
    },
    warrantyValid: "Garantie valide",
    warrantyExpiring: "Bientôt expirée",
    warrantyExpired: "Expirée",
    sellProduct: "Vendre",
    viewDetails: "Voir détails",
    purchaseDate: "Date d'achat",
    purchasePrice: "Prix d'achat",
    purchaseStore: "Magasin",
    warrantyUntil: "Garantie jusqu'au",
    accessories: "Accessoires",
    accessoriesIncluded: "Accessoires inclus",
    stockPhoto: "Photo de référence",
    stockPhotoWarning: "Vous avez besoin de vraies photos pour vendre ce produit",
    referenceImage: "Référence",
  },
  marketplace: {
    title: "Marketplace",
    filters: "Filtres",
    allCategories: "Toutes les catégories",
    priceRange: "Fourchette de prix",
    minPrice: "Min",
    maxPrice: "Max",
    verifiedPurchase: "Achat vérifié",
    withWarranty: "Avec garantie",
    withShipping: "Avec livraison",
    sortBy: "Trier par",
    sortOptions: {
      recent: "Plus récents",
      oldest: "Plus anciens",
      priceLow: "Prix: croissant",
      priceHigh: "Prix: décroissant",
    },
    views: {
      grid: "Grille",
      list: "Liste",
      map: "Carte",
    },
    noResults: "Aucun résultat trouvé",
    results: "résultats",
    contactSeller: "Contacter le vendeur",
    makeOffer: "Faire une offre",
    buy: "Acheter",
  },
  addProduct: {
    title: "Ajouter un produit",
    step1: "Téléchargez votre facture",
    step1Desc: "Téléchargez votre facture ou ticket de caisse",
    attachFile: "Joindre un fichier",
    takePhoto: "Prendre une photo",
    dragDrop: "ou glissez-déposez ici",
    supportedFormats: "PDF, JPG, PNG jusqu'à 10 Mo",
    analyzing: "Analyse de la facture...",
    multipleProducts: "Nous avons détecté plusieurs produits",
    selectProduct: "Sélectionnez le produit que vous souhaitez ajouter",
    step2: "Informations sur le produit",
    step2Desc: "Vérifiez les données extraites",
    brand: "Marque",
    model: "Modèle",
    variant: "Variante",
    category: "Catégorie",
    step3: "Détails supplémentaires",
    step3Desc: "Complétez les informations",
    estimatedValue: "Valeur estimée",
    detectingAccessories: "Détection des accessoires...",
    addAccessory: "Ajouter un accessoire...",
    toggleAccessoryHelp: "Cliquez sur un accessoire pour le marquer comme inclus/non inclus. Appuyez sur X pour supprimer.",
    saveProduct: "Enregistrer le produit",
    loadingInfo: "Chargement des infos...",
  },
  sell: {
    title: "Vendre un produit",
    subtitle: "Publiez votre produit sur le marketplace",
    selectProduct: "Sélectionnez un produit",
    price: "Prix",
    pricePlaceholder: "0.00",
    priceRecommendation: "Prix recommandé",
    fast: "Vente rapide",
    fair: "Prix juste",
    max: "Maximum",
    description: "Description",
    descriptionPlaceholder: "Décrivez l'état du produit, accessoires inclus...",
    shipping: "Livraison",
    shippingEnabled: "Proposer la livraison",
    shippingCost: "Frais de livraison",
    location: "Localisation",
    locationPlaceholder: "Ville ou code postal",
    publish: "Publier l'annonce",
    minPhotos: "Minimum 2 vraies photos",
    minPhotosWarning: "Vous avez besoin d'au moins 2 vraies photos pour publier",
  },
  orders: {
    title: "Mes commandes",
    empty: "Vous n'avez pas encore de commandes",
    status: {
      CREATED: "Créée",
      PAID: "Payée",
      ESCROW_HOLD: "Paiement en attente",
      SHIPPED: "Expédiée",
      HANDED_OVER: "Remise",
      DELIVERED: "Livrée",
      ACCEPTED: "Acceptée",
      RELEASED: "Paiement libéré",
      DISPUTED: "En litige",
      REFUNDED: "Remboursée",
    },
    buyer: "Acheteur",
    seller: "Vendeur",
    total: "Total",
    tracking: "Suivi",
    confirmDelivery: "Confirmer la livraison",
    acceptProduct: "Accepter le produit",
    openDispute: "Ouvrir un litige",
  },
  whyItWorks: {
    title: "Pourquoi ça marche",
    subtitle: "Tout ce que vous devez savoir",
  },
  pricingPage: {
    title: "Tarifs simples et transparents",
    subtitle: "Pas de coûts cachés. Pas de surprises.",
    free: "Gratuit",
    pro: "Pro",
    perMonth: "/mois",
    popular: "Populaire",
    getStarted: "Commencer",
  },
  verification: {
    title: "Vérification d'identité",
    subtitle: "Pour vendre sur PassProduct, nous devons vérifier votre identité",
    requiredTitle: "Vérification requise",
    requiredSubtitle: "Pour vendre sur PassProduct, vous devez d'abord vérifier votre identité. C'est un processus rapide et sécurisé.",
    verifyButton: "Vérifier mon identité",
    whyNeeded: "Pourquoi dois-je me vérifier ?",
    reasons: [
      "Protège les acheteurs et vendeurs contre la fraude",
      "Augmente la confiance dans vos annonces",
      "Vous n'avez besoin de le faire qu'une fois",
    ],
    alreadyVerified: "Vous êtes déjà vérifié",
    alreadyVerifiedDesc: "Votre identité a déjà été vérifiée.",
    stepIntro: "Introduction",
    stepDocument: "Document",
    stepSelfie: "Selfie",
    stepResult: "Résultat",
    whatYouNeed: "Ce dont vous aurez besoin",
    documentId: "Document d'identité",
    documentIdDesc: "Carte d'identité ou passeport valide et non expiré",
    camera: "Caméra de l'appareil",
    cameraDesc: "Pour prendre une photo du document et un selfie",
    goodLighting: "Bon éclairage",
    goodLightingDesc: "Assurez-vous d'être dans un endroit bien éclairé",
    privacyTitle: "Votre vie privée compte",
    privacyDesc: "Nous ne stockons qu'un hash de votre numéro de document pour éviter les doublons. Vos informations personnelles ne sont pas partagées avec des tiers.",
    startVerification: "Commencer la vérification",
    photoDocument: "Photo de votre document d'identité",
    photoDocumentDesc: "Carte d'identité ou passeport",
    useCamera: "Utiliser la caméra",
    uploadPhoto: "Télécharger une photo",
    centerDocument: "Centrez votre document dans le cadre",
    readingDocument: "Lecture du document...",
    extractedData: "Données extraites",
    confidence: "Confiance",
    retake: "Reprendre",
    facialVerification: "Vérification faciale",
    facialDesc: "Nous prendrons un selfie pour le comparer à votre document",
    activateCamera: "Activer la caméra",
    noFaceDetected: "Aucun visage détecté",
    moveCloser: "Rapprochez-vous",
    moveAway: "Éloignez-vous",
    centerFace: "Centrez votre visage",
    perfect: "Parfait !",
    startVerificationBtn: "Commencer la vérification",
    blink2Times: "Clignez 2 fois",
    blinksDetected: "Clignements détectés",
    verifyingIdentity: "Vérification de l'identité...",
    verificationComplete: "Vérification terminée !",
    verificationPartial: "Vérification partielle",
    verificationFailed: "Vérification échouée",
    identityVerified: "Votre identité a été vérifiée avec succès",
    someStepsFailed: "Certaines étapes n'ont pas été complétées correctement",
    couldNotVerify: "Impossible de vérifier votre identité",
    checks: "Vérifications",
    completed: "complétées",
    checkDocumentReadable: "Document d'identité lisible",
    checkDataExtracted: "Données du document extraites",
    checkNotExpired: "Document non expiré",
    checkLiveness: "Vérification de présence (clignement)",
    checkFaceMatch: "Correspondance faciale",
    verifiedInfo: "Informations vérifiées",
    tryAgain: "Réessayer",
    continueAnyway: "Continuer quand même",
    securityNote: "Vos informations sont traitées de manière sécurisée et ne sont pas stockées en clair. Nous ne stockons qu'un hash de votre numéro de document pour éviter les doublons.",
  },
  settings: {
    title: "Paramètres",
    privacyTitle: "Confidentialité",
    showLastSeenLabel: "Afficher dernière connexion",
    showLastSeenDescription: "Permet aux autres utilisateurs de voir quand vous étiez connecté.",
    showReadReceiptsLabel: "Accusés de lecture",
    showReadReceiptsDescription: "Montre aux autres utilisateurs quand vous avez lu leurs messages.",
  },
};

const it: TranslationKeys = {
  common: {
    search: "Cerca",
    save: "Salva",
    cancel: "Annulla",
    confirm: "Conferma",
    delete: "Elimina",
    edit: "Modifica",
    back: "Indietro",
    next: "Avanti",
    loading: "Caricamento...",
    error: "Errore",
    success: "Successo",
    free: "Gratis",
    verified: "Verificato",
    warranty: "Garanzia",
    freeShipping: "Spedizione gratuita",
    contact: "Contatta",
    featured: "In evidenza",
    idVerified: "ID verificato",
    sales: "vendite",
  },
  nav: {
    whyItWorks: "Perché funziona",
    pricing: "Prezzi",
    marketplace: "Marketplace",
    myWallet: "Il mio wallet",
    signIn: "Accedi",
    signUp: "Registrati",
    createAccount: "Crea account",
    addProduct: "Aggiungi prodotto",
  },
  landing: {
    heroTitle: "L'usato",
    heroTitleHighlight: "senza sorprese",
    heroSubtitle: "Solo prodotti con fattura. Solo venditori verificati. Solo tranquillità.",
    getStarted: "Inizia gratis",
    freeProducts: "5 prodotti gratis",
    noCard: "Senza carta",
    seconds: "30 secondi",
    problemTitle: "Il mercato dell'usato è rotto.",
    problemText: "Non perché non ci sia domanda. È rotto perché nessuno si fida di nessuno. E hanno ragione. Senza fattura, non c'è modo di sapere se un prodotto è legittimo.",
    discoverWhy: "Scopri perché funziona",
    howItWorks: "Come funziona",
    noComplications: "Senza complicazioni. Senza clausole nascoste.",
    features: {
      invoice: {
        title: "Fattura = fiducia",
        description: "Niente fattura, niente accesso. Così semplice. Così sicuro.",
      },
      alerts: {
        title: "Ti avvisiamo prima che sia troppo tardi",
        description: "Garanzia in scadenza. Prezzo in calo. Lo saprai.",
      },
      value: {
        title: "Sai quanto vale. Oggi.",
        description: "Non quanto hai pagato. Quanto puoi chiedere adesso.",
      },
      allInOne: {
        title: "Tutto in un posto",
        description: "Fattura, garanzia, foto, accessori. Smetti di cercare nei cassetti.",
      },
      sellers: {
        title: "Venditori con un volto",
        description: "Verificati. Con storico. Senza account falsi.",
      },
      protection: {
        title: "I tuoi soldi, protetti",
        description: "Pagamento trattenuto fino a conferma. Se qualcosa va storto, ti rimborsiamo.",
      },
    },
    wallet: {
      title: "Il tuo Wallet",
      subtitle: "I tuoi prodotti, documentati",
      items: [
        "Conserva fatture e garanzie",
        "Sai quanto vale ogni cosa (oggi)",
        "Ti avvisiamo quando è meglio vendere",
        "Un clic per pubblicare sul marketplace",
      ],
      free: "5 prodotti gratis. Per sempre.",
    },
    marketplaceSection: {
      title: "Marketplace",
      subtitle: "Solo prodotti con fattura",
      items: [
        "Tutto verificato. Tutto legittimo.",
        "Venditori con volto e documento",
        "Pagamento protetto fino a conferma",
        "Se qualcosa va storto, ti rimborsiamo",
      ],
      fee: "Solo 5% quando vendi. Nessun costo nascosto.",
    },
    numbers: {
      title: "I numeri",
      publish: "Pubblica",
      onlySell: "Solo se vendi",
      protected: "Protetto",
    },
    cta: {
      title: "Proviamo?",
      text1: "Puoi continuare su Vinted o Subito sperando di non essere truffato.",
      text2: "Oppure puoi provare qualcosa di diverso.",
      createFree: "Crea account gratis",
      explore: "Esplora marketplace",
      reallySeconds: "30 secondi. Sul serio.",
    },
    badge: "Niente fattura, niente accesso",
  },
  header: {
    searchPlaceholder: "Cerca nel marketplace...",
    notifications: "Notifiche",
  },
  wallet: {
    title: "Il mio Wallet",
    subtitle: "I tuoi prodotti documentati pronti per la vendita",
    empty: "Il tuo wallet è vuoto",
    emptyAction: "Aggiungi il tuo primo prodotto per iniziare",
    addFirst: "Aggiungi primo prodotto",
    products: "prodotti",
    totalValue: "Valore totale stimato",
    condition: {
      NEW: "Nuovo",
      LIKE_NEW: "Come nuovo",
      VERY_GOOD: "Molto buono",
      GOOD: "Buono",
      ACCEPTABLE: "Accettabile",
    },
    warrantyValid: "Garanzia valida",
    warrantyExpiring: "In scadenza",
    warrantyExpired: "Scaduta",
    sellProduct: "Vendi",
    viewDetails: "Vedi dettagli",
    purchaseDate: "Data di acquisto",
    purchasePrice: "Prezzo di acquisto",
    purchaseStore: "Negozio",
    warrantyUntil: "Garanzia fino al",
    accessories: "Accessori",
    accessoriesIncluded: "Accessori inclusi",
    stockPhoto: "Foto di riferimento",
    stockPhotoWarning: "Hai bisogno di foto reali per vendere questo prodotto",
    referenceImage: "Riferimento",
  },
  marketplace: {
    title: "Marketplace",
    filters: "Filtri",
    allCategories: "Tutte le categorie",
    priceRange: "Fascia di prezzo",
    minPrice: "Min",
    maxPrice: "Max",
    verifiedPurchase: "Acquisto verificato",
    withWarranty: "Con garanzia",
    withShipping: "Con spedizione",
    sortBy: "Ordina per",
    sortOptions: {
      recent: "Più recenti",
      oldest: "Più vecchi",
      priceLow: "Prezzo: crescente",
      priceHigh: "Prezzo: decrescente",
    },
    views: {
      grid: "Griglia",
      list: "Lista",
      map: "Mappa",
    },
    noResults: "Nessun risultato trovato",
    results: "risultati",
    contactSeller: "Contatta venditore",
    makeOffer: "Fai un'offerta",
    buy: "Acquista",
  },
  addProduct: {
    title: "Aggiungi prodotto",
    step1: "Carica la tua fattura",
    step1Desc: "Carica la tua fattura o scontrino",
    attachFile: "Allega file",
    takePhoto: "Scatta foto",
    dragDrop: "o trascina e rilascia qui",
    supportedFormats: "PDF, JPG, PNG fino a 10MB",
    analyzing: "Analisi fattura...",
    multipleProducts: "Abbiamo rilevato più prodotti",
    selectProduct: "Seleziona il prodotto che vuoi aggiungere",
    step2: "Informazioni sul prodotto",
    step2Desc: "Verifica i dati estratti",
    brand: "Marca",
    model: "Modello",
    variant: "Variante",
    category: "Categoria",
    step3: "Dettagli aggiuntivi",
    step3Desc: "Completa le informazioni",
    estimatedValue: "Valore stimato",
    detectingAccessories: "Rilevamento accessori...",
    addAccessory: "Aggiungi accessorio...",
    toggleAccessoryHelp: "Clicca su un accessorio per contrassegnarlo come incluso/non incluso. Premi X per rimuoverlo.",
    saveProduct: "Salva prodotto",
    loadingInfo: "Caricamento info...",
  },
  sell: {
    title: "Vendi prodotto",
    subtitle: "Pubblica il tuo prodotto sul marketplace",
    selectProduct: "Seleziona un prodotto",
    price: "Prezzo",
    pricePlaceholder: "0.00",
    priceRecommendation: "Prezzo consigliato",
    fast: "Vendita rapida",
    fair: "Prezzo giusto",
    max: "Massimo",
    description: "Descrizione",
    descriptionPlaceholder: "Descrivi lo stato del prodotto, accessori inclusi...",
    shipping: "Spedizione",
    shippingEnabled: "Offri spedizione",
    shippingCost: "Costo spedizione",
    location: "Posizione",
    locationPlaceholder: "Città o CAP",
    publish: "Pubblica annuncio",
    minPhotos: "Minimo 2 foto reali",
    minPhotosWarning: "Hai bisogno di almeno 2 foto reali per pubblicare",
  },
  orders: {
    title: "I miei ordini",
    empty: "Non hai ancora ordini",
    status: {
      CREATED: "Creato",
      PAID: "Pagato",
      ESCROW_HOLD: "Pagamento in attesa",
      SHIPPED: "Spedito",
      HANDED_OVER: "Consegnato",
      DELIVERED: "Ricevuto",
      ACCEPTED: "Accettato",
      RELEASED: "Pagamento rilasciato",
      DISPUTED: "In disputa",
      REFUNDED: "Rimborsato",
    },
    buyer: "Acquirente",
    seller: "Venditore",
    total: "Totale",
    tracking: "Tracciamento",
    confirmDelivery: "Conferma consegna",
    acceptProduct: "Accetta prodotto",
    openDispute: "Apri disputa",
  },
  whyItWorks: {
    title: "Perché funziona",
    subtitle: "Tutto quello che devi sapere",
  },
  pricingPage: {
    title: "Prezzi semplici e trasparenti",
    subtitle: "Nessun costo nascosto. Nessuna sorpresa.",
    free: "Gratis",
    pro: "Pro",
    perMonth: "/mese",
    popular: "Popolare",
    getStarted: "Inizia",
  },
  verification: {
    title: "Verifica dell'identità",
    subtitle: "Per vendere su PassProduct dobbiamo verificare la tua identità",
    requiredTitle: "Verifica richiesta",
    requiredSubtitle: "Per vendere su PassProduct devi prima verificare la tua identità. È un processo rapido e sicuro.",
    verifyButton: "Verifica la mia identità",
    whyNeeded: "Perché devo verificarmi?",
    reasons: [
      "Protegge acquirenti e venditori dalle frodi",
      "Aumenta la fiducia nei tuoi annunci",
      "Devi farlo solo una volta",
    ],
    alreadyVerified: "Sei già verificato",
    alreadyVerifiedDesc: "La tua identità è già stata verificata.",
    stepIntro: "Introduzione",
    stepDocument: "Documento",
    stepSelfie: "Selfie",
    stepResult: "Risultato",
    whatYouNeed: "Cosa ti servirà",
    documentId: "Documento d'identità",
    documentIdDesc: "Carta d'identità o passaporto valido e non scaduto",
    camera: "Fotocamera del dispositivo",
    cameraDesc: "Per scattare una foto del documento e un selfie",
    goodLighting: "Buona illuminazione",
    goodLightingDesc: "Assicurati di essere in un luogo ben illuminato",
    privacyTitle: "La tua privacy è importante",
    privacyDesc: "Memorizziamo solo un hash del numero del tuo documento per prevenire duplicati. Le tue informazioni personali non vengono condivise con terze parti.",
    startVerification: "Inizia verifica",
    photoDocument: "Foto del tuo documento d'identità",
    photoDocumentDesc: "Carta d'identità o passaporto",
    useCamera: "Usa fotocamera",
    uploadPhoto: "Carica foto",
    centerDocument: "Centra il documento nella cornice",
    readingDocument: "Lettura documento...",
    extractedData: "Dati estratti",
    confidence: "Affidabilità",
    retake: "Rifai",
    facialVerification: "Verifica facciale",
    facialDesc: "Scatteremo un selfie per confrontarlo con il tuo documento",
    activateCamera: "Attiva fotocamera",
    noFaceDetected: "Nessun volto rilevato",
    moveCloser: "Avvicinati",
    moveAway: "Allontanati",
    centerFace: "Centra il volto",
    perfect: "Perfetto!",
    startVerificationBtn: "Inizia verifica",
    blink2Times: "Sbatti le palpebre 2 volte",
    blinksDetected: "Battiti rilevati",
    verifyingIdentity: "Verifica identità...",
    verificationComplete: "Verifica completata!",
    verificationPartial: "Verifica parziale",
    verificationFailed: "Verifica fallita",
    identityVerified: "La tua identità è stata verificata con successo",
    someStepsFailed: "Alcuni passaggi non sono stati completati correttamente",
    couldNotVerify: "Impossibile verificare la tua identità",
    checks: "Controlli",
    completed: "completati",
    checkDocumentReadable: "Documento d'identità leggibile",
    checkDataExtracted: "Dati del documento estratti",
    checkNotExpired: "Documento non scaduto",
    checkLiveness: "Verifica presenza (battito)",
    checkFaceMatch: "Corrispondenza facciale",
    verifiedInfo: "Informazioni verificate",
    tryAgain: "Riprova",
    continueAnyway: "Continua comunque",
    securityNote: "Le tue informazioni vengono elaborate in modo sicuro e non memorizzate in chiaro. Memorizziamo solo un hash del numero del documento per prevenire duplicati.",
  },
  settings: {
    title: "Impostazioni",
    privacyTitle: "Privacy",
    showLastSeenLabel: "Mostra ultimo accesso",
    showLastSeenDescription: "Permette agli altri utenti di vedere quando sei stato online.",
    showReadReceiptsLabel: "Conferme di lettura",
    showReadReceiptsDescription: "Mostra agli altri utenti quando hai letto i loro messaggi.",
  },
};

const pt: TranslationKeys = {
  common: {
    search: "Pesquisar",
    save: "Guardar",
    cancel: "Cancelar",
    confirm: "Confirmar",
    delete: "Eliminar",
    edit: "Editar",
    back: "Voltar",
    next: "Seguinte",
    loading: "A carregar...",
    error: "Erro",
    success: "Sucesso",
    free: "Grátis",
    verified: "Verificado",
    warranty: "Garantia",
    freeShipping: "Envio grátis",
    contact: "Contactar",
    featured: "Destacado",
    idVerified: "ID verificado",
    sales: "vendas",
  },
  nav: {
    whyItWorks: "Porquê funciona",
    pricing: "Preços",
    marketplace: "Marketplace",
    myWallet: "Minha wallet",
    signIn: "Entrar",
    signUp: "Registar",
    createAccount: "Criar conta",
    addProduct: "Adicionar produto",
  },
  landing: {
    heroTitle: "Segunda mão",
    heroTitleHighlight: "sem sustos",
    heroSubtitle: "Apenas produtos com fatura. Apenas vendedores verificados. Apenas tranquilidade.",
    getStarted: "Começar grátis",
    freeProducts: "5 produtos grátis",
    noCard: "Sem cartão",
    seconds: "30 segundos",
    problemTitle: "O mercado de segunda mão está partido.",
    problemText: "Não porque não haja procura. Está partido porque ninguém confia em ninguém. E têm razão. Sem fatura, não há como saber se um produto é legítimo.",
    discoverWhy: "Descobre porquê funciona",
    howItWorks: "Como funciona",
    noComplications: "Sem complicações. Sem letras pequenas.",
    features: {
      invoice: {
        title: "Fatura = confiança",
        description: "Sem fatura, não entras. Simples assim. Seguro assim.",
      },
      alerts: {
        title: "Avisamos-te antes que seja tarde",
        description: "Garantia a expirar. Preço a descer. Vais saber.",
      },
      value: {
        title: "Sabes quanto vale. Hoje.",
        description: "Não o que pagaste. O que podes pedir agora.",
      },
      allInOne: {
        title: "Tudo num só lugar",
        description: "Fatura, garantia, fotos, acessórios. Para de procurar em gavetas.",
      },
      sellers: {
        title: "Vendedores com cara",
        description: "Verificados. Com histórico. Sem contas falsas.",
      },
      protection: {
        title: "O teu dinheiro, protegido",
        description: "Pagamento retido até confirmares. Se algo falhar, devolvemos.",
      },
    },
    wallet: {
      title: "A tua Wallet",
      subtitle: "Os teus produtos, documentados",
      items: [
        "Guarda faturas e garantias",
        "Sabes quanto vale cada coisa (hoje)",
        "Avisamos-te quando é melhor vender",
        "Um clique para publicar no marketplace",
      ],
      free: "5 produtos grátis. Para sempre.",
    },
    marketplaceSection: {
      title: "Marketplace",
      subtitle: "Apenas produtos com fatura",
      items: [
        "Tudo verificado. Tudo legítimo.",
        "Vendedores com cara e documento",
        "Pagamento protegido até confirmares",
        "Se algo falhar, devolvemos",
      ],
      fee: "Apenas 5% quando vendes. Sem custos ocultos.",
    },
    numbers: {
      title: "Os números",
      publish: "Publicar",
      onlySell: "Só se venderes",
      protected: "Protegido",
    },
    cta: {
      title: "Experimentamos?",
      text1: "Podes continuar no OLX ou Vinted a rezar para não seres burlado.",
      text2: "Ou podes experimentar algo diferente.",
      createFree: "Criar conta grátis",
      explore: "Explorar marketplace",
      reallySeconds: "30 segundos. A sério.",
    },
    badge: "Sem fatura, não entras",
  },
  header: {
    searchPlaceholder: "Pesquisar no marketplace...",
    notifications: "Notificações",
  },
  wallet: {
    title: "Minha Wallet",
    subtitle: "Os teus produtos documentados prontos para vender",
    empty: "A tua wallet está vazia",
    emptyAction: "Adiciona o teu primeiro produto para começar",
    addFirst: "Adicionar primeiro produto",
    products: "produtos",
    totalValue: "Valor total estimado",
    condition: {
      NEW: "Novo",
      LIKE_NEW: "Como novo",
      VERY_GOOD: "Muito bom",
      GOOD: "Bom",
      ACCEPTABLE: "Aceitável",
    },
    warrantyValid: "Garantia válida",
    warrantyExpiring: "A expirar",
    warrantyExpired: "Expirada",
    sellProduct: "Vender",
    viewDetails: "Ver detalhes",
    purchaseDate: "Data de compra",
    purchasePrice: "Preço de compra",
    purchaseStore: "Loja",
    warrantyUntil: "Garantia até",
    accessories: "Acessórios",
    accessoriesIncluded: "Acessórios incluídos",
    stockPhoto: "Foto de referência",
    stockPhotoWarning: "Precisas de fotos reais para vender este produto",
    referenceImage: "Referência",
  },
  marketplace: {
    title: "Marketplace",
    filters: "Filtros",
    allCategories: "Todas as categorias",
    priceRange: "Faixa de preço",
    minPrice: "Mín",
    maxPrice: "Máx",
    verifiedPurchase: "Compra verificada",
    withWarranty: "Com garantia",
    withShipping: "Com envio",
    sortBy: "Ordenar por",
    sortOptions: {
      recent: "Mais recentes",
      oldest: "Mais antigos",
      priceLow: "Preço: menor para maior",
      priceHigh: "Preço: maior para menor",
    },
    views: {
      grid: "Grelha",
      list: "Lista",
      map: "Mapa",
    },
    noResults: "Nenhum resultado encontrado",
    results: "resultados",
    contactSeller: "Contactar vendedor",
    makeOffer: "Fazer oferta",
    buy: "Comprar",
  },
  addProduct: {
    title: "Adicionar produto",
    step1: "Carrega a tua fatura",
    step1Desc: "Carrega a tua fatura ou talão de compra",
    attachFile: "Anexar ficheiro",
    takePhoto: "Tirar foto",
    dragDrop: "ou arrasta e larga aqui",
    supportedFormats: "PDF, JPG, PNG até 10MB",
    analyzing: "A analisar fatura...",
    multipleProducts: "Detetámos vários produtos",
    selectProduct: "Seleciona o produto que queres adicionar",
    step2: "Informação do produto",
    step2Desc: "Verifica os dados extraídos",
    brand: "Marca",
    model: "Modelo",
    variant: "Variante",
    category: "Categoria",
    step3: "Detalhes adicionais",
    step3Desc: "Completa a informação",
    estimatedValue: "Valor estimado",
    detectingAccessories: "A detetar acessórios...",
    addAccessory: "Adicionar acessório...",
    toggleAccessoryHelp: "Clica num acessório para marcar como incluído/não incluído. Pressiona X para remover.",
    saveProduct: "Guardar produto",
    loadingInfo: "A carregar info...",
  },
  sell: {
    title: "Vender produto",
    subtitle: "Publica o teu produto no marketplace",
    selectProduct: "Seleciona um produto",
    price: "Preço",
    pricePlaceholder: "0.00",
    priceRecommendation: "Preço recomendado",
    fast: "Venda rápida",
    fair: "Preço justo",
    max: "Máximo",
    description: "Descrição",
    descriptionPlaceholder: "Descreve o estado do produto, acessórios incluídos...",
    shipping: "Envio",
    shippingEnabled: "Oferecer envio",
    shippingCost: "Custo de envio",
    location: "Localização",
    locationPlaceholder: "Cidade ou código postal",
    publish: "Publicar anúncio",
    minPhotos: "Mínimo 2 fotos reais",
    minPhotosWarning: "Precisas de pelo menos 2 fotos reais para publicar",
  },
  orders: {
    title: "As minhas encomendas",
    empty: "Ainda não tens encomendas",
    status: {
      CREATED: "Criada",
      PAID: "Paga",
      ESCROW_HOLD: "Pagamento retido",
      SHIPPED: "Enviada",
      HANDED_OVER: "Entregue",
      DELIVERED: "Recebida",
      ACCEPTED: "Aceite",
      RELEASED: "Pagamento libertado",
      DISPUTED: "Em disputa",
      REFUNDED: "Reembolsada",
    },
    buyer: "Comprador",
    seller: "Vendedor",
    total: "Total",
    tracking: "Rastreamento",
    confirmDelivery: "Confirmar entrega",
    acceptProduct: "Aceitar produto",
    openDispute: "Abrir disputa",
  },
  whyItWorks: {
    title: "Porquê funciona",
    subtitle: "Tudo o que precisas saber",
  },
  pricingPage: {
    title: "Preços simples e transparentes",
    subtitle: "Sem custos ocultos. Sem surpresas.",
    free: "Grátis",
    pro: "Pro",
    perMonth: "/mês",
    popular: "Popular",
    getStarted: "Começar",
  },
  verification: {
    title: "Verificação de identidade",
    subtitle: "Para vender no PassProduct precisamos verificar a tua identidade",
    requiredTitle: "Verificação necessária",
    requiredSubtitle: "Para vender no PassProduct precisas de verificar a tua identidade primeiro. É um processo rápido e seguro.",
    verifyButton: "Verificar a minha identidade",
    whyNeeded: "Porque preciso de me verificar?",
    reasons: [
      "Protege compradores e vendedores de fraudes",
      "Aumenta a confiança nos teus anúncios",
      "Só precisas de o fazer uma vez",
    ],
    alreadyVerified: "Já estás verificado",
    alreadyVerifiedDesc: "A tua identidade já foi verificada.",
    stepIntro: "Introdução",
    stepDocument: "Documento",
    stepSelfie: "Selfie",
    stepResult: "Resultado",
    whatYouNeed: "O que vais precisar",
    documentId: "Documento de identidade",
    documentIdDesc: "Cartão de cidadão ou passaporte válido e não expirado",
    camera: "Câmara do dispositivo",
    cameraDesc: "Para tirar foto do documento e uma selfie",
    goodLighting: "Boa iluminação",
    goodLightingDesc: "Certifica-te de que estás num local bem iluminado",
    privacyTitle: "A tua privacidade importa",
    privacyDesc: "Só guardamos um hash do teu número de documento para prevenir duplicados. A tua informação pessoal não é partilhada com terceiros.",
    startVerification: "Iniciar verificação",
    photoDocument: "Foto do teu documento de identidade",
    photoDocumentDesc: "Cartão de cidadão ou passaporte",
    useCamera: "Usar câmara",
    uploadPhoto: "Carregar foto",
    centerDocument: "Centra o documento na moldura",
    readingDocument: "A ler documento...",
    extractedData: "Dados extraídos",
    confidence: "Confiança",
    retake: "Repetir",
    facialVerification: "Verificação facial",
    facialDesc: "Vamos tirar uma selfie para comparar com o teu documento",
    activateCamera: "Ativar câmara",
    noFaceDetected: "Nenhum rosto detetado",
    moveCloser: "Aproxima-te",
    moveAway: "Afasta-te",
    centerFace: "Centra o rosto",
    perfect: "Perfeito!",
    startVerificationBtn: "Iniciar verificação",
    blink2Times: "Pestaneja 2 vezes",
    blinksDetected: "Pestanejo detetado",
    verifyingIdentity: "A verificar identidade...",
    verificationComplete: "Verificação completa!",
    verificationPartial: "Verificação parcial",
    verificationFailed: "Verificação falhou",
    identityVerified: "A tua identidade foi verificada com sucesso",
    someStepsFailed: "Alguns passos não foram completados corretamente",
    couldNotVerify: "Não foi possível verificar a tua identidade",
    checks: "Verificações",
    completed: "completadas",
    checkDocumentReadable: "Documento de identidade legível",
    checkDataExtracted: "Dados do documento extraídos",
    checkNotExpired: "Documento não expirado",
    checkLiveness: "Verificação de presença (pestanejo)",
    checkFaceMatch: "Correspondência facial",
    verifiedInfo: "Informação verificada",
    tryAgain: "Tentar novamente",
    continueAnyway: "Continuar assim mesmo",
    securityNote: "A tua informação é processada de forma segura e não é guardada em texto plano. Só guardamos um hash do número do teu documento para prevenir duplicados.",
  },
  settings: {
    title: "Definições",
    privacyTitle: "Privacidade",
    showLastSeenLabel: "Mostrar última ligação",
    showLastSeenDescription: "Permite a outros utilizadores ver quando estiveste online.",
    showReadReceiptsLabel: "Confirmações de leitura",
    showReadReceiptsDescription: "Mostra a outros utilizadores quando leste as mensagens deles.",
  },
};

export const translations: Record<Locale, TranslationKeys> = {
  es,
  en,
  fr,
  it,
  pt,
};
