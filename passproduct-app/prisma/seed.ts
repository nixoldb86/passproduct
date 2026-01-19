import { PrismaClient, ProductCondition, ListingStatus, VerificationLevel } from "@prisma/client";

const prisma = new PrismaClient();

// Categorías sincronizadas con mockCategories del frontend
// IDs usan formato: cat-{slug}
const categories = [
  // === ELECTRÓNICA DE CONSUMO ===
  { id: "cat-smartphones", name: "Smartphones", slug: "smartphones", icon: "📱", minPhotos: 3, requiresTicket: false, requiresSerial: true },
  { id: "cat-tablets", name: "Tablets", slug: "tablets", icon: "📲", minPhotos: 2, requiresTicket: false, requiresSerial: true },
  { id: "cat-laptops", name: "Portátiles", slug: "laptops", icon: "💻", minPhotos: 3, requiresTicket: false, requiresSerial: true },
  { id: "cat-desktops", name: "Ordenadores de sobremesa", slug: "desktops", icon: "🖥️", minPhotos: 3, requiresTicket: false, requiresSerial: true },
  { id: "cat-monitors", name: "Monitores", slug: "monitors", icon: "🖥️", minPhotos: 2, requiresTicket: false, requiresSerial: true },
  { id: "cat-consoles", name: "Consolas", slug: "consoles", icon: "🎮", minPhotos: 2, requiresTicket: false, requiresSerial: true },
  { id: "cat-audio", name: "Audio", slug: "audio", icon: "🎧", minPhotos: 2, requiresTicket: false, requiresSerial: false },
  { id: "cat-wearables", name: "Wearables", slug: "wearables", icon: "⌚", minPhotos: 2, requiresTicket: false, requiresSerial: true },
  { id: "cat-cameras", name: "Cámaras y Fotografía", slug: "cameras", icon: "📷", minPhotos: 2, requiresTicket: false, requiresSerial: true },
  { id: "cat-tv", name: "Televisores", slug: "tv", icon: "📺", minPhotos: 2, requiresTicket: false, requiresSerial: true },
  { id: "cat-projectors", name: "Proyectores", slug: "projectors", icon: "📽️", minPhotos: 2, requiresTicket: false, requiresSerial: true },
  // === ELECTRODOMÉSTICOS ===
  { id: "cat-appliances-large", name: "Grandes Electrodomésticos", slug: "appliances-large", icon: "🧊", minPhotos: 2, requiresTicket: false, requiresSerial: true },
  { id: "cat-appliances-small", name: "Pequeños Electrodomésticos", slug: "appliances-small", icon: "🍳", minPhotos: 2, requiresTicket: false, requiresSerial: false },
  { id: "cat-climate", name: "Climatización", slug: "climate", icon: "❄️", minPhotos: 2, requiresTicket: false, requiresSerial: true },
  // === MOVILIDAD ===
  { id: "cat-ebikes", name: "Bicicletas Eléctricas", slug: "ebikes", icon: "🚲", minPhotos: 3, requiresTicket: false, requiresSerial: true },
  { id: "cat-scooters", name: "Patinetes Eléctricos", slug: "scooters", icon: "🛴", minPhotos: 2, requiresTicket: false, requiresSerial: true },
  { id: "cat-drones", name: "Drones", slug: "drones", icon: "🚁", minPhotos: 2, requiresTicket: false, requiresSerial: true },
  // === BEBÉS Y NIÑOS ===
  { id: "cat-baby-strollers", name: "Carritos y Sillas de Paseo", slug: "baby-strollers", icon: "👶", minPhotos: 3, requiresTicket: true, requiresSerial: false },
  { id: "cat-baby-car-seats", name: "Sillas de Coche", slug: "baby-car-seats", icon: "🚗", minPhotos: 3, requiresTicket: true, requiresSerial: false },
  { id: "cat-baby-furniture", name: "Mobiliario Infantil", slug: "baby-furniture", icon: "🛒", minPhotos: 2, requiresTicket: false, requiresSerial: false },
  { id: "cat-toys", name: "Juguetes", slug: "toys", icon: "🧸", minPhotos: 2, requiresTicket: false, requiresSerial: false },
  // === HOGAR ===
  { id: "cat-furniture", name: "Muebles", slug: "furniture", icon: "🛋️", minPhotos: 3, requiresTicket: false, requiresSerial: false },
  { id: "cat-garden", name: "Jardín", slug: "garden", icon: "🌿", minPhotos: 2, requiresTicket: false, requiresSerial: false },
  { id: "cat-lighting", name: "Iluminación", slug: "lighting", icon: "💡", minPhotos: 2, requiresTicket: false, requiresSerial: false },
  { id: "cat-home-decor", name: "Decoración", slug: "home-decor", icon: "🖼️", minPhotos: 2, requiresTicket: false, requiresSerial: false },
  // === DEPORTE ===
  { id: "cat-fitness", name: "Fitness", slug: "fitness", icon: "🏋️", minPhotos: 2, requiresTicket: false, requiresSerial: false },
  { id: "cat-bikes", name: "Bicicletas", slug: "bikes", icon: "🚴", minPhotos: 3, requiresTicket: false, requiresSerial: true },
  { id: "cat-sports", name: "Deportes", slug: "sports", icon: "⚽", minPhotos: 2, requiresTicket: false, requiresSerial: false },
  { id: "cat-outdoor", name: "Outdoor", slug: "outdoor", icon: "🏕️", minPhotos: 2, requiresTicket: false, requiresSerial: false },
  // === MODA Y LUJO ===
  { id: "cat-fashion-luxury", name: "Moda de Lujo", slug: "fashion-luxury", icon: "👔", minPhotos: 3, requiresTicket: true, requiresSerial: false },
  { id: "cat-watches-jewelry", name: "Relojes y Joyería", slug: "watches-jewelry", icon: "⌚", minPhotos: 4, requiresTicket: true, requiresSerial: true },
  { id: "cat-bags", name: "Bolsos", slug: "bags", icon: "👜", minPhotos: 3, requiresTicket: true, requiresSerial: false },
  // === MÚSICA ===
  { id: "cat-instruments", name: "Instrumentos", slug: "instruments", icon: "🎸", minPhotos: 3, requiresTicket: false, requiresSerial: false },
  { id: "cat-music-equipment", name: "Equipos de Música", slug: "music-equipment", icon: "🎹", minPhotos: 2, requiresTicket: false, requiresSerial: false },
  // === HERRAMIENTAS ===
  { id: "cat-tools", name: "Herramientas", slug: "tools", icon: "🔧", minPhotos: 2, requiresTicket: false, requiresSerial: false },
  { id: "cat-power-tools", name: "Herramientas Eléctricas", slug: "power-tools", icon: "🔨", minPhotos: 2, requiresTicket: false, requiresSerial: false },
  // === VEHÍCULOS ===
  { id: "cat-motorcycles", name: "Motocicletas", slug: "motorcycles", icon: "🏍️", minPhotos: 4, requiresTicket: true, requiresSerial: true },
  { id: "cat-car-parts", name: "Piezas de Coche", slug: "car-parts", icon: "🚙", minPhotos: 2, requiresTicket: false, requiresSerial: false },
  // === OTROS ===
  { id: "cat-collectibles", name: "Coleccionables", slug: "collectibles", icon: "🏆", minPhotos: 3, requiresTicket: false, requiresSerial: false },
  { id: "cat-books-media", name: "Libros y Multimedia", slug: "books-media", icon: "📚", minPhotos: 2, requiresTicket: false, requiresSerial: false },
  { id: "cat-other", name: "Otros", slug: "other", icon: "📦", minPhotos: 2, requiresTicket: false, requiresSerial: false },
];

