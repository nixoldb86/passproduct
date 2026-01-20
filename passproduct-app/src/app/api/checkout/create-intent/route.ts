import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { stripe, generateProtectionCode, calculateOrderFees } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json(
        { success: false, error: "No autorizado" },
        { status: 401 }
      );
    }

    const { listingId, shippingAddress, hasProtection = true } = await request.json();

    if (!listingId) {
      return NextResponse.json(
        { success: false, error: "listingId es requerido" },
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

    // Get the listing with seller info
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: {
        seller: true,
        product: true,
      },
    });

    if (!listing) {
      return NextResponse.json(
        { success: false, error: "Anuncio no encontrado" },
        { status: 404 }
      );
    }

    // Verify listing is available
    if (listing.status !== "PUBLISHED") {
      return NextResponse.json(
        { success: false, error: "Este anuncio ya no está disponible" },
        { status: 400 }
      );
    }

    // Prevent buying own product
    if (listing.sellerId === buyer.id) {
      return NextResponse.json(
        { success: false, error: "No puedes comprar tu propio producto" },
        { status: 400 }
      );
    }

    // Check if there's already a pending order for this listing by this buyer
    const existingOrder = await prisma.order.findFirst({
      where: {
        listingId,
        buyerId: buyer.id,
        status: { in: ["CREATED", "PAID", "ESCROW_HOLD"] },
      },
    });

    if (existingOrder) {
      return NextResponse.json(
        { success: false, error: "Ya tienes un pedido pendiente para este producto", orderId: existingOrder.id },
        { status: 400 }
      );
    }

    // Calculate fees
    const price = Number(listing.price);
    const shippingCost = listing.shippingEnabled ? Number(listing.shippingCost || 0) : 0;
    const fees = calculateOrderFees(price, shippingCost, hasProtection);

    // Generate protection code
    const protectionCode = generateProtectionCode();

    // Create Stripe PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(fees.total * 100), // Stripe uses cents
      currency: "eur",
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        listingId,
        buyerId: buyer.id,
        sellerId: listing.sellerId,
        protectionCode,
      },
      description: `PassProduct: ${listing.title}`,
    });

    // Create Order in database
    const order = await prisma.order.create({
      data: {
        listingId,
        buyerId: buyer.id,
        sellerId: listing.sellerId,
        amount: fees.amount,
        shippingAmount: fees.shippingAmount,
        feeMarketplace: fees.feeMarketplace,
        feeProtection: fees.feeProtection,
        total: fees.total,
        sellerPayout: fees.sellerPayout,
        status: "CREATED",
        stripePaymentIntentId: paymentIntent.id,
        stripePaymentStatus: paymentIntent.status,
        protectionCode,
        shippingAddress: shippingAddress || null,
        isLocalPickup: !listing.shippingEnabled,
      },
    });

    console.log(`✅ Order created: ${order.id} for listing ${listingId}`);

    return NextResponse.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      orderId: order.id,
      fees,
    });
  } catch (error) {
    console.error("Error creating checkout:", error);
    return NextResponse.json(
      { success: false, error: "Error al crear el checkout" },
      { status: 500 }
    );
  }
}
