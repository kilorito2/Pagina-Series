import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { reporteEnlaceSchema } from "@/lib/validaciones/reporte";
import { verificarRateLimit, obtenerIp } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const ip = obtenerIp(request);
  const { permitido } = await verificarRateLimit("reportes", ip, { puntos: 10, duracionSeg: 60 * 10 });
  if (!permitido) {
    return NextResponse.json({ error: "Demasiados reportes, esperá un rato." }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parseado = reporteEnlaceSchema.safeParse(body);
  if (!parseado.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const { fuenteVideoId, motivo } = parseado.data;

  const fuente = await prisma.fuenteVideo.findUnique({ where: { id: fuenteVideoId } });
  if (!fuente) {
    return NextResponse.json({ error: "Fuente no encontrada" }, { status: 404 });
  }

  await prisma.$transaction([
    prisma.reporte.create({
      data: {
        tipo: "ENLACE_CAIDO",
        referenciaId: fuenteVideoId,
        motivo: motivo?.trim() || "Enlace caído reportado desde el reproductor",
      },
    }),
    prisma.fuenteVideo.update({
      where: { id: fuenteVideoId },
      data: { reportesCaido: { increment: 1 } },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
