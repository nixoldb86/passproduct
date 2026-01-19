import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

// GET - Obtener configuración de privacidad
export async function GET(request: NextRequest) {
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
        showLastSeen: true,
        showReadReceipts: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, privacy: user });
  } catch (error) {
    console.error("Error fetching privacy settings:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener configuración" },
      { status: 500 }
    );
  }
}

// PUT - Actualizar configuración de privacidad
export async function PUT(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    
    if (!clerkId) {
      return NextResponse.json(
        { success: false, error: "No autorizado" },
        { status: 401 }
      );
    }

    const { showLastSeen, showReadReceipts } = await request.json();

    const user = await prisma.user.update({
      where: { clerkId },
      data: {
        ...(typeof showLastSeen === "boolean" && { showLastSeen }),
        ...(typeof showReadReceipts === "boolean" && { showReadReceipts }),
      },
      select: {
        showLastSeen: true,
        showReadReceipts: true,
      },
    });

    return NextResponse.json({ success: true, privacy: user });
  } catch (error) {
    console.error("Error updating privacy settings:", error);
    return NextResponse.json(
      { success: false, error: "Error al actualizar configuración" },
      { status: 500 }
    );
  }
}