// Usuarios de prueba con avatares de UI Faces
const users = [
  { clerkId: "user_mock_carlos", email: "carlos@test.com", firstName: "Carlos", lastName: "García", avatarUrl: "https://randomuser.me/api/portraits/men/32.jpg", country: "ES" },
  { clerkId: "user_mock_maria", email: "maria@test.com", firstName: "María", lastName: "López", avatarUrl: "https://randomuser.me/api/portraits/women/44.jpg", country: "ES" },
  { clerkId: "user_mock_ana", email: "ana@test.com", firstName: "Ana", lastName: "Martínez", avatarUrl: "https://randomuser.me/api/portraits/women/68.jpg", country: "ES" },
  { clerkId: "user_mock_david", email: "david@test.com", firstName: "David", lastName: "Fernández", avatarUrl: "https://randomuser.me/api/portraits/men/75.jpg", country: "ES" },
  { clerkId: "user_mock_laura", email: "laura@test.com", firstName: "Laura", lastName: "Sánchez", avatarUrl: "https://randomuser.me/api/portraits/women/90.jpg", country: "ES" },
];

// Productos de prueba con imágenes de alta calidad
const products = [
  {
    userIndex: 0,
    categorySlug: "smartphones",
    brand: "Apple",
    model: "iPhone 15 Pro",
    variant: "256GB Titanio Natural",
    condition: ProductCondition.LIKE_NEW,
    purchaseDate: new Date("2024-09-20"),
    purchasePrice: 1199,
    purchaseStore: "Apple Store",
    warrantyEndDate: new Date("2026-09-20"),
    photos: [
      "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&q=80",
      "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&q=80"
    ],
    accessories: { cargador: true, cable: true, caja: true },
  },
  {
    userIndex: 1,
    categorySlug: "laptops",
    brand: "Apple",
    model: "MacBook Air M2",
    variant: "13\" 8GB 256GB Medianoche",
    condition: ProductCondition.VERY_GOOD,
    purchaseDate: new Date("2023-06-15"),
    purchasePrice: 1299,
    purchaseStore: "MediaMarkt",
    warrantyEndDate: new Date("2025-06-15"),
    photos: ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80"],
    accessories: { cargador: true, caja: true },
  },
  {
    userIndex: 2,
    categorySlug: "consoles",
    brand: "Sony",
    model: "PlayStation 5",
    variant: "Digital Edition",
    condition: ProductCondition.GOOD,
    purchaseDate: new Date("2023-11-24"),
    purchasePrice: 449,
    purchaseStore: "Amazon",
    warrantyEndDate: new Date("2025-11-24"),
    photos: ["https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800&q=80"],
    accessories: { mando: true, cable_hdmi: true, caja: true },
  },
  {
    userIndex: 3,
    categorySlug: "audio",
    brand: "Sony",
    model: "WH-1000XM5",
    variant: "Negro",
    condition: ProductCondition.LIKE_NEW,
    purchaseDate: new Date("2024-03-10"),
    purchasePrice: 379,
    purchaseStore: "El Corte Inglés",
    warrantyEndDate: new Date("2026-03-10"),
    photos: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80"],
    accessories: { cable_audio: true, estuche: true, cargador: true },
  },
  {
    userIndex: 4,
    categorySlug: "wearables",
    brand: "Apple",
    model: "Apple Watch Series 9",
    variant: "45mm GPS Aluminio",
    condition: ProductCondition.NEW,
    purchaseDate: new Date("2024-10-01"),
    purchasePrice: 449,
    purchaseStore: "Apple Store",
    warrantyEndDate: new Date("2026-10-01"),
    photos: ["https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=800&q=80"],
    accessories: { correa_extra: true, cargador: true, caja: true },
  },
];

