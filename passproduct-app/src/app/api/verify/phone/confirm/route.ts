import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

// TEMPORAL: Código hardcodeado para testing (cambiar cuando se elija proveedor SMS)
const VALID_CODE = "0000";

// POST: Verificar código SMS (simulado)
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "No autenticado" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { phoneNumber, code } = body;

    if (!phoneNumber || !code) {
      return NextResponse.json(
        { success: false, error: "Teléfono y código requeridos" },
        { status: 400 }
      );
    }

    // TEMPORAL: Verificar código hardcodeado
    if (code !== VALID_CODE) {
      return NextResponse.json(
        { success: false, error: "Código incorrecto" },
        { status: 400 }
      );
    }

    // Formatear número
    const formattedPhone = phoneNumber.startsWith("+")
      ? phoneNumber
      : `+34${phoneNumber.replace(/\s/g, "")}`;

    // Guardar teléfono verificado en nuestra base de datos
    await prisma.user.update({
      where: { clerkId: userId },
      data: {
        phone: formattedPhone,
        phoneVerified: true,
      },
    });

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
