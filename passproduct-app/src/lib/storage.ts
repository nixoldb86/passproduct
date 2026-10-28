/**
 * Almacenamiento de imágenes (solo servidor).
 *
 * Las fotos NUNCA se guardan en la base de datos: se procesan con sharp
 * (redimensionado + WebP) y se suben a un almacén de ficheros. En la BD
 * solo se guarda la URL resultante.
 *
 * Drivers:
 *  - Supabase Storage: si existen SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY
 *    (bucket público, por defecto "photos"). Es el driver de producción.
 *  - Sistema de ficheros local: escribe en public/uploads y sirve en /uploads.
 *    Solo para desarrollo (en Vercel el disco es de solo lectura).
 */
import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import sharp from "sharp";

export type PhotoKind = "product" | "proof";

const LIMITS: Record<PhotoKind, { maxSide: number; quality: number }> = {
  // Fotos de producto: 1600px de lado mayor es suficiente para cualquier pantalla.
  product: { maxSide: 1600, quality: 80 },
  // Justificantes: más resolución para que el texto siga siendo legible.
  proof: { maxSide: 2200, quality: 82 },
};

export const MAX_UPLOAD_BYTES = 12 * 1024 * 1024; // 12 MB por fichero de entrada
export const MAX_PHOTOS_PER_REQUEST = 6;

const ALLOWED_INPUT_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
  "image/gif",
  "image/avif",
]);

export function isAllowedImageType(type: string): boolean {
  return ALLOWED_INPUT_TYPES.has(type);
}

export { isDataUrl, containsDataUrl } from "./data-url";

export function decodeDataUrl(dataUrl: string): { buffer: Buffer; mime: string } {
  const match = /^data:([^;,]+)?(;base64)?,([\s\S]*)$/.exec(dataUrl);
  if (!match) throw new Error("data URL inválido");
  const mime = match[1] || "application/octet-stream";
  const payload = match[3];
  const buffer = match[2]
    ? Buffer.from(payload, "base64")
    : Buffer.from(decodeURIComponent(payload), "utf8");
  return { buffer, mime };
}

async function toWebp(input: Buffer, kind: PhotoKind): Promise<Buffer> {
  const { maxSide, quality } = LIMITS[kind];
  return sharp(input, { failOn: "none" })
    .rotate() // respeta la orientación EXIF
    .resize({ width: maxSide, height: maxSide, fit: "inside", withoutEnlargement: true })
    .webp({ quality })
    .toBuffer();
}

function objectPath(kind: PhotoKind, ownerId: string): string {
  const safeOwner = ownerId.replace(/[^a-zA-Z0-9_-]/g, "_");
  return `${kind}/${safeOwner}/${randomUUID()}.webp`;
}

// ---------- Driver: Supabase Storage ----------

function supabaseConfig() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return {
    url: url.replace(/\/$/, ""),
    key,
    bucket: process.env.SUPABASE_STORAGE_BUCKET || "photos",
  };
}

async function uploadToSupabase(buffer: Buffer, objectKey: string): Promise<string> {
  const cfg = supabaseConfig()!;
  const endpoint = `${cfg.url}/storage/v1/object/${cfg.bucket}/${objectKey}`;
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${cfg.key}`,
      apikey: cfg.key,
      "Content-Type": "image/webp",
      "Cache-Control": "public, max-age=31536000, immutable",
      "x-upsert": "false",
    },
    body: new Uint8Array(buffer),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Supabase Storage ${res.status}: ${text}`);
  }
  return `${cfg.url}/storage/v1/object/public/${cfg.bucket}/${objectKey}`;
}

// ---------- Driver: sistema de ficheros local ----------

async function uploadToLocal(buffer: Buffer, objectKey: string): Promise<string> {
  const root = path.join(process.cwd(), "public", "uploads");
  const target = path.join(root, objectKey);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, buffer);
  return `/uploads/${objectKey}`;
}

// ---------- API pública ----------

export function storageDriver(): "supabase" | "local" {
  return supabaseConfig() ? "supabase" : "local";
}

/**
 * Procesa una imagen y la guarda. Devuelve la URL pública.
 */
export async function storePhoto(
  input: Buffer,
  opts: { kind: PhotoKind; ownerId: string }
): Promise<string> {
  const webp = await toWebp(input, opts.kind);
  const key = objectPath(opts.kind, opts.ownerId);
  return storageDriver() === "supabase"
    ? uploadToSupabase(webp, key)
    : uploadToLocal(webp, key);
}

/** Convierte un data URL (base64) en una foto almacenada. Útil para migraciones. */
export async function storeDataUrl(
  dataUrl: string,
  opts: { kind: PhotoKind; ownerId: string }
): Promise<string> {
  const { buffer } = decodeDataUrl(dataUrl);
  return storePhoto(buffer, opts);
}
