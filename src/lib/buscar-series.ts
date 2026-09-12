import "server-only";
import { prisma } from "@/lib/prisma";

/** Búsqueda por título, título alternativo y título original. Compartida
 * entre el dropdown del header (`/api/buscar`) y la página `/buscar`. */
export async function buscarSeries(q: string, take: number) {
  return prisma.serie.findMany({
    where: {
      OR: [
        { titulo: { contains: q, mode: "insensitive" } },
        { tituloAlternativo: { contains: q, mode: "insensitive" } },
        { tituloOriginal: { contains: q, mode: "insensitive" } },
      ],
    },
    orderBy: [{ vistas: "desc" }, { titulo: "asc" }],
    take,
  });
}
