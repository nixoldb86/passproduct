/**
 * Subida de fotos desde el navegador.
 *
 * Las fotos se envían como ficheros a /api/upload, que las redimensiona,
 * las convierte a WebP y devuelve URLs. Nunca se envían ni se guardan en base64.
 */
export type UploadKind = "product" | "proof";

export async function uploadPhotos(
  files: File[],
  kind: UploadKind = "product"
): Promise<string[]> {
  if (files.length === 0) return [];

  const formData = new FormData();
  formData.set("kind", kind);
  files.forEach((file) => formData.append("files", file));

  const response = await fetch("/api/upload", { method: "POST", body: formData });
  const data = await response.json().catch(() => ({}));

  if (!response.ok || !data.success) {
    throw new Error(data.error || "Error al subir las fotos");
  }
  return data.urls as string[];
}

/** Convierte un data URL (p. ej. una imagen renderizada de un PDF) en File. */
export async function dataUrlToFile(dataUrl: string, filename: string): Promise<File> {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  return new File([blob], filename, { type: blob.type || "image/png" });
}
