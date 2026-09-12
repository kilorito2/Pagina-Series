import "server-only";
import { prisma } from "@/lib/prisma";

export async function obtenerSerieParaReproductor(slug: string) {
  return prisma.serie.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      titulo: true,
      poster: true,
      temporadas: {
        orderBy: { numero: "asc" },
        select: {
          numero: true,
          titulo: true,
          episodios: {
            orderBy: { numero: "asc" },
            select: {
              id: true,
              numero: true,
              titulo: true,
              sinopsis: true,
              thumbnail: true,
              duracionMin: true,
              fuentes: {
                where: { esActiva: true },
                orderBy: [{ calidad: "desc" }],
                select: { id: true, servidor: true, url: true, calidad: true, idioma: true },
              },
            },
          },
        },
      },
    },
  });
}

export type SerieParaReproductor = NonNullable<Awaited<ReturnType<typeof obtenerSerieParaReproductor>>>;
export type TemporadaParaReproductor = SerieParaReproductor["temporadas"][number];
export type EpisodioParaReproductor = TemporadaParaReproductor["episodios"][number];

export async function obtenerProgresoEpisodio(profileId: string, episodioId: string) {
  return prisma.progreso.findUnique({
    where: { profileId_episodioId: { profileId, episodioId } },
  });
}
