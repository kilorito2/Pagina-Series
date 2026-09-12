import "server-only";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { TAG_SERIES } from "@/lib/cache-tags";

// ratingPromedio y tipo son escalares de Serie (sin joins extra) que
// SerieCard usa para el overlay de hover ampliado (⭐ puntaje + tipo).
const SELECT_SERIE_CARD = {
  id: true,
  slug: true,
  titulo: true,
  poster: true,
  anio: true,
  ratingPromedio: true,
  tipo: true,
} as const;

// Filas de home: no dependen del visitante, así que se cachean con
// unstable_cache (revalidan solas a los 5 min, o antes si el admin
// publica/edita contenido — ver revalidateTag(TAG_SERIES) en las rutas
// de /api/admin). El header sigue siendo dinámico (lee la sesión), así
// que la página entera no es estática, pero estas consultas pesadas no
// le pegan a la base en cada request.
const OPCIONES_CACHE = { revalidate: 300, tags: [TAG_SERIES] };

export const obtenerDestacadas = unstable_cache(
  async () =>
    prisma.serie.findMany({
      where: { destacada: true },
      select: {
        id: true,
        slug: true,
        titulo: true,
        sinopsis: true,
        banner: true,
        poster: true,
        anio: true,
        generos: { select: { genero: { select: { nombre: true } } } },
        temporadas: {
          orderBy: { numero: "asc" },
          take: 1,
          select: {
            numero: true,
            episodios: { orderBy: { numero: "asc" }, take: 1, select: { numero: true } },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
      take: 6,
    }),
  ["home-destacadas"],
  OPCIONES_CACHE
);

export const obtenerUltimosEpisodios = unstable_cache(
  async () =>
    prisma.episodio.findMany({
      orderBy: { createdAt: "desc" },
      take: 16,
      select: {
        id: true,
        numero: true,
        titulo: true,
        thumbnail: true,
        createdAt: true,
        temporada: {
          select: {
            numero: true,
            serie: { select: { slug: true, titulo: true, poster: true } },
          },
        },
      },
    }),
  ["home-ultimos-episodios"],
  OPCIONES_CACHE
);

export const obtenerEnEmision = unstable_cache(
  async () =>
    prisma.serie.findMany({
      where: { estado: "EMISION" },
      select: SELECT_SERIE_CARD,
      orderBy: { updatedAt: "desc" },
      take: 16,
    }),
  ["home-en-emision"],
  OPCIONES_CACHE
);

// No llevamos un contador de vistas por semana; como aproximación de
// "tendencias" usamos el total de vistas histórico.
export const obtenerTendencias = unstable_cache(
  async () =>
    prisma.serie.findMany({
      select: SELECT_SERIE_CARD,
      orderBy: { vistas: "desc" },
      take: 16,
    }),
  ["home-tendencias"],
  OPCIONES_CACHE
);

export const obtenerGenerosConSeries = unstable_cache(
  async (cantidadGeneros: number, seriesPorGenero: number) => {
    const generos = await prisma.genero.findMany({
      orderBy: { series: { _count: "desc" } },
      take: cantidadGeneros,
    });

    const filas = await Promise.all(
      generos.map(async (genero) => {
        const series = await prisma.serie.findMany({
          where: { generos: { some: { generoId: genero.id } } },
          select: SELECT_SERIE_CARD,
          orderBy: { vistas: "desc" },
          take: seriesPorGenero,
        });
        return { genero, series };
      })
    );

    return filas.filter((fila) => fila.series.length > 0);
  },
  ["home-generos-con-series"],
  OPCIONES_CACHE
);

// Personalizado por perfil y cambia todo el tiempo: no se cachea.
export async function obtenerContinuarViendo(profileId: string) {
  return prisma.progreso.findMany({
    where: { profileId, completado: false, segundoActual: { gt: 0 } },
    orderBy: { updatedAt: "desc" },
    take: 16,
    select: {
      id: true,
      episodioId: true,
      segundoActual: true,
      duracionTotal: true,
      episodio: {
        select: {
          numero: true,
          titulo: true,
          thumbnail: true,
          temporada: {
            select: {
              numero: true,
              serie: { select: { slug: true, titulo: true, poster: true } },
            },
          },
        },
      },
    },
  });
}
