import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { reportarComentarioSchema } from "@/lib/validaciones/comentario";
import { verificarRateLimit, obtenerIp } from "@/lib/rate-limit";

type Contexto = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Contexto) {
  const ip = obtenerIp(request);
  const { permitido } = await verificarRateLimit("reportar-comentario", ip, {
    puntos: 10,
    duracionSeg: 60 * 10,
  });
  if (!permitido) {
    return NextResponse.json({ error: "Demasiados reportes, esperá un rato." }, { status: 429 });
  }

  const { id } = await params;
  const comentario = await prisma.comentario.findUnique({ where: { id } });
  if (!comentario) {
    return NextResponse.json({ error: "Comentario no encontrado" }, { status: 404 });
  }

  const body = await request.json().catch(() => ({}));
  const parseado = reportarComentarioSchema.safeParse(body);
  const motivo = parseado.success ? parseado.data.motivo : undefined;

  await prisma.reporte.create({
    data: {
      tipo: "COMENTARIO",
      referenciaId: id,
      motivo: motivo?.trim() || "Comentario reportado por un usuario",
    },
  });

  return NextResponse.json({ ok: true });
}
