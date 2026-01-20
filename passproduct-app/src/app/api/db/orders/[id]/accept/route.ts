import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
// import { stripe } from "@/lib/stripe"; // Uncomment when ready to release real payments

// POST /api/db/orders/[id]/accept - Buyer accepts order and releases payment
export async function POST(
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
        listing: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Pedido no encontrado" },
        { status: 404 }
      );
    }

    // Verify buyer owns this order
    if (order.buyerId !== user.id) {
      return NextResponse.json(
        { success: false, error: "Solo el comprador puede aceptar el pedido" },
        { status: 403 }
      );
    }

    // Verify order is in correct status
    if (order.status !== "DELIVERED") {
      return NextResponse.json(
        { success: false, error: `No se puede aceptar un pedido en estado ${order.status}` },
        { status: 400 }
      );
    }

    // Recommended: Verify protection code was used (but not strictly required)
    if (!order.protectionCodeUsed) {
      console.warn(`⚠️ Order ${id} accepted without protection code verification`);
    }

    const now = new Date();

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status: "ACCEPTED",
        acceptedAt: now,
      },
    });

    // Update listing status to SOLD
    await prisma.listing.update({
      where: { id: order.listingId },
      data: { status: "SOLD" },
    });

    // TODO: Release payment to seller via Stripe
    // In real implementation:
    // 1. If using Stripe Connect: Transfer funds to seller's connected account
    // 2. If using manual payouts: Record the payout to be processed
    
    // For now, we'll mark as RELEASED immediately (simulate instant payout)
    const releasedOrder = await prisma.order.update({
      where: { id },
      data: {
        status: "RELEASED",
        releasedAt: now,
      },
    });

    // TODO: Send notifications
    // - Buyer: "Gracias por tu compra - Disfruta tu producto"
    // - Seller: "Venta completada - Recibirás el pago en X días"

    console.log(`🎉 Order ${id} accepted and payment released`);

    return NextResponse.json({
      success: true,
      order: {
        id: releasedOrder.id,
        status: releasedOrder.status,
        acceptedAt: releasedOrder.acceptedAt,
        releasedAt: releasedOrder.releasedAt,
        sellerPayout: Number(releasedOrder.sellerPayout),
      },
      message: "Pedido completado. El vendedor recibirá el pago.",
    });
  } catch (error) {
    console.error("Error accepting order:", error);
    return NextResponse.json(
      { success: false, error: "Error al aceptar el pedido" },
      { status: 500 }
    );
  }
}
