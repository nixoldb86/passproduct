import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  isAllowedImageType,
  storePhoto,
  MAX_PHOTOS_PER_REQUEST,
  MAX_UPLOAD_BYTES,
  type PhotoKind,
} from "@/lib/storage";

export const runtime = "nodejs";

/**
 * POST /api/upload  (multipart/form-data)
 *   files: una o varias imágenes (campo "files")
 *   kind:  "product" (por defecto) | "proof"
 * Responde { success, urls: string[] }
 */
export async function POST(request: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json(
      { success: false, error: "Debes iniciar sesión" },
      { status: 401 }
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { success: false, error: "Se esperaba multipart/form-data" },
      { status: 400 }
    );
  }

  const kindRaw = formData.get("kind");
  const kind: PhotoKind = kindRaw === "proof" ? "proof" : "product";
  const files = formData
    .getAll("files")
    .filter((f): f is File => f instanceof File && f.size > 0);

  if (files.length === 0) {
    return NextResponse.json(
      { success: false, error: "No se ha recibido ninguna imagen" },
      { status: 400 }
    );
  }
  if (files.length > MAX_PHOTOS_PER_REQUEST) {
    return NextResponse.json(
      { success: false, error: `Máximo ${MAX_PHOTOS_PER_REQUEST} imágenes por petición` },
      { status: 400 }
    );
  }

  for (const file of files) {
    if (!isAllowedImageType(file.type)) {
      return NextResponse.json(
        { success: false, error: `Formato no admitido: ${file.type || "desconocido"}` },
        { status: 415 }
      );
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json(
        { success: false, error: `Imagen demasiado grande (máx. ${MAX_UPLOAD_BYTES / 1024 / 1024} MB)` },
        { status: 413 }
      );
    }
  }

  try {
    const urls = await Promise.all(
      files.map(async (file) =>
        storePhoto(Buffer.from(await file.arrayBuffer()), { kind, ownerId: clerkId })
      )
    );
    return NextResponse.json({ success: true, urls });
  } catch (error) {
    console.error("Error storing photos:", error);
    return NextResponse.json(
      { success: false, error: "No se pudieron guardar las imágenes" },
      { status: 500 }
    );
  }
}
