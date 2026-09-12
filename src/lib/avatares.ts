/**
 * Galería de avatares predefinida para los perfiles (no se suben archivos:
 * se elige uno de esta lista, como en Netflix). Generados con DiceBear
 * (servicio público gratuito, sin API key) con semillas fijas para que
 * cada avatar sea siempre la misma imagen.
 */
const SEMILLAS = [
  "Kaori",
  "Ren",
  "Hana",
  "Sora",
  "Yuki",
  "Aoi",
  "Riku",
  "Mika",
  "Taro",
  "Nozomi",
  "Kenji",
  "Sakura",
];

// PNG (no SVG) a propósito: next/image no optimiza SVGs externos sin
// habilitar `dangerouslyAllowSVG`, y no hace falta para esto.
export const AVATARES_DISPONIBLES = SEMILLAS.map(
  (semilla) =>
    `https://api.dicebear.com/9.x/thumbs/png?seed=${semilla}&backgroundColor=7c3aed,22d3ee,1a1a22&size=200`
);

export const AVATAR_POR_DEFECTO = AVATARES_DISPONIBLES[0];
