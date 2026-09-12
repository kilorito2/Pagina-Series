import "server-only";
import { prisma } from "@/lib/prisma";

export const HISTORIAL_POR_PAGINA = 20;

export async function obtenerHistorial(profileId: string, pagina: number) {
  const [items, total] = await Promise.all([
    prisma.progreso.findMany({
      where: { profileId },
      orderBy: { updatedAt: "desc" },
      skip: (pagina - 1) * HISTORIAL_POR_PAGINA,
      take: HISTORIAL_POR_PAGINA,
      select: {
        id: true,
        episodioId: true,
        segundoActual: true,
        duracionTotal: true,
        completado: true,
        updatedAt: true,
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
    }),
    prisma.progreso.count({ where: { profileId } }),
  ]);

  return { items, total, totalPaginas: Math.max(1, Math.ceil(total / HISTORIAL_POR_PAGINA)) };
}
