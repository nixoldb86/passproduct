import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

// POST - Enviar mensaje
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

    const { text, isOffer, offerAmount } = await request.json();

    if (!text && !isOffer) {
      return NextResponse.json(
        { success: false, error: "El mensaje no puede estar vacío" },
        { status: 400 }
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
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            photos: true,
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

    // Determinar el receptor del mensaje
    const recipientId = conversation.buyerId === user.id 
      ? conversation.sellerId 
      : conversation.buyerId;

    // Crear mensaje
    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId: user.id,
        text: text || (isOffer ? `Oferta: ${offerAmount}€` : ""),
        isOffer: isOffer || false,
        offerAmount: isOffer && offerAmount ? offerAmount : null,
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Si es una oferta, actualizar la conversación
    if (isOffer && offerAmount) {
      await prisma.conversation.update({
        where: { id: conversationId },
        data: {
          currentOffer: offerAmount,
          offerStatus: "pending",
          updatedAt: new Date(),
        },
      });
    } else {
      // Solo actualizar updatedAt
      await prisma.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
      });
    }

    // Crear notificación para el receptor
    const senderName = user.firstName || "Alguien";
    const productTitle = conversation.listing?.title || "un producto";
    const truncatedMessage = text && text.length > 50 ? text.substring(0, 50) + "..." : text;
    
    try {
      await prisma.notification.create({
        data: {
          userId: recipientId,
          type: "MESSAGE",
          title: isOffer 
            ? `${senderName} te ha hecho una oferta`
            : `${senderName} te ha escrito`,
          message: isOffer 
            ? `Oferta de ${offerAmount}€ por ${productTitle}`
            : truncatedMessage || "Nuevo mensaje",
          fromUserId: user.id,
          conversationId: conversationId,
          listingId: conversation.listing?.id,
          imageUrl: user.avatarUrl || conversation.listing?.photos?.[0],
          actionUrl: `/chat?conversation=${conversationId}`,
        },
      });
    } catch (notifError) {
      console.error("Error creating notification:", notifError);
      // No fallar la petición por error en notificación
    }

    return NextResponse.json({
      success: true,
      message: {
        id: message.id,
        text: message.text,
        senderId: message.senderId,
        sender: message.sender,
        isOffer: message.isOffer,
        offerAmount: message.offerAmount ? Number(message.offerAmount) : null,
        isSystemMessage: message.isSystemMessage,
        readAt: message.readAt,
        createdAt: message.createdAt,
        isOwn: true,
      },
    });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { success: false, error: "Error al enviar mensaje" },
      { status: 500 }
    );
  }
}
