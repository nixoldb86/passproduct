import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

// GET - Obtener productos del usuario actual
export async function GET(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    
    if (!clerkId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Buscar usuario por clerkId
    const user = await prisma.user.findUnique({
      where: { clerkId },
    });

    if (!user) {
      // Si no existe el usuario, devolver array vacío
      return NextResponse.json({ success: true, products: [] });
    }

    const products = await prisma.product.findMany({
      where: { userId: user.id },
      include: { category: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, products });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

// POST - Crear nuevo producto
export async function POST(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    
    if (!clerkId) {
      return NextResponse.json(
        { success: false, error: "Debes iniciar sesión" },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log("📦 Creating product with data:", JSON.stringify(body, null, 2));
    
    const {
      categoryId,
      brand,
      model,
      variant,
      condition,
      purchaseDate,
      purchasePrice,
      purchaseStore,
      warrantyEndDate,
      photos,
      stockPhotos,
      accessories,
      imeiLast4,
      serialLast4,
      warrantyNotes,
      manualUrl,
      specs,
      estimatedValue,
      proofOfPurchaseUrl,
      hasAdditionalInsurance,
      additionalInsuranceEndDate,
      additionalInsuranceProvider,
      additionalInsuranceNotes,
    } = body;

    // Validar campos requeridos
    if (!brand || !model) {
      return NextResponse.json(
        { success: false, error: "Marca y modelo son requeridos" },
        { status: 400 }
      );
    }

    // Verificar que la categoría existe
    if (categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: categoryId },
      });
      if (!category) {
        console.error(`❌ Category not found: ${categoryId}`);
        // Listar categorías disponibles para debug
        const categories = await prisma.category.findMany({ select: { id: true, name: true } });
        console.log("📁 Available categories:", categories.map(c => c.id));
        return NextResponse.json(
          { success: false, error: `Categoría no encontrada: ${categoryId}` },
          { status: 400 }
        );
      }
    }

    // Buscar o crear usuario
    let user = await prisma.user.findUnique({
      where: { clerkId },
    });

    if (!user) {
      console.log(`👤 Creating new user for clerkId: ${clerkId}`);
      user = await prisma.user.create({
        data: {
          clerkId,
          email: `${clerkId}@temp.passproduct.com`,
        },
      });
    }

    // Crear producto
    const product = await prisma.product.create({
      data: {
        userId: user.id,
        categoryId: categoryId || null,
        brand,
        model,
        variant: variant || null,
        condition: condition || "GOOD",
        purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
        purchasePrice: purchasePrice ? parseFloat(String(purchasePrice)) : null,
        purchaseStore: purchaseStore || null,
        warrantyEndDate: warrantyEndDate ? new Date(warrantyEndDate) : null,
        proofOfPurchaseUrl: proofOfPurchaseUrl || null,
        photos: photos || [],
        accessories: accessories || {},
        imeiLast4: imeiLast4 || null,
        serialLast4: serialLast4 || null,
        estimatedValue: estimatedValue ? parseFloat(String(estimatedValue)) : null,
        attributes: {
          stockPhotos: stockPhotos || [],
          warrantyNotes: warrantyNotes || null,
          manualUrl: manualUrl || null,
          specs: specs || [],
          // Seguro adicional
          hasAdditionalInsurance: hasAdditionalInsurance || false,
          additionalInsuranceEndDate: additionalInsuranceEndDate || null,
          additionalInsuranceProvider: additionalInsuranceProvider || null,
          additionalInsuranceNotes: additionalInsuranceNotes || null,
        },
      },
      include: { category: true },
    });

    console.log(`✅ Product created: ${product.id}`);
    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error("❌ Error creating product:", error);
    
    // Extraer mensaje de error más específico
    let errorMessage = "Error al crear producto";
    if (error instanceof Error) {
      errorMessage = error.message;
      // Si es un error de Prisma, extraer más detalles
      if ('code' in error) {
        const prismaError = error as { code: string; meta?: { target?: string[] } };
        if (prismaError.code === 'P2002') {
          errorMessage = "Ya existe un producto con estos datos";
        } else if (prismaError.code === 'P2003') {
          errorMessage = "Referencia inválida (categoría o usuario)";
        }
      }
    }
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
