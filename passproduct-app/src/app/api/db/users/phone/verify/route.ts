import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

// POST - Verify phone with code
export async function POST(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    
    if (!clerkId) {
      return NextResponse.json(
        { success: false, error: "No autorizado" },
        { status: 401 }
      );
    }

    const { code } = await request.json();
    
    if (!code || code.length !== 6) {
      return NextResponse.json(
        { success: false, error: "Código inválido" },
        { status: 400 }
      );
    }

    // Get user with verification info
    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: {
        id: true,
        phone: true,
        phoneVerificationCode: true,
        phoneVerificationExpiry: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    if (!user.phoneVerificationCode) {
      return NextResponse.json(
        { success: false, error: "No hay código de verificación pendiente" },
        { status: 400 }
      );
    }

    // Check if code has expired
    if (user.phoneVerificationExpiry && new Date() > user.phoneVerificationExpiry) {
      return NextResponse.json(
        { success: false, error: "El código ha expirado. Solicita uno nuevo." },
        { status: 400 }
      );
    }

    // Verify code
    if (user.phoneVerificationCode !== code) {
      return NextResponse.json(
        { success: false, error: "Código incorrecto" },
        { status: 400 }
      );
    }

    // Code is correct - mark phone as verified
    await prisma.user.update({
      where: { id: user.id },
      data: {
        phoneVerified: true,
        phoneVerificationCode: null,
        phoneVerificationExpiry: null,
      },
    });

    console.log(`✅ Phone verified for user ${clerkId}: ${user.phone}`);

    return NextResponse.json({
      success: true,
      message: "Teléfono verificado correctamente",
    });
  } catch (error) {
    console.error("Error verifying phone:", error);
    return NextResponse.json(
      { success: false, error: "Error al verificar el teléfono" },
      { status: 500 }
    );
  }
}
