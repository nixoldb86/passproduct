import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

// GET /api/db/orders - Get user's orders (buying + selling)
export async function GET(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json(
        { success: false, error: "No autorizado" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { clerkId },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // "buying" | "selling" | null (all)

    let whereClause: Record<string, unknown> = {};
    
    if (type === "buying") {
      whereClause = { buyerId: user.id };
    } else if (type === "selling") {
      whereClause = { sellerId: user.id };
    } else {
      // All orders where user is buyer OR seller
      whereClause = {
        OR: [{ buyerId: user.id }, { sellerId: user.id }],
      };
    }

    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        listing: {
          include: {
            product: true,
            category: true,
          },
        },
        buyer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
        seller: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Transform for frontend
    const transformedOrders = orders.map((order) => ({
      id: order.id,
      listingId: order.listingId,
      buyerId: order.buyerId,
      sellerId: order.sellerId,
      amount: Number(order.amount),
      shippingAmount: Number(order.shippingAmount),
      feeMarketplace: Number(order.feeMarketplace),
      feeProtection: Number(order.feeProtection),
      total: Number(order.total),
      sellerPayout: Number(order.sellerPayout),
      status: order.status,
      trackingNumber: order.trackingNumber,
      carrier: order.carrier,
      isLocalPickup: order.isLocalPickup,
      shippingAddress: order.shippingAddress,
      // Only show protection code to seller after ESCROW_HOLD
      protectionCode: order.sellerId === user.id && 
        ["ESCROW_HOLD", "SHIPPED", "DELIVERED"].includes(order.status) 
        ? order.protectionCode 
        : null,
      protectionCodeUsed: order.protectionCodeUsed,
      // Timestamps
      paidAt: order.paidAt,
      escrowAt: order.escrowAt,
      shippedAt: order.shippedAt,
      deliveredAt: order.deliveredAt,
      acceptedAt: order.acceptedAt,
      releasedAt: order.releasedAt,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      // Relations
      listing: order.listing ? {
        id: order.listing.id,
        title: order.listing.title,
        photos: order.listing.photos,
        price: Number(order.listing.price),
        category: order.listing.category,
      } : null,
      buyer: order.buyer,
      seller: order.seller,
      // Role helper
      isBuyer: order.buyerId === user.id,
      isSeller: order.sellerId === user.id,
    }));

    return NextResponse.json({
      success: true,
      orders: transformedOrders,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener pedidos" },
      { status: 500 }
    );
  }
}
