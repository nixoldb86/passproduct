/** Utilidades ligeras (sin dependencias) para detectar imágenes en base64. */
export function isDataUrl(value: unknown): value is string {
  return typeof value === "string" && value.startsWith("data:");
}

/** true si el valor, o alguna cadena de la lista, es un data URL (base64). */
export function containsDataUrl(values: unknown): boolean {
  if (Array.isArray(values)) return values.some(isDataUrl);
  return isDataUrl(values);
}

export const DATA_URL_REJECTED =
  "Las fotos deben subirse por /api/upload; no se admiten imágenes en base64";
