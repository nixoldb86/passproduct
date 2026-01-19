import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

// GET - Obtener producto por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const product = await prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

// PUT - Actualizar producto
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: clerkId } = await auth();
    
    if (!clerkId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    // Verificar que el producto pertenece al usuario
    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct || existingProduct.userId !== user.id) {
      return NextResponse.json(
        { success: false, error: "Product not found or unauthorized" },
        { status: 404 }
      );
    }

    // Preparar datos para actualizar
    const updateData: Record<string, unknown> = {};
    
    if (body.brand !== undefined) updateData.brand = body.brand;
    if (body.model !== undefined) updateData.model = body.model;
    if (body.variant !== undefined) updateData.variant = body.variant;
    if (body.condition !== undefined) updateData.condition = body.condition;
    if (body.categoryId !== undefined) updateData.categoryId = body.categoryId;
    if (body.purchaseStore !== undefined) updateData.purchaseStore = body.purchaseStore;
    if (body.imeiLast4 !== undefined) updateData.imeiLast4 = body.imeiLast4;
    if (body.serialLast4 !== undefined) updateData.serialLast4 = body.serialLast4;
    if (body.accessories !== undefined) updateData.accessories = body.accessories;
    if (body.photos !== undefined) updateData.photos = body.photos;
    
    if (body.purchaseDate !== undefined) {
      updateData.purchaseDate = body.purchaseDate ? new Date(body.purchaseDate) : null;
    }
    if (body.purchasePrice !== undefined) {
      updateData.purchasePrice = body.purchasePrice ? parseFloat(body.purchasePrice) : null;
    }
    if (body.warrantyEndDate !== undefined) {
      updateData.warrantyEndDate = body.warrantyEndDate ? new Date(body.warrantyEndDate) : null;
    }

    const product = await prisma.product.update({
      where: { id },
      data: updateData,
      include: { category: true },
    });

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update product" },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar producto
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: clerkId } = await auth();
    
    if (!clerkId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Verificar que el producto pertenece al usuario
    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct || existingProduct.userId !== user.id) {
      return NextResponse.json(
        { success: false, error: "Product not found or unauthorized" },
        { status: 404 }
      );
    }

    await prisma.product.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
