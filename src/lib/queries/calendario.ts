import "server-only";
import { prisma } from "@/lib/prisma";

export type SerieCalendario = {
  id: string;
  slug: string;
  titulo: string;
  poster: string;
  /** 0 = domingo ... 6 = sábado (Date#getDay()). */
  diaSemana: number;
};

/**
 * No hay un campo de "día de emisión fijo" en el modelo: lo aproximamos con
 * el día de la semana de la fecha de emisión del episodio más reciente de
 * cada serie en emisión. Es el mismo criterio que usan los calendarios de
 * los sitios de streaming de anime.
 */
export async function obtenerCalendarioEmision(): Promise<SerieCalendario[]> {
  const series = await prisma.serie.findMany({
    where: { estado: "EMISION" },
    select: {
      id: true,
      slug: true,
      titulo: true,
      poster: true,
      temporadas: {
        select: {
          episodios: {
            where: { fechaEmision: { not: null } },
            orderBy: { fechaEmision: "desc" },
            take: 1,
            select: { fechaEmision: true },
          },
        },
      },
    },
  });

  const resultado: SerieCalendario[] = [];
  for (const serie of series) {
    const fechas = serie.temporadas
      .flatMap((t) => t.episodios.map((e) => e.fechaEmision))
      .filter((f): f is Date => f !== null);
    if (fechas.length === 0) continue;

    const masReciente = fechas.reduce((max, f) => (f > max ? f : max));
    resultado.push({
      id: serie.id,
      slug: serie.slug,
      titulo: serie.titulo,
      poster: serie.poster,
      diaSemana: masReciente.getDay(),
    });
  }

  return resultado;
}
