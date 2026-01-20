import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

// POST /api/db/orders/[id]/deliver - Mark order as delivered
// Can be called by buyer (manual confirmation) or by system (tracking webhook)
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
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Pedido no encontrado" },
        { status: 404 }
      );
    }

    // Verify user is buyer or seller
    const isBuyer = order.buyerId === user.id;
    const isSeller = order.sellerId === user.id;

    if (!isBuyer && !isSeller) {
      return NextResponse.json(
        { success: false, error: "No tienes acceso a este pedido" },
        { status: 403 }
      );
    }

    // Verify order is in correct status
    if (order.status !== "SHIPPED" && order.status !== "HANDED_OVER") {
      return NextResponse.json(
        { success: false, error: `No se puede marcar como entregado un pedido en estado ${order.status}` },
        { status: 400 }
      );
    }

    // Update order
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status: "DELIVERED",
        deliveredAt: new Date(),
      },
    });

    // TODO: Send notification to buyer
    // "Tu pedido ha sido entregado - Abre el paquete grabando y verifica el código"

    console.log(`📬 Order ${id} marked as delivered`);

    return NextResponse.json({
      success: true,
      order: {
        id: updatedOrder.id,
        status: updatedOrder.status,
        deliveredAt: updatedOrder.deliveredAt,
      },
    });
  } catch (error) {
    console.error("Error marking order as delivered:", error);
    return NextResponse.json(
      { success: false, error: "Error al marcar como entregado" },
      { status: 500 }
    );
  }
}
