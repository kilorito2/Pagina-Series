import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { obtenerPerfilActivo } from "@/lib/perfil-activo";
import { valoracionSchema } from "@/lib/validaciones/valoracion";

async function recalcularPromedio(serieId: string) {
  const agregado = await prisma.valoracion.aggregate({
    where: { serieId },
    _avg: { puntaje: true },
  });
  await prisma.serie.update({
    where: { id: serieId },
    data: { ratingPromedio: Math.round((agregado._avg.puntaje ?? 0) * 10) / 10 },
  });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const perfil = await obtenerPerfilActivo(session.user.id);
  if (!perfil) {
    return NextResponse.json({ error: "Elegí un perfil primero", codigo: "SIN_PERFIL" }, { status: 409 });
  }

  const body = await request.json().catch(() => null);
  const parseado = valoracionSchema.safeParse(body);
  if (!parseado.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const { serieId, puntaje } = parseado.data;

  await prisma.valoracion.upsert({
    where: { profileId_serieId: { profileId: perfil.id, serieId } },
    update: { puntaje },
    create: { profileId: perfil.id, serieId, puntaje },
  });
  await recalcularPromedio(serieId);

  return NextResponse.json({ ok: true });
}
