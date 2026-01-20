import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

// POST /api/db/orders/[id]/verify-code - Buyer verifies protection code
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
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json(
        { success: false, error: "El código es requerido" },
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

    // Verify buyer owns this order
    if (order.buyerId !== user.id) {
      return NextResponse.json(
        { success: false, error: "Solo el comprador puede verificar el código" },
        { status: 403 }
      );
    }

    // Verify order is in correct status
    if (order.status !== "DELIVERED") {
      return NextResponse.json(
        { success: false, error: `No se puede verificar el código en estado ${order.status}` },
        { status: 400 }
      );
    }

    // Check if code was already verified
    if (order.protectionCodeUsed) {
      return NextResponse.json(
        { success: false, error: "El código ya fue verificado" },
        { status: 400 }
      );
    }

    // Normalize code (uppercase, trim)
    const normalizedInput = code.toUpperCase().trim();
    const normalizedStored = (order.protectionCode || "").toUpperCase().trim();

    // Verify code matches
    const isValid = normalizedInput === normalizedStored;

    if (isValid) {
      // Update order - mark code as used
      await prisma.order.update({
        where: { id },
        data: {
          protectionCodeUsed: true,
          codeVerifiedAt: new Date(),
        },
      });

      console.log(`✅ Protection code verified for order ${id}`);

      return NextResponse.json({
        success: true,
        valid: true,
        message: "Código verificado correctamente",
      });
    } else {
      console.log(`❌ Invalid protection code for order ${id}: ${normalizedInput} !== ${normalizedStored}`);

      return NextResponse.json({
        success: true,
        valid: false,
        message: "El código no coincide. Revisa que lo hayas escrito correctamente.",
      });
    }
  } catch (error) {
    console.error("Error verifying code:", error);
    return NextResponse.json(
      { success: false, error: "Error al verificar el código" },
      { status: 500 }
    );
  }
}
