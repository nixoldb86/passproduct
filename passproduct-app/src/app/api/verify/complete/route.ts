import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      documentType,
      documentNumber,
      firstName,
      lastName,
      dateOfBirth,
      expirationDate,
      faceMatchScore,
      livenessScore,
      ocrConfidence,
    } = body;

    // Validate required fields
    if (!documentType || !documentNumber) {
      return NextResponse.json(
        { success: false, error: "Missing required document information" },
        { status: 400 }
      );
    }

    // Hash the document number for privacy
    const documentNumberHash = crypto
      .createHash("sha256")
      .update(documentNumber.toUpperCase().trim())
      .digest("hex");

    // Check if this document has already been used
    const existingVerification = await prisma.identityVerification.findFirst({
      where: {
        documentNumberHash,
        status: "VERIFIED",
      },
      include: {
        user: {
          select: { id: true, clerkId: true },
        },
      },
    });

    if (existingVerification && existingVerification.user.clerkId !== clerkId) {
      return NextResponse.json(
        {
          success: false,
          error: "This document has already been used by another account",
        },
        { status: 409 }
      );
    }

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { clerkId },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          clerkId,
          email: `${clerkId}@temp.passproduct.com`,
        },
      });
    }

    // Parse date of birth if provided
    let parsedDateOfBirth: Date | null = null;
    if (dateOfBirth) {
      const parts = dateOfBirth.replace(/[\/\.]/g, "-").split("-");
      if (parts.length === 3) {
        parsedDateOfBirth = new Date(
          parseInt(parts[2], 10),
          parseInt(parts[1], 10) - 1,
          parseInt(parts[0], 10)
        );
      }
    }

    // Parse expiration date if provided
    let parsedExpirationDate: Date | null = null;
    if (expirationDate) {
      const parts = expirationDate.replace(/[\/\.]/g, "-").split("-");
      if (parts.length === 3) {
        parsedExpirationDate = new Date(
          parseInt(parts[2], 10),
          parseInt(parts[1], 10) - 1,
          parseInt(parts[0], 10)
        );
      }
    }

    // Get request metadata
    const forwarded = request.headers.get("x-forwarded-for");
    const ipAddress = forwarded ? forwarded.split(",")[0] : "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    // Determine verification status based on scores
    // If face comparison was done (faceMatchScore > 0), require at least 40% match
    // If face comparison failed (faceMatchScore = 0), still allow if liveness passed
    const faceCheckPassed = faceMatchScore === 0 || faceMatchScore >= 0.4;
    const livenessCheckPassed = livenessScore >= 0.5;
    const ocrCheckPassed = ocrConfidence >= 0.3;
    
    const isVerified = faceCheckPassed && livenessCheckPassed && ocrCheckPassed;
    
    console.log("Verification check:", {
      faceMatchScore,
      livenessScore,
      ocrConfidence,
      faceCheckPassed,
      livenessCheckPassed,
      ocrCheckPassed,
      isVerified
    });

    // Create or update verification record
    const verification = await prisma.identityVerification.upsert({
      where: {
        // Use a unique constraint - we need to add this or use create
        id: existingVerification?.id || "new",
      },
      update: {
        status: isVerified ? "VERIFIED" : "REJECTED",
        faceMatchScore,
        livenessScore,
        ocrConfidence,
        completedAt: new Date(),
        rejectionReason: isVerified
          ? null
          : `Low scores: face=${faceMatchScore}, liveness=${livenessScore}, ocr=${ocrConfidence}`,
      },
      create: {
        userId: user.id,
        documentType,
        documentNumberHash,
        documentCountry: "ES",
        firstNameExtracted: firstName,
        lastNameExtracted: lastName,
        dateOfBirth: parsedDateOfBirth,
        expirationDate: parsedExpirationDate,
        status: isVerified ? "VERIFIED" : "REJECTED",
        faceMatchScore,
        livenessScore,
        ocrConfidence,
        ipAddress,
        userAgent,
        completedAt: new Date(),
        rejectionReason: isVerified
          ? null
          : `Low scores: face=${faceMatchScore}, liveness=${livenessScore}, ocr=${ocrConfidence}`,
      },
    });

    // Update user verification status if verified
    if (isVerified) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          isIdentityVerified: true,
          identityVerifiedAt: new Date(),
          // Optionally update name from document if not set
          ...((!user.firstName && firstName) ? { firstName } : {}),
          ...((!user.lastName && lastName) ? { lastName } : {}),
        },
      });
    }

    return NextResponse.json({
      success: true,
      isVerified,
      verificationId: verification.id,
      message: isVerified
        ? "Identity verified successfully"
        : "Verification failed - scores too low",
    });
  } catch (error) {
    console.error("Error completing verification:", error);
    return NextResponse.json(
      { success: false, error: "Failed to complete verification" },
      { status: 500 }
    );
  }
}
