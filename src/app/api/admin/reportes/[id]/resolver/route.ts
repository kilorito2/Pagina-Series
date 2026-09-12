import { NextResponse } from "next/server";
import { z } from "zod";
import { exigirAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";

type Contexto = { params: Promise<{ id: string }> };

const schema = z.object({
  accion: z.enum(["eliminar_comentario", "desactivar_fuente", "descartar"]),
});

export async function POST(request: Request, { params }: Contexto) {
  const { error } = await exigirAdmin();
  if (error) return error;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parseado = schema.safeParse(body);
  if (!parseado.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const reporte = await prisma.reporte.findUnique({ where: { id } });
  if (!reporte) {
    return NextResponse.json({ error: "Reporte no encontrado" }, { status: 404 });
  }

  const { accion } = parseado.data;

  if (accion === "eliminar_comentario" && reporte.tipo === "COMENTARIO") {
    await prisma.comentario.update({
      where: { id: reporte.referenciaId },
      data: { eliminado: true },
    });
  }
  if (accion === "desactivar_fuente" && reporte.tipo === "ENLACE_CAIDO") {
    await prisma.fuenteVideo.update({
      where: { id: reporte.referenciaId },
      data: { esActiva: false },
    });
  }

  await prisma.reporte.update({
    where: { id },
    data: { estado: accion === "descartar" ? "DESCARTADO" : "REVISADO" },
  });

  return NextResponse.json({ ok: true });
}
