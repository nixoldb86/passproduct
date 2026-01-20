import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

// POST /api/db/orders/[id]/ship - Seller marks order as shipped
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
    const { carrier, trackingNumber } = await request.json();

    if (!carrier) {
      return NextResponse.json(
        { success: false, error: "El transportista es requerido" },
        { status: 400 }
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

    const order = await prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Pedido no encontrado" },
        { status: 404 }
      );
    }

    // Verify seller owns this order
    if (order.sellerId !== user.id) {
      return NextResponse.json(
        { success: false, error: "Solo el vendedor puede marcar como enviado" },
        { status: 403 }
      );
    }

    // Verify order is in correct status
    if (order.status !== "ESCROW_HOLD") {
      return NextResponse.json(
        { success: false, error: `No se puede enviar un pedido en estado ${order.status}` },
        { status: 400 }
      );
    }

    // Update order
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status: "SHIPPED",
        carrier,
        trackingNumber: trackingNumber || null,
        shippedAt: new Date(),
      },
    });

    // TODO: Send notification to buyer
    // "Tu pedido ha sido enviado - Tracking: XXX"

    console.log(`📦 Order ${id} shipped by seller, carrier: ${carrier}`);

    return NextResponse.json({
      success: true,
      order: {
        id: updatedOrder.id,
        status: updatedOrder.status,
        carrier: updatedOrder.carrier,
        trackingNumber: updatedOrder.trackingNumber,
        shippedAt: updatedOrder.shippedAt,
      },
    });
  } catch (error) {
    console.error("Error marking order as shipped:", error);
    return NextResponse.json(
      { success: false, error: "Error al marcar como enviado" },
      { status: 500 }
    );
  }
}
