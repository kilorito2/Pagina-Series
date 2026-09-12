import "server-only";
import { prisma } from "@/lib/prisma";

export async function obtenerSeriePorSlug(slug: string) {
  return prisma.serie.findUnique({
    where: { slug },
    include: {
      generos: { include: { genero: true } },
      temporadas: {
        orderBy: { numero: "asc" },
        include: {
          episodios: {
            orderBy: { numero: "asc" },
            select: {
              id: true,
              numero: true,
              titulo: true,
              thumbnail: true,
              duracionMin: true,
              temporadaId: true,
            },
          },
        },
      },
    },
  });
}

export type SerieConDetalle = NonNullable<Awaited<ReturnType<typeof obtenerSeriePorSlug>>>;

export async function obtenerProgresoEpisodios(profileId: string, episodioIds: string[]) {
  if (episodioIds.length === 0) return new Map<string, { completado: boolean }>();
  const filas = await prisma.progreso.findMany({
    where: { profileId, episodioId: { in: episodioIds } },
    select: { episodioId: true, completado: true },
  });
  return new Map(filas.map((f) => [f.episodioId, { completado: f.completado }]));
}

/** Último episodio empezado y no terminado de esta serie, para el botón "Continuar". */
export async function obtenerProgresoEnCurso(profileId: string, episodioIds: string[]) {
  if (episodioIds.length === 0) return null;
  return prisma.progreso.findFirst({
    where: { profileId, episodioId: { in: episodioIds }, completado: false, segundoActual: { gt: 0 } },
    orderBy: { updatedAt: "desc" },
    select: { episodioId: true },
  });
}

export async function obtenerValoracionPerfil(profileId: string, serieId: string) {
  const valoracion = await prisma.valoracion.findUnique({
    where: { profileId_serieId: { profileId, serieId } },
  });
  return valoracion?.puntaje ?? null;
}

export async function obtenerEstadoListaItem(profileId: string, serieId: string) {
  const item = await prisma.listaItem.findUnique({
    where: { profileId_serieId: { profileId, serieId } },
  });
  return item?.estado ?? null;
}

export async function obtenerRelacionadas(serieId: string, generoIds: string[], take = 12) {
  if (generoIds.length === 0) return [];
  return prisma.serie.findMany({
    where: { id: { not: serieId }, generos: { some: { generoId: { in: generoIds } } } },
    select: {
      id: true,
      slug: true,
      titulo: true,
      poster: true,
      anio: true,
      ratingPromedio: true,
      tipo: true,
    },
    orderBy: { vistas: "desc" },
    take,
  });
}
