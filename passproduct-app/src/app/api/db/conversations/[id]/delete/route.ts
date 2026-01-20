import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

// POST - Borrar conversación (soft delete para el usuario actual)
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

    // Verificar que la conversación existe
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      return NextResponse.json(
        { success: false, error: "Conversación no encontrada" },
        { status: 404 }
      );
    }

    // Verificar que el usuario es participante
    const isBuyer = conversation.buyerId === user.id;
    const isSeller = conversation.sellerId === user.id;

    if (!isBuyer && !isSeller) {
      return NextResponse.json(
        { success: false, error: "No tienes acceso a esta conversación" },
        { status: 403 }
      );
    }

    // Marcar como borrada para este usuario
    await prisma.conversation.update({
      where: { id: conversationId },
      data: isBuyer 
        ? { deletedByBuyer: true }
        : { deletedBySeller: true },
    });

    return NextResponse.json({
      success: true,
      message: "Conversación eliminada",
    });
  } catch (error) {
    console.error("Error deleting conversation:", error);
    return NextResponse.json(
      { success: false, error: "Error al eliminar conversación" },
      { status: 500 }
    );
  }
}
