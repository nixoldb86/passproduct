import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

// Coordenadas de ciudades españolas
const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  "Madrid": { lat: 40.4168, lng: -3.7038 },
  "Barcelona": { lat: 41.3851, lng: 2.1734 },
  "Valencia": { lat: 39.4699, lng: -0.3763 },
  "Sevilla": { lat: 37.3891, lng: -5.9845 },
  "Bilbao": { lat: 43.2630, lng: -2.9350 },
  "Málaga": { lat: 36.7213, lng: -4.4214 },
  "Zaragoza": { lat: 41.6488, lng: -0.8891 },
  "Murcia": { lat: 37.9922, lng: -1.1307 },
};

// POST - Crear nuevo listing
export async function POST(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    
    if (!clerkId) {
      return NextResponse.json(
        { success: false, error: "Debes iniciar sesión para vender" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      productId,
      title,
      description,
      price,
      location,
      shippingEnabled,
      shippingCost,
      photos,
    } = body;

    // Validar campos requeridos
    if (!productId || !title || !price) {
      return NextResponse.json(
        { success: false, error: "Producto, título y precio son requeridos" },
        { status: 400 }
      );
    }

    // Buscar usuario
    const user = await prisma.user.findUnique({
      where: { clerkId },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Verificar que el producto existe y pertenece al usuario
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { category: true },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Producto no encontrado" },
        { status: 404 }
      );
    }

    if (product.userId !== user.id) {
      return NextResponse.json(
        { success: false, error: "No tienes permiso para vender este producto" },
        { status: 403 }
      );
    }

    // Verificar que el producto no esté ya en venta
    const existingListing = await prisma.listing.findFirst({
      where: {
        productId,
        status: { in: ["DRAFT", "PUBLISHED", "RESERVED"] },
      },
    });

    if (existingListing) {
      return NextResponse.json(
        { success: false, error: "Este producto ya está en venta" },
        { status: 400 }
      );
    }

    // Calcular nivel de verificación
    let verificationLevel: "LEVEL_0" | "LEVEL_1" | "LEVEL_2" = "LEVEL_0";
    if (product.proofOfPurchaseUrl) {
      verificationLevel = "LEVEL_1";
      if (product.imeiLast4 || product.serialLast4) {
        verificationLevel = "LEVEL_2";
      }
    }

    // Obtener coordenadas de la ubicación
    const coords = CITY_COORDS[location] || CITY_COORDS["Madrid"];

    // Crear listing
    const listing = await prisma.listing.create({
      data: {
        productId,
        sellerId: user.id,
        categoryId: product.categoryId,
        title,
        description: description || "",
        price: parseFloat(price),
        location: location || "España",
        latitude: coords.lat,
        longitude: coords.lng,
        shippingEnabled: shippingEnabled ?? true,
        shippingCost: shippingEnabled && shippingCost ? parseFloat(shippingCost) : null,
        verificationLevel,
        hasVerifiedPurchase: !!product.proofOfPurchaseUrl,
        hasValidWarranty: product.warrantyEndDate 
          ? new Date(product.warrantyEndDate) > new Date() 
          : false,
        hasVerifiedAccessories: !!product.accessories,
        hasVerifiedIdentifier: !!(product.imeiLast4 || product.serialLast4),
        status: "PUBLISHED",
        photos: photos || product.photos || [],
        publishedAt: new Date(),
      },
      include: {
        category: true,
        seller: true,
        product: {
          include: { category: true },
        },
      },
    });

    console.log(`✅ Listing creado: ${listing.id} - ${title}`);

    return NextResponse.json({ success: true, listing });
  } catch (error) {
    console.error("Error creating listing:", error);
    return NextResponse.json(
      { success: false, error: "Error al crear el anuncio" },
      { status: 500 }
    );
  }
}

// GET - Obtener listings publicados (marketplace)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categorySlug = searchParams.get("category");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const hasWarranty = searchParams.get("hasWarranty");
    const search = searchParams.get("search");
    const sortBy = searchParams.get("sortBy") || "recent";
    const productId = searchParams.get("productId");

    // Construir filtros
    const where: Record<string, unknown> = {};
    
    // Si se busca por productId, incluir todos los estados activos
    if (productId) {
      console.log("🔍 Searching listings for productId:", productId);
      where.productId = productId;
      where.status = { in: ["DRAFT", "PUBLISHED", "RESERVED"] };
    } else {
      // Por defecto solo mostrar publicados
      where.status = "PUBLISHED";
    }

    // Filtro por categoría
    if (categorySlug && categorySlug !== "all") {
      const category = await prisma.category.findUnique({
        where: { slug: categorySlug },
      });
      if (category) {
        where.categoryId = category.id;
      }
    }

    // Filtro por precio
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) (where.price as Record<string, number>).gte = parseFloat(minPrice);
      if (maxPrice) (where.price as Record<string, number>).lte = parseFloat(maxPrice);
    }

    // Filtro por garantía
    if (hasWarranty === "true") {
      where.hasValidWarranty = true;
    }

    // Filtro por búsqueda
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    // Ordenación
    let orderBy: Record<string, string> = { createdAt: "desc" };
    switch (sortBy) {
      case "oldest":
        orderBy = { createdAt: "asc" };
        break;
      case "price_asc":
        orderBy = { price: "asc" };
        break;
      case "price_desc":
        orderBy = { price: "desc" };
        break;
    }

    const listings = await prisma.listing.findMany({
      where,
      include: {
        category: true,
        seller: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
        product: {
          include: { category: true },
        },
      },
      orderBy,
    });

    // Transformar para incluir datos del seller en formato SellerProfile
    const transformedListings = listings.map((listing) => ({
      id: listing.id,
      productId: listing.productId,
      product: listing.product,
      sellerId: listing.sellerId,
      seller: listing.seller ? {
        id: listing.seller.id,
        firstName: listing.seller.firstName || "Usuario",
        lastName: listing.seller.lastName || "",
        avatarUrl: listing.seller.avatarUrl || "/mock/avatars/default.webp",
        // Datos mock para el perfil completo
        location: listing.location || "España",
        totalSales: Math.floor(Math.random() * 50) + 1,
        totalProducts: Math.floor(Math.random() * 20) + 1,
        rating: 4 + Math.random(),
        reviewCount: Math.floor(Math.random() * 100) + 5,
        responseTime: "< 1 hora",
        responseRate: 95 + Math.floor(Math.random() * 5),
        isVerified: listing.hasVerifiedPurchase,
        isIdentityVerified: listing.hasVerifiedIdentifier,
        hasPhoneVerified: true,
        memberSince: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
        lastActive: new Date(),
      } : null,
      categoryId: listing.categoryId,
      category: listing.category,
      title: listing.title,
      description: listing.description,
      price: Number(listing.price),
      location: listing.location,
      latitude: listing.latitude ? Number(listing.latitude) : null,
      longitude: listing.longitude ? Number(listing.longitude) : null,
      shippingEnabled: listing.shippingEnabled,
      shippingCost: listing.shippingCost ? Number(listing.shippingCost) : null,
      verificationLevel: listing.verificationLevel,
      hasVerifiedPurchase: listing.hasVerifiedPurchase,
      hasValidWarranty: listing.hasValidWarranty,
      hasVerifiedAccessories: listing.hasVerifiedAccessories,
      hasVerifiedIdentifier: listing.hasVerifiedIdentifier,
      status: listing.status,
      photos: listing.photos,
      isBoosted: listing.isBoosted,
      boostedUntil: listing.boostedUntil,
      viewCount: listing.viewCount,
      favoriteCount: listing.favoriteCount,
      createdAt: listing.createdAt,
      updatedAt: listing.updatedAt,
      publishedAt: listing.publishedAt,
      soldAt: listing.soldAt,
    }));

    if (productId) {
      console.log(`📦 Found ${transformedListings.length} listings for productId ${productId}:`, 
        transformedListings.map(l => ({ id: l.id, status: l.status }))
      );
    }
    
    return NextResponse.json({ success: true, listings: transformedListings });
  } catch (error) {
    console.error("Error fetching listings:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch listings" },
      { status: 500 }
    );
  }
}
