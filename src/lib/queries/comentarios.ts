import "server-only";
import { prisma } from "@/lib/prisma";

export type ComentarioConHijos = {
  id: string;
  contenido: string;
  spoiler: boolean;
  createdAt: Date;
  parentId: string | null;
  profileId: string;
  profile: { nombre: string; avatar: string };
  hijos: ComentarioConHijos[];
};

export async function obtenerComentarios(serieId: string): Promise<ComentarioConHijos[]> {
  const filas = await prisma.comentario.findMany({
    where: { serieId, eliminado: false },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      contenido: true,
      spoiler: true,
      createdAt: true,
      parentId: true,
      profileId: true,
      profile: { select: { nombre: true, avatar: true } },
    },
  });

  const porId = new Map<string, ComentarioConHijos>(filas.map((f) => [f.id, { ...f, hijos: [] }]));
  const raiz: ComentarioConHijos[] = [];

  for (const comentario of porId.values()) {
    if (comentario.parentId) {
      const padre = porId.get(comentario.parentId);
      if (padre) padre.hijos.push(comentario);
      else raiz.push(comentario); // el padre se borró: lo mostramos suelto
    } else {
      raiz.push(comentario);
    }
  }

  return raiz;
}
