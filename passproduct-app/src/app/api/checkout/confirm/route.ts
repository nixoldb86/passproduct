import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json(
        { success: false, error: "No autorizado" },
        { status: 401 }
      );
    }

    const { orderId, paymentIntentId } = await request.json();

    if (!orderId || !paymentIntentId) {
      return NextResponse.json(
        { success: false, error: "orderId y paymentIntentId son requeridos" },
        { status: 400 }
      );
    }

    // Get the buyer
    const buyer = await prisma.user.findUnique({
      where: { clerkId },
    });

    if (!buyer) {
      return NextResponse.json(
        { success: false, error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Get the order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
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
    if (order.buyerId !== buyer.id) {
      return NextResponse.json(
        { success: false, error: "No tienes acceso a este pedido" },
        { status: 403 }
      );
    }

    // Verify payment intent matches
    if (order.stripePaymentIntentId !== paymentIntentId) {
      return NextResponse.json(
        { success: false, error: "Payment intent no coincide" },
        { status: 400 }
      );
    }

    // Retrieve payment intent from Stripe to verify status
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== "succeeded") {
      return NextResponse.json(
        { success: false, error: `Pago no completado: ${paymentIntent.status}` },
        { status: 400 }
      );
    }

    // Update order status to ESCROW_HOLD (payment received, waiting for shipment)
    const now = new Date();
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "ESCROW_HOLD",
        stripePaymentStatus: paymentIntent.status,
        paidAt: now,
        escrowAt: now,
      },
    });

    // Update listing status to RESERVED
    await prisma.listing.update({
      where: { id: order.listingId },
      data: { status: "RESERVED" },
    });

    // TODO: Send notifications to buyer and seller
    // - Buyer: "Tu pedido está confirmado"
    // - Seller: "Tienes una nueva venta - Prepara el envío"

    console.log(`✅ Payment confirmed for order ${orderId}, status: ESCROW_HOLD`);

    return NextResponse.json({
      success: true,
      order: {
        id: updatedOrder.id,
        status: updatedOrder.status,
        protectionCode: updatedOrder.protectionCode,
      },
    });
  } catch (error) {
    console.error("Error confirming payment:", error);
    return NextResponse.json(
      { success: false, error: "Error al confirmar el pago" },
      { status: 500 }
    );
  }
}
