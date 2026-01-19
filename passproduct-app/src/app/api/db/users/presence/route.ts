import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

// POST - Actualizar lastSeen del usuario
export async function POST(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    
    if (!clerkId) {
      return NextResponse.json(
        { success: false, error: "No autorizado" },
        { status: 401 }
      );
    }

    const user = await prisma.user.update({
      where: { clerkId },
      data: { lastSeen: new Date() },
      select: { lastSeen: true },
    });

    return NextResponse.json({ success: true, lastSeen: user.lastSeen });
  } catch (error) {
    console.error("Error updating presence:", error);
    return NextResponse.json(
      { success: false, error: "Error al actualizar presencia" },
      { status: 500 }
    );
  }
}
