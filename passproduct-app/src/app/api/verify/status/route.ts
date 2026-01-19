import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GET(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: {
        isIdentityVerified: true,
        identityVerifiedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({
        success: true,
        isVerified: false,
        verifiedAt: null,
      });
    }

    return NextResponse.json({
      success: true,
      isVerified: user.isIdentityVerified,
      verifiedAt: user.identityVerifiedAt,
    });
  } catch (error) {
    console.error("Error checking verification status:", error);
    return NextResponse.json(
      { success: false, error: "Failed to check verification status" },
      { status: 500 }
    );
  }
}
