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

    // OPTIMIZACIÓN: Queries en paralelo en lugar de secuenciales
    const [user, conversation] = await Promise.all([
      prisma.user.findUnique({
        where: { clerkId },
      }),
      prisma.conversation.findUnique({
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
      }),
    ]);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

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

    // OPTIMIZACIÓN: Transacción para crear mensaje + actualizar conversación
    const senderName = user.firstName || "Alguien";
    const productTitle = conversation.listing?.title || "un producto";
    const truncatedMessage = text && text.length > 50 ? text.substring(0, 50) + "..." : text;

    const [message] = await prisma.$transaction([
      // Crear mensaje
      prisma.message.create({
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
      }),
      // Actualizar conversación
      prisma.conversation.update({
        where: { id: conversationId },
        data: isOffer && offerAmount
          ? { currentOffer: offerAmount, offerStatus: "pending", updatedAt: new Date() }
          : { updatedAt: new Date() },
      }),
      // Crear notificación (no crítico si falla)
      prisma.notification.create({
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
      }),
    ]);

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
