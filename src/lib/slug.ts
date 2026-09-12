/**
 * Convierte un título en un slug URL-friendly.
 * "Attack on Titan" -> "attack-on-titan"
 */
const RANGO_DIACRITICOS = new RegExp("[\\u0300-\\u036f]", "g");

export function slugify(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(RANGO_DIACRITICOS, "") // saca tildes/diacríticos
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