// Listings de prueba
const listings = [
  {
    productIndex: 0,
    title: "iPhone 15 Pro 256GB Titanio - Como nuevo",
    description: "iPhone 15 Pro en perfecto estado. Siempre con funda y protector de pantalla. Incluye todos los accesorios originales.",
    price: 899,
    location: "Madrid",
    latitude: 40.4168,
    longitude: -3.7038,
    shippingEnabled: true,
    shippingCost: 0,
    verificationLevel: VerificationLevel.LEVEL_2,
    hasVerifiedPurchase: true,
    hasValidWarranty: true,
    hasVerifiedAccessories: true,
    hasVerifiedIdentifier: true,
    status: ListingStatus.PUBLISHED,
    isBoosted: true,
    viewCount: 234,
    favoriteCount: 45,
  },
  {
    productIndex: 1,
    title: "MacBook Air M2 13\" Medianoche",
    description: "MacBook Air M2 en muy buen estado. Batería al 94%. Ideal para trabajo y estudios.",
    price: 849,
    location: "Barcelona",
    latitude: 41.3851,
    longitude: 2.1734,
    shippingEnabled: true,
    shippingCost: 15,
    verificationLevel: VerificationLevel.LEVEL_1,
    hasVerifiedPurchase: true,
    hasValidWarranty: true,
    hasVerifiedAccessories: true,
    hasVerifiedIdentifier: false,
    status: ListingStatus.PUBLISHED,
    isBoosted: false,
    viewCount: 156,
    favoriteCount: 23,
  },
  {
    productIndex: 2,
    title: "PS5 Digital Edition + Mando extra",
    description: "PlayStation 5 Digital Edition. Funciona perfectamente. Se vende porque apenas la uso.",
    price: 320,
    location: "Valencia",
    latitude: 39.4699,
    longitude: -0.3763,
    shippingEnabled: true,
    shippingCost: 20,
    verificationLevel: VerificationLevel.LEVEL_1,
    hasVerifiedPurchase: true,
    hasValidWarranty: true,
    hasVerifiedAccessories: true,
    hasVerifiedIdentifier: false,
    status: ListingStatus.PUBLISHED,
    isBoosted: false,
    viewCount: 89,
    favoriteCount: 12,
  },
  {
    productIndex: 3,
    title: "Sony WH-1000XM5 - Mejores auriculares",
    description: "Auriculares Sony XM5 como nuevos. Cancelación de ruido increíble. Incluye todos los accesorios.",
    price: 280,
    location: "Sevilla",
    latitude: 37.3891,
    longitude: -5.9845,
    shippingEnabled: true,
    shippingCost: 8,
    verificationLevel: VerificationLevel.LEVEL_1,
    hasVerifiedPurchase: true,
    hasValidWarranty: true,
    hasVerifiedAccessories: true,
    hasVerifiedIdentifier: false,
    status: ListingStatus.PUBLISHED,
    isBoosted: false,
    viewCount: 67,
    favoriteCount: 8,
  },
  {
    productIndex: 4,
    title: "Apple Watch Series 9 45mm GPS",
    description: "Apple Watch nuevo sin usar. Regalo duplicado. Precintado.",
    price: 380,
    location: "Bilbao",
    latitude: 43.2630,
    longitude: -2.9350,
    shippingEnabled: true,
    shippingCost: 0,
    verificationLevel: VerificationLevel.LEVEL_2,
    hasVerifiedPurchase: true,
    hasValidWarranty: true,
    hasVerifiedAccessories: true,
    hasVerifiedIdentifier: true,
    status: ListingStatus.PUBLISHED,
    isBoosted: true,
    viewCount: 145,
    favoriteCount: 32,
  },
];

