import "server-only";
import { prisma } from "@/lib/prisma";

export async function obtenerMiLista(profileId: string) {
  return prisma.listaItem.findMany({
    where: { profileId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      estado: true,
      serie: {
        select: {
          id: true,
          slug: true,
          titulo: true,
          poster: true,
          anio: true,
          ratingPromedio: true,
          tipo: true,
        },
      },
    },
  });
}
