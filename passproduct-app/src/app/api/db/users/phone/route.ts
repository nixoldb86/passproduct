import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

// PUT - Save phone number and send verification code
export async function PUT(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    
    if (!clerkId) {
      return NextResponse.json(
        { success: false, error: "No autorizado" },
        { status: 401 }
      );
    }

    const { phone } = await request.json();
    
    if (!phone) {
      return NextResponse.json(
        { success: false, error: "Teléfono requerido" },
        { status: 400 }
      );
    }

    // Clean and validate phone number
    const cleanedPhone = phone.replace(/\D/g, "");
    if (cleanedPhone.length < 9) {
      return NextResponse.json(
        { success: false, error: "Número de teléfono inválido" },
        { status: 400 }
      );
    }

    // Generate 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const codeExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Update user with phone and verification code
    const user = await prisma.user.update({
      where: { clerkId },
      data: {
        phone: cleanedPhone,
        phoneVerified: false,
        phoneVerificationCode: verificationCode,
        phoneVerificationExpiry: codeExpiry,
      },
    });

    // TODO: Send SMS with verification code
    // For now, we'll log it (in production, integrate with Twilio or similar)
    console.log(`📱 Verification code for ${cleanedPhone}: ${verificationCode}`);

    return NextResponse.json({
      success: true,
      message: "Código de verificación enviado",
      // In development, return the code for testing
      ...(process.env.NODE_ENV === "development" && { devCode: verificationCode }),
    });
  } catch (error) {
    console.error("Error saving phone:", error);
    return NextResponse.json(
      { success: false, error: "Error al guardar el teléfono" },
      { status: 500 }
    );
  }
}

// GET - Get phone info
export async function GET() {
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
      select: {
        phone: true,
        phoneVerified: true,
      },
    });

    return NextResponse.json({
      success: true,
      phone: user?.phone || null,
      isVerified: user?.phoneVerified || false,
    });
  } catch (error) {
    console.error("Error fetching phone:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener el teléfono" },
      { status: 500 }
    );
  }
}
