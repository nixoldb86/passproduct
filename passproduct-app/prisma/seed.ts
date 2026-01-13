import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: "smartphones" },
      update: {},
      create: {
        name: "Smartphones",
        slug: "smartphones",
        icon: "📱",
        minPhotos: 3,
        requiresTicket: false,
        requiresSerial: true,
        attributeSchema: {
          storage: { type: "select", options: ["64GB", "128GB", "256GB", "512GB", "1TB"], required: true },
          color: { type: "text", required: false },
          carrier: { type: "select", options: ["Libre", "Movistar", "Vodafone", "Orange", "Otro"], required: false },
        },
      },
    }),
    prisma.category.upsert({
      where: { slug: "tablets" },
      update: {},
      create: {
        name: "Tablets",
        slug: "tablets",
        icon: "📲",
        minPhotos: 2,
        requiresTicket: false,
        requiresSerial: true,
        attributeSchema: {
          storage: { type: "select", options: ["64GB", "128GB", "256GB", "512GB", "1TB"], required: true },
          connectivity: { type: "select", options: ["WiFi", "WiFi + Cellular"], required: false },
        },
      },
    }),
    prisma.category.upsert({
      where: { slug: "laptops" },
      update: {},
      create: {
        name: "Portátiles",
        slug: "laptops",
        icon: "💻",
        minPhotos: 3,
        requiresTicket: false,
        requiresSerial: true,
        attributeSchema: {
          processor: { type: "text", required: false },
          ram: { type: "select", options: ["8GB", "16GB", "32GB", "64GB"], required: false },
          storage: { type: "text", required: false },
        },
      },
    }),
    prisma.category.upsert({
      where: { slug: "consoles" },
      update: {},
      create: {
        name: "Consolas",
        slug: "consoles",
        icon: "🎮",
        minPhotos: 2,
        requiresTicket: false,
        requiresSerial: true,
        attributeSchema: {
          edition: { type: "select", options: ["Standard", "Digital", "Pro", "Slim"], required: false },
          storage: { type: "text", required: false },
        },
      },
    }),
    prisma.category.upsert({
      where: { slug: "audio" },
      update: {},
      create: {
        name: "Audio",
        slug: "audio",
        icon: "🎧",
        minPhotos: 2,
        requiresTicket: false,
        requiresSerial: false,
        attributeSchema: {
          type: { type: "select", options: ["Over-ear", "In-ear", "Earbuds", "Altavoz"], required: false },
          wireless: { type: "boolean", required: false },
        },
      },
    }),
    prisma.category.upsert({
      where: { slug: "wearables" },
      update: {},
      create: {
        name: "Wearables",
        slug: "wearables",
        icon: "⌚",
        minPhotos: 2,
        requiresTicket: false,
        requiresSerial: true,
        attributeSchema: {
          size: { type: "text", required: false },
          connectivity: { type: "select", options: ["GPS", "GPS + Cellular"], required: false },
        },
      },
    }),
  ]);

  console.log(`✅ Created ${categories.length} categories`);

  // Create some price history data for value estimation
  const priceHistory = await Promise.all([
    prisma.priceHistory.create({
      data: {
        brand: "Apple",
        model: "iPhone 15 Pro",
        variant: "256GB",
        condition: "LIKE_NEW",
        minPrice: 950,
        avgPrice: 1050,
        maxPrice: 1150,
        source: "internal",
      },
    }),
    prisma.priceHistory.create({
      data: {
        brand: "Apple",
        model: "AirPods Pro",
        variant: "2ª generación",
        condition: "VERY_GOOD",
        minPrice: 160,
        avgPrice: 185,
        maxPrice: 210,
        source: "internal",
      },
    }),
    prisma.priceHistory.create({
      data: {
        brand: "Sony",
        model: "PlayStation 5",
        variant: "Digital Edition",
        condition: "GOOD",
        minPrice: 280,
        avgPrice: 320,
        maxPrice: 360,
        source: "internal",
      },
    }),
  ]);

  console.log(`✅ Created ${priceHistory.length} price history records`);

  console.log("✨ Seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
