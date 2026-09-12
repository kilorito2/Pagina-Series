import "server-only";

// API pública de Jikan (MyAnimeList), sin API key. Tiene rate limit propio
// (~3 req/seg, 60/min) — este importador es de uso manual desde el admin,
// no hace falta manejar backoff sofisticado.
const BASE = "https://api.jikan.moe/v4";

export type ResultadoBusquedaJikan = {
  malId: number;
  titulo: string;
  tituloIngles: string | null;
  poster: string | null;
  anio: number | null;
  tipo: string | null;
  episodios: number | null;
};

export type DetalleJikan = ResultadoBusquedaJikan & {
  tituloOriginal: string | null;
  sinopsis: string | null;
  estudio: string | null;
  generos: string[];
  estadoEmision: string | null;
};

type AnimeJikan = {
  mal_id: number;
  title: string;
  title_english: string | null;
  title_japanese: string | null;
  synopsis: string | null;
  images: { jpg: { large_image_url: string | null } };
  year: number | null;
  type: string | null;
  episodes: number | null;
  status: string | null;
  genres: { name: string }[];
  studios: { name: string }[];
};

function mapearBase(a: AnimeJikan): ResultadoBusquedaJikan {
  return {
    malId: a.mal_id,
    titulo: a.title,
    tituloIngles: a.title_english,
    poster: a.images?.jpg?.large_image_url ?? null,
    anio: a.year,
    tipo: a.type,
    episodios: a.episodes,
  };
}

export async function buscarEnJikan(query: string): Promise<ResultadoBusquedaJikan[]> {
  const url = `${BASE}/anime?q=${encodeURIComponent(query)}&limit=10&sfw=true`;
  const respuesta = await fetch(url, { next: { revalidate: 0 } });
  if (!respuesta.ok) throw new Error("Jikan no respondió correctamente");
  const cuerpo = (await respuesta.json()) as { data: AnimeJikan[] };
  return cuerpo.data.map(mapearBase);
}

export async function obtenerDetalleJikan(malId: number): Promise<DetalleJikan> {
  const respuesta = await fetch(`${BASE}/anime/${malId}/full`, { next: { revalidate: 0 } });
  if (!respuesta.ok) throw new Error("Jikan no respondió correctamente");
  const cuerpo = (await respuesta.json()) as { data: AnimeJikan };
  const a = cuerpo.data;

  return {
    ...mapearBase(a),
    tituloOriginal: a.title_japanese,
    sinopsis: a.synopsis,
    estudio: a.studios?.[0]?.name ?? null,
    generos: a.genres?.map((g) => g.name) ?? [],
    estadoEmision: a.status,
  };
}
