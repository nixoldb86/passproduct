import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

// GET - Obtener conversaciones del usuario
export async function GET() {
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
    });

    if (!user) {
      return NextResponse.json({ success: true, conversations: [] });
    }

    // Buscar conversaciones donde el usuario es comprador o vendedor
    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [
          { buyerId: user.id },
          { sellerId: user.id },
        ],
      },
      include: {
        listing: {
          include: {
            product: true,
          },
        },
        buyer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
        seller: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    // Transformar para el frontend
    const transformedConversations = conversations.map((conv) => ({
      id: conv.id,
      listingId: conv.listingId,
      listing: conv.listing ? {
        id: conv.listing.id,
        title: conv.listing.title,
        price: Number(conv.listing.price),
        photos: conv.listing.photos,
        product: conv.listing.product,
      } : null,
      buyer: conv.buyer,
      seller: conv.seller,
      currentOffer: conv.currentOffer ? Number(conv.currentOffer) : null,
      offerStatus: conv.offerStatus,
      lastMessage: conv.messages[0] ? {
        id: conv.messages[0].id,
        text: conv.messages[0].text,
        senderId: conv.messages[0].senderId,
        createdAt: conv.messages[0].createdAt,
        isOffer: conv.messages[0].isOffer,
        offerAmount: conv.messages[0].offerAmount ? Number(conv.messages[0].offerAmount) : null,
      } : null,
      unreadCount: 0, // TODO: calcular mensajes no leídos
      createdAt: conv.createdAt,
      updatedAt: conv.updatedAt,
      // Añadir el otro participante
      otherParticipant: user.id === conv.buyerId ? conv.seller : conv.buyer,
      isBuyer: user.id === conv.buyerId,
    }));

    return NextResponse.json({ success: true, conversations: transformedConversations });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener conversaciones" },
      { status: 500 }
    );
  }
}

// POST - Crear o obtener conversación existente
export async function POST(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    
    if (!clerkId) {
      return NextResponse.json(
        { success: false, error: "Debes iniciar sesión para contactar" },
        { status: 401 }
      );
    }

    const { listingId, initialMessage } = await request.json();

    if (!listingId) {
      return NextResponse.json(
        { success: false, error: "Se requiere el ID del anuncio" },
        { status: 400 }
      );
    }

    // Buscar usuario actual
    const user = await prisma.user.findUnique({
      where: { clerkId },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Buscar el listing
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: { seller: true },
    });

    if (!listing) {
      return NextResponse.json(
        { success: false, error: "Anuncio no encontrado" },
        { status: 404 }
      );
    }

    // No permitir contactar con uno mismo
    if (listing.sellerId === user.id) {
      return NextResponse.json(
        { success: false, error: "No puedes contactar contigo mismo" },
        { status: 400 }
      );
    }

    // Buscar conversación existente
    let conversation = await prisma.conversation.findFirst({
      where: {
        listingId,
        buyerId: user.id,
      },
      include: {
        listing: {
          include: { product: true },
        },
        buyer: {
          select: { id: true, firstName: true, lastName: true, avatarUrl: true },
        },
        seller: {
          select: { id: true, firstName: true, lastName: true, avatarUrl: true },
        },
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    // Si no existe, crear una nueva
    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          listingId,
          buyerId: user.id,
          sellerId: listing.sellerId,
        },
        include: {
          listing: {
            include: { product: true },
          },
          buyer: {
            select: { id: true, firstName: true, lastName: true, avatarUrl: true },
          },
          seller: {
            select: { id: true, firstName: true, lastName: true, avatarUrl: true },
          },
          messages: {
            orderBy: { createdAt: "asc" },
          },
        },
      });

      console.log(`💬 Nueva conversación creada: ${conversation.id}`);
    }

    // Si hay mensaje inicial, crearlo
    if (initialMessage) {
      const message = await prisma.message.create({
        data: {
          conversationId: conversation.id,
          senderId: user.id,
          text: initialMessage,
        },
      });

      // Actualizar updatedAt de la conversación
      await prisma.conversation.update({
        where: { id: conversation.id },
        data: { updatedAt: new Date() },
      });

      console.log(`📝 Mensaje enviado: ${message.id}`);
    }

    return NextResponse.json({ 
      success: true, 
      conversation: {
        ...conversation,
        otherParticipant: conversation.seller,
        isBuyer: true,
      },
    });
  } catch (error) {
    console.error("Error creating conversation:", error);
    return NextResponse.json(
      { success: false, error: "Error al crear conversación" },
      { status: 500 }
    );
  }
}
