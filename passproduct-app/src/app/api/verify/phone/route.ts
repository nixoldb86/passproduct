import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

// TEMPORAL: Código hardcodeado para testing (cambiar cuando se elija proveedor SMS)
const VALID_CODE = "0000";

// POST: "Enviar" código de verificación (simulado)
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
    const { phoneNumber } = body;

    if (!phoneNumber) {
      return NextResponse.json(
        { success: false, error: "Número de teléfono requerido" },
        { status: 400 }
      );
    }

    // Formatear número
    const formattedPhone = phoneNumber.startsWith("+")
      ? phoneNumber
      : `+34${phoneNumber.replace(/\s/g, "")}`;

    // Validar formato básico (solo números después del prefijo)
    const phoneDigits = formattedPhone.replace(/^\+34/, "").replace(/\s/g, "");
    if (!/^\d{9}$/.test(phoneDigits)) {
      return NextResponse.json(
        { success: false, error: "Número de teléfono inválido. Usa 9 dígitos: 612345678" },
        { status: 400 }
      );
    }

    // Verificar si el usuario ya tiene este teléfono verificado en nuestra BD
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { phone: true, phoneVerified: true },
    });

    if (user?.phone === formattedPhone && user?.phoneVerified) {
      return NextResponse.json({
        success: true,
        alreadyVerified: true,
        message: "Este teléfono ya está verificado",
      });
    }

    // TEMPORAL: Simular envío de SMS (en producción, aquí iría el proveedor real)
    console.log(`[SMS SIMULADO] Enviando código ${VALID_CODE} a ${formattedPhone}`);

    return NextResponse.json({
      success: true,
      phoneNumber: formattedPhone,
      codeSent: true,
      // TEMPORAL: En desarrollo, mostrar hint del código
      hint: process.env.NODE_ENV === "development" ? "Código de prueba: 0000" : undefined,
      message: "Código enviado por SMS",
    });
  } catch (error) {
    console.error("Error processing phone number:", error);
    
    return NextResponse.json(
      { success: false, error: "Error al procesar el teléfono. Inténtalo de nuevo." },
      { status: 500 }
    );
  }
}
