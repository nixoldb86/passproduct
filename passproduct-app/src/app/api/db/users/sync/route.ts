import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";

// POST - Sincronizar usuario de Clerk con la BD
export async function POST(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    
    if (!clerkId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Obtener datos del usuario de Clerk
    const clerkUser = await currentUser();
    
    if (!clerkUser) {
      return NextResponse.json(
        { success: false, error: "User not found in Clerk" },
        { status: 404 }
      );
    }

    // Buscar o crear usuario en la BD
    const user = await prisma.user.upsert({
      where: { clerkId },
      update: {
        email: clerkUser.emailAddresses[0]?.emailAddress || `${clerkId}@passproduct.com`,
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        avatarUrl: clerkUser.imageUrl,
      },
      create: {
        clerkId,
        email: clerkUser.emailAddresses[0]?.emailAddress || `${clerkId}@passproduct.com`,
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        avatarUrl: clerkUser.imageUrl,
        country: "ES",
        language: "es",
      },
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("Error syncing user:", error);
    return NextResponse.json(
      { success: false, error: "Failed to sync user" },
      { status: 500 }
    );
  }
}
