import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

// GET /api/db/orders/[id] - Get single order
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json(
        { success: false, error: "No autorizado" },
        { status: 401 }
      );
    }

    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { clerkId },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    const order = await prisma.order.findUnique({
      where: { id },
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
            clerkId: true,
          },
        },
        seller: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            clerkId: true,
          },
        },
        disputes: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Pedido no encontrado" },
        { status: 404 }
      );
    }

    // Check access - only buyer or seller can view
    const isBuyer = order.buyerId === user.id;
    const isSeller = order.sellerId === user.id;

    if (!isBuyer && !isSeller) {
      return NextResponse.json(
        { success: false, error: "No tienes acceso a este pedido" },
        { status: 403 }
      );
    }

    // Transform order
    const transformedOrder = {
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
      // Protection code: seller sees after ESCROW, buyer never sees (they input it)
      protectionCode: isSeller && ["ESCROW_HOLD", "SHIPPED", "DELIVERED"].includes(order.status)
        ? order.protectionCode
        : null,
      protectionCodeUsed: order.protectionCodeUsed,
      unboxingVideoUrl: order.unboxingVideoUrl,
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
        description: order.listing.description,
        photos: order.listing.photos,
        price: Number(order.listing.price),
        category: order.listing.category,
        product: order.listing.product,
      } : null,
      buyer: {
        ...order.buyer,
        clerkId: undefined, // Don't expose
      },
      seller: {
        ...order.seller,
        clerkId: undefined, // Don't expose
      },
      disputes: order.disputes,
      // Role helpers
      isBuyer,
      isSeller,
    };

    return NextResponse.json({
      success: true,
      order: transformedOrder,
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener el pedido" },
      { status: 500 }
    );
  }
}
