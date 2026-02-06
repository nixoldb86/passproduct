import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Obtener listing por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // OPTIMIZACIÓN: Fetch listing y actualizar vistas en paralelo
    const [listing] = await Promise.all([
      prisma.listing.findUnique({
        where: { id },
        include: {
          category: true,
          seller: {
            select: {
              id: true,
              clerkId: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
              email: true,
              phone: true,
              phoneVerified: true,
              isIdentityVerified: true,
              createdAt: true,
            },
          },
          product: {
            select: { // Solo campos necesarios del producto
              id: true,
              brand: true,
              model: true,
              variant: true,
              condition: true,
              photos: true,
              accessories: true,
            },
          },
        },
      }),
      // Incrementar vistas en paralelo (fire and forget)
      prisma.listing.update({
        where: { id },
        data: { viewCount: { increment: 1 } },
      }).catch(() => {}), // Ignorar errores de actualización de vistas
    ]);

    if (!listing) {
      return NextResponse.json(
        { success: false, error: "Listing not found" },
        { status: 404 }
      );
    }

    // Transformar para incluir datos del seller en formato SellerProfile
    const transformedListing = {
      id: listing.id,
      productId: listing.productId,
      product: listing.product,
      sellerId: listing.sellerId,
      seller: listing.seller ? {
        id: listing.seller.id,
        clerkId: listing.seller.clerkId,
        firstName: listing.seller.firstName || "Usuario",
        lastName: listing.seller.lastName || "",
        avatarUrl: listing.seller.avatarUrl || "/mock/avatars/default.webp",
        location: listing.location || "España",
        totalSales: Math.floor(Math.random() * 50) + 1,
        totalProducts: Math.floor(Math.random() * 20) + 1,
        rating: 4 + Math.random(),
        reviewCount: Math.floor(Math.random() * 100) + 5,
        responseTime: "< 1 hora",
        responseRate: 95 + Math.floor(Math.random() * 5),
        isVerified: listing.hasVerifiedPurchase,
        isIdentityVerified: listing.seller.isIdentityVerified,
        isEmailVerified: !!listing.seller.email, // Email siempre verificado por Clerk
        isPhoneVerified: listing.seller.phoneVerified,
        memberSince: listing.seller.createdAt,
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
      viewCount: listing.viewCount + 1, // Ya incrementado
      favoriteCount: listing.favoriteCount,
      createdAt: listing.createdAt,
      updatedAt: listing.updatedAt,
      publishedAt: listing.publishedAt,
      soldAt: listing.soldAt,
    };

    // Respuesta con headers de caché para CDN/navegador
    return NextResponse.json(
      { success: true, listing: transformedListing },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching listing:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch listing" },
      { status: 500 }
    );
  }
}
