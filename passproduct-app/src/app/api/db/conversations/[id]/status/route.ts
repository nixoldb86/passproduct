import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

// GET - Obtener estado de mensajes y presencia (para polling)
export async function GET(
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

    // Actualizar lastSeen del usuario actual
    await prisma.user.update({
      where: { id: user.id },
      data: { lastSeen: new Date() },
    });

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        buyer: {
          select: {
            id: true,
            lastSeen: true,
            showLastSeen: true,
            showReadReceipts: true,
          },
        },
        seller: {
          select: {
            id: true,
            lastSeen: true,
            showLastSeen: true,
            showReadReceipts: true,
          },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 50, // Últimos 50 mensajes
          select: {
            id: true,
            senderId: true,
            readAt: true,
            createdAt: true,
          },
        },
      },
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

    // Determinar el otro participante
    const otherParticipant = user.id === conversation.buyerId 
      ? conversation.seller 
      : conversation.buyer;

    // Preparar estado de mensajes (solo los que son míos)
    const messageStatuses = conversation.messages
      .filter(msg => msg.senderId === user.id)
      .map(msg => ({
        id: msg.id,
        readAt: otherParticipant.showReadReceipts !== false ? msg.readAt : null,
      }));

    // Verificar si hay mensajes nuevos del otro usuario (no leídos)
    const newMessagesCount = conversation.messages.filter(
      msg => msg.senderId !== user.id && !msg.readAt
    ).length;

    return NextResponse.json({
      success: true,
      status: {
        otherParticipant: {
          id: otherParticipant.id,
          lastSeen: otherParticipant.showLastSeen !== false 
            ? otherParticipant.lastSeen 
            : null,
          isOnline: otherParticipant.showLastSeen !== false && otherParticipant.lastSeen
            ? (Date.now() - new Date(otherParticipant.lastSeen).getTime()) < 5 * 60 * 1000 // 5 min
            : false,
        },
        messageStatuses,
        newMessagesCount,
      },
    });
  } catch (error) {
    console.error("Error fetching conversation status:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener estado" },
      { status: 500 }
    );
  }
}