async function main() {
  console.log("🌱 Seeding database...");

  // Limpiar datos existentes
  await prisma.alert.deleteMany();
  await prisma.priceHistory.deleteMany();
  await prisma.dispute.deleteMany();
  await prisma.order.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  console.log("✅ Cleaned existing data");

  // Crear categorías con IDs específicos
  const createdCategories: { [slug: string]: string } = {};
  for (const cat of categories) {
    const created = await prisma.category.create({ 
      data: {
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        icon: cat.icon,
        minPhotos: cat.minPhotos,
        requiresTicket: cat.requiresTicket,
        requiresSerial: cat.requiresSerial,
      }
    });
    createdCategories[cat.slug] = created.id; // Será igual a cat.id
    console.log(`  📁 Created category: ${cat.name} (${cat.id})`);
  }
  console.log(`✅ Created ${categories.length} categories`);

  // Crear usuarios
  const createdUsers: string[] = [];
  for (const user of users) {
    const created = await prisma.user.create({ data: user });
    createdUsers.push(created.id);
    console.log(`  👤 Created user: ${user.firstName} ${user.lastName}`);
  }
  console.log(`✅ Created ${users.length} users`);

  // Crear productos
  const createdProducts: string[] = [];
  for (const product of products) {
    const created = await prisma.product.create({
      data: {
        userId: createdUsers[product.userIndex],
        categoryId: createdCategories[product.categorySlug],
        brand: product.brand,
        model: product.model,
        variant: product.variant,
        condition: product.condition,
        purchaseDate: product.purchaseDate,
        purchasePrice: product.purchasePrice,
        purchaseStore: product.purchaseStore,
        warrantyEndDate: product.warrantyEndDate,
        photos: product.photos,
        accessories: product.accessories,
      },
    });
    createdProducts.push(created.id);
    console.log(`  📦 Created product: ${product.brand} ${product.model}`);
  }
  console.log(`✅ Created ${products.length} products`);

  // Crear listings
  for (const listing of listings) {
    const product = products[listing.productIndex];
    await prisma.listing.create({
      data: {
        productId: createdProducts[listing.productIndex],
        sellerId: createdUsers[product.userIndex],
        categoryId: createdCategories[product.categorySlug],
        title: listing.title,
        description: listing.description,
        price: listing.price,
        location: listing.location,
        latitude: listing.latitude,
        longitude: listing.longitude,
        shippingEnabled: listing.shippingEnabled,
        shippingCost: listing.shippingCost,
        verificationLevel: listing.verificationLevel,
        hasVerifiedPurchase: listing.hasVerifiedPurchase,
        hasValidWarranty: listing.hasValidWarranty,
        hasVerifiedAccessories: listing.hasVerifiedAccessories,
        hasVerifiedIdentifier: listing.hasVerifiedIdentifier,
        status: listing.status,
        photos: product.photos,
        isBoosted: listing.isBoosted,
        viewCount: listing.viewCount,
        favoriteCount: listing.favoriteCount,
        publishedAt: new Date(),
      },
    });
    console.log(`  🏷️ Created listing: ${listing.title}`);
  }
  console.log(`✅ Created ${listings.length} listings`);

  console.log("\n🎉 Seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
