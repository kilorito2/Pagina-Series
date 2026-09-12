// Mapeos best-effort de la taxonomía de Jikan/MAL a la nuestra. El admin
// siempre puede corregir a mano lo que no matchee antes de guardar.

const GENEROS_JIKAN_A_ESPANOL: Record<string, string> = {
  Action: "Acción",
  Adventure: "Aventura",
  Comedy: "Comedia",
  Drama: "Drama",
  Fantasy: "Fantasía",
  Romance: "Romance",
  "Sci-Fi": "Ciencia Ficción",
  Horror: "Terror",
  "Slice of Life": "Slice of Life",
  Sports: "Deporte",
  Supernatural: "Sobrenatural",
  Mystery: "Misterio",
};

export function mapearGenerosJikan(nombres: string[]): string[] {
  return nombres.map((n) => GENEROS_JIKAN_A_ESPANOL[n]).filter((n): n is string => !!n);
}

const TIPO_JIKAN_A_NUESTRO: Record<string, string> = {
  TV: "TV",
  Movie: "PELICULA",
  OVA: "OVA",
  ONA: "ONA",
  Special: "ESPECIAL",
  TV_SPECIAL: "ESPECIAL",
};

export function mapearTipoJikan(tipo: string | null): string {
  return (tipo && TIPO_JIKAN_A_NUESTRO[tipo]) || "TV";
}

export function mapearEstadoJikan(estado: string | null): string {
  if (!estado) return "FINALIZADO";
  if (estado.toLowerCase().includes("airing")) return "EMISION";
  if (estado.toLowerCase().includes("not yet")) return "PROXIMAMENTE";
  return "FINALIZADO";
}
