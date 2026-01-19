import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

// GET - Obtener conversación con mensajes
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: {
        listing: {
          include: {
            product: true,
            category: true,
          },
        },
        buyer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            lastSeen: true,
            showLastSeen: true,
            showReadReceipts: true,
          },
        },
        seller: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            lastSeen: true,
            showLastSeen: true,
            showReadReceipts: true,
          },
        },
        messages: {
          orderBy: { createdAt: "asc" },
          include: {
            sender: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
                showReadReceipts: true,
              },
            },
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

    // Verificar que el usuario es participante
    if (conversation.buyerId !== user.id && conversation.sellerId !== user.id) {
      return NextResponse.json(
        { success: false, error: "No tienes acceso a esta conversación" },
        { status: 403 }
      );
    }

    // Marcar mensajes como leídos
    await prisma.message.updateMany({
      where: {
        conversationId: id,
        senderId: { not: user.id },
        readAt: null,
      },
      data: {
        readAt: new Date(),
      },
    });

    // Obtener el otro participante
    const otherParticipant = user.id === conversation.buyerId 
      ? conversation.seller 
      : conversation.buyer;

    // Transformar mensajes - solo mostrar readAt si el receptor permite ver confirmaciones de lectura
    const transformedMessages = conversation.messages.map((msg) => {
      const isOwn = msg.senderId === user.id;
      // Si es un mensaje propio, verificar si el otro participante permite mostrar confirmaciones de lectura
      // Si es un mensaje del otro, siempre podemos mostrar si lo hemos leído
      const canShowReadReceipt = isOwn 
        ? otherParticipant.showReadReceipts !== false
        : true;
      
      return {
        id: msg.id,
        text: msg.text,
        senderId: msg.senderId,
        sender: {
          id: msg.sender.id,
          firstName: msg.sender.firstName,
          lastName: msg.sender.lastName,
          avatarUrl: msg.sender.avatarUrl,
        },
        isOffer: msg.isOffer,
        offerAmount: msg.offerAmount ? Number(msg.offerAmount) : null,
        isSystemMessage: msg.isSystemMessage,
        readAt: canShowReadReceipt ? msg.readAt : null,
        createdAt: msg.createdAt,
        isOwn,
      };
    });

    // Preparar lastSeen del otro participante (solo si tiene habilitado showLastSeen)
    const otherLastSeen = otherParticipant.showLastSeen !== false 
      ? otherParticipant.lastSeen 
      : null;

    return NextResponse.json({
      success: true,
      conversation: {
        id: conversation.id,
        listing: conversation.listing ? {
          id: conversation.listing.id,
          title: conversation.listing.title,
          price: Number(conversation.listing.price),
          photos: conversation.listing.photos,
          status: conversation.listing.status,
          product: conversation.listing.product,
        } : null,
        buyer: {
          id: conversation.buyer.id,
          firstName: conversation.buyer.firstName,
          lastName: conversation.buyer.lastName,
          avatarUrl: conversation.buyer.avatarUrl,
        },
        seller: {
          id: conversation.seller.id,
          firstName: conversation.seller.firstName,
          lastName: conversation.seller.lastName,
          avatarUrl: conversation.seller.avatarUrl,
        },
        currentOffer: conversation.currentOffer ? Number(conversation.currentOffer) : null,
        offerStatus: conversation.offerStatus,
        messages: transformedMessages,
        otherParticipant: {
          id: otherParticipant.id,
          firstName: otherParticipant.firstName,
          lastName: otherParticipant.lastName,
          avatarUrl: otherParticipant.avatarUrl,
          lastSeen: otherLastSeen,
          showReadReceipts: otherParticipant.showReadReceipts,
        },
        isBuyer: user.id === conversation.buyerId,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error fetching conversation:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener conversación" },
      { status: 500 }
    );
  }
}
