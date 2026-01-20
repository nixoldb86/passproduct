import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

// GET - Obtener notificaciones del usuario
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
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Obtener parámetros de query
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const unreadOnly = searchParams.get("unreadOnly") === "true";
    const since = searchParams.get("since"); // Para polling eficiente

    // Construir query
    const whereClause: Record<string, unknown> = {
      userId: user.id,
    };

    if (unreadOnly) {
      whereClause.isRead = false;
    }

    // Si viene "since", solo devolver notificaciones más recientes
    if (since) {
      whereClause.createdAt = {
        gt: new Date(since),
      };
    }

    const notifications = await prisma.notification.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    // Contar no leídas
    const unreadCount = await prisma.notification.count({
      where: {
        userId: user.id,
        isRead: false,
      },
    });

    return NextResponse.json({
      success: true,
      notifications: notifications.map((n) => ({
        id: n.id,
        userId: n.userId,
        type: n.type.toLowerCase(),
        title: n.title,
        message: n.message,
        fromUserId: n.fromUserId,
        listingId: n.listingId,
        conversationId: n.conversationId,
        orderId: n.orderId,
        imageUrl: n.imageUrl,
        actionUrl: n.actionUrl,
        isRead: n.isRead,
        readAt: n.readAt,
        createdAt: n.createdAt,
      })),
      unreadCount,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener notificaciones" },
      { status: 500 }
    );
  }
}

// POST - Crear notificación (uso interno)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      type,
      title,
      message,
      fromUserId,
      listingId,
      conversationId,
      orderId,
      imageUrl,
      actionUrl,
    } = body;

    if (!userId || !type || !title || !message) {
      return NextResponse.json(
        { success: false, error: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    // Mapear tipo de string a enum
    const typeMap: Record<string, "NEW_LISTING" | "PRICE_DROP" | "NEW_FOLLOWER" | "ORDER_UPDATE" | "MESSAGE" | "SYSTEM"> = {
      new_listing: "NEW_LISTING",
      price_drop: "PRICE_DROP",
      new_follower: "NEW_FOLLOWER",
      order_update: "ORDER_UPDATE",
      message: "MESSAGE",
      system: "SYSTEM",
    };

    const notificationType = typeMap[type.toLowerCase()];
    if (!notificationType) {
      return NextResponse.json(
        { success: false, error: "Tipo de notificación inválido" },
        { status: 400 }
      );
    }

    const notification = await prisma.notification.create({
      data: {
        userId,
        type: notificationType,
        title,
        message,
        fromUserId,
        listingId,
        conversationId,
        orderId,
        imageUrl,
        actionUrl,
      },
    });

    return NextResponse.json({
      success: true,
      notification: {
        id: notification.id,
        userId: notification.userId,
        type: notification.type.toLowerCase(),
        title: notification.title,
        message: notification.message,
        fromUserId: notification.fromUserId,
        listingId: notification.listingId,
        conversationId: notification.conversationId,
        orderId: notification.orderId,
        imageUrl: notification.imageUrl,
        actionUrl: notification.actionUrl,
        isRead: notification.isRead,
        createdAt: notification.createdAt,
      },
    });
  } catch (error) {
    console.error("Error creating notification:", error);
    return NextResponse.json(
      { success: false, error: "Error al crear notificación" },
      { status: 500 }
    );
  }
}
