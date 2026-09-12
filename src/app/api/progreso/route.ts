import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { obtenerPerfilActivo } from "@/lib/perfil-activo";
import { progresoSchema } from "@/lib/validaciones/progreso";

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
  const parseado = progresoSchema.safeParse(body);
  if (!parseado.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const { episodioId, segundoActual, duracionTotal, completado } = parseado.data;

  const episodio = await prisma.episodio.findUnique({
    where: { id: episodioId },
    select: { temporada: { select: { serieId: true } } },
  });
  if (!episodio) {
    return NextResponse.json({ error: "Episodio no encontrado" }, { status: 404 });
  }

  // Si no viene un "completado" explícito (por ejemplo al terminar el
  // video), lo inferimos: 90% visto ya cuenta como terminado.
  const completadoFinal = completado ?? (duracionTotal > 0 && segundoActual / duracionTotal >= 0.9);

  const anterior = await prisma.progreso.findUnique({
    where: { profileId_episodioId: { profileId: perfil.id, episodioId } },
    select: { completado: true },
  });

  const progreso = await prisma.progreso.upsert({
    where: { profileId_episodioId: { profileId: perfil.id, episodioId } },
    update: { segundoActual, duracionTotal, completado: completadoFinal },
    create: { profileId: perfil.id, episodioId, segundoActual, duracionTotal, completado: completadoFinal },
  });

  // Solo sumamos una vista la primera vez que se completa (evita inflar el
  // contador con cada guardado de progreso de los 10s tras cruzar el 90%).
  if (completadoFinal && !anterior?.completado) {
    await prisma.$transaction([
      prisma.episodio.update({ where: { id: episodioId }, data: { vistas: { increment: 1 } } }),
      prisma.serie.update({ where: { id: episodio.temporada.serieId }, data: { vistas: { increment: 1 } } }),
    ]);
  }

  return NextResponse.json({ progreso });
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const perfil = await obtenerPerfilActivo(session.user.id);
  if (!perfil) {
    return NextResponse.json({ error: "Elegí un perfil primero", codigo: "SIN_PERFIL" }, { status: 409 });
  }

  const { searchParams } = new URL(request.url);
  const episodioId = searchParams.get("episodioId");
  const todo = searchParams.get("todo") === "true";

  if (todo) {
    await prisma.progreso.deleteMany({ where: { profileId: perfil.id } });
    return NextResponse.json({ ok: true });
  }

  if (!episodioId) {
    return NextResponse.json({ error: "Falta episodioId" }, { status: 400 });
  }

  await prisma.progreso.deleteMany({ where: { profileId: perfil.id, episodioId } });
  return NextResponse.json({ ok: true });
}
