import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

// GET: Verificar si el usuario tiene teléfono verificado
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "No autenticado" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { phone: true, phoneVerified: true },
    });

    return NextResponse.json({
      success: true,
      phoneVerified: user?.phoneVerified || false,
      phone: user?.phone || null,
    });
  } catch (error) {
    console.error("Error checking phone status:", error);
    
    return NextResponse.json(
      { success: false, error: "Error al verificar estado del teléfono" },
      { status: 500 }
    );
  }
}
