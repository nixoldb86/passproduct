import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

// POST - Marcar mensajes de una conversación como leídos
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: conversationId } = await params;
    const { userId: clerkId } = await auth();
    
    if (!clerkId) {
      return NextResponse.json(
        { success: false, error: "No autorizado" },
        { status: 401 }
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

    // Verificar que la conversación existe y el usuario es participante
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      return NextResponse.json(
        { success: false, error: "Conversación no encontrada" },
        { status: 404 }
      );
    }

    if (conversation.buyerId !== user.id && conversation.sellerId !== user.id) {
      return NextResponse.json(
        { success: false, error: "No tienes acceso a esta conversación" },
        { status: 403 }
      );
    }

    // Marcar como leídos todos los mensajes que NO son del usuario actual
    const result = await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: user.id }, // Solo mensajes del otro usuario
        readAt: null, // Solo los no leídos
      },
      data: {
        readAt: new Date(),
      },
    });

    // Actualizar lastSeen del usuario
    await prisma.user.update({
      where: { id: user.id },
      data: { lastSeen: new Date() },
    });

    return NextResponse.json({
      success: true,
      markedAsRead: result.count,
    });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    return NextResponse.json(
      { success: false, error: "Error al marcar mensajes" },
      { status: 500 }
    );
  }
}
