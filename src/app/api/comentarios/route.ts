import { NextResponse } from "next/server";
import DOMPurify from "isomorphic-dompurify";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { obtenerPerfilActivo } from "@/lib/perfil-activo";
import { comentarioSchema } from "@/lib/validaciones/comentario";
import { verificarRateLimit, obtenerIp } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const perfil = await obtenerPerfilActivo(session.user.id);
  if (!perfil) {
    return NextResponse.json({ error: "Elegí un perfil primero", codigo: "SIN_PERFIL" }, { status: 409 });
  }

  const ip = obtenerIp(request);
  const { permitido } = await verificarRateLimit("comentarios", `${ip}:${perfil.id}`, {
    puntos: 8,
    duracionSeg: 60,
  });
  if (!permitido) {
    return NextResponse.json({ error: "Estás comentando muy rápido, esperá un poco." }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parseado = comentarioSchema.safeParse(body);
  if (!parseado.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const { contenido, spoiler, serieId, episodioId, parentId } = parseado.data;
  // Sin HTML: es un campo de texto plano, no un editor de texto enriquecido.
  const contenidoLimpio = DOMPurify.sanitize(contenido, { ALLOWED_TAGS: [] }).trim();
  if (!contenidoLimpio) {
    return NextResponse.json({ error: "El comentario quedó vacío" }, { status: 400 });
  }

  if (parentId) {
    const padre = await prisma.comentario.findUnique({ where: { id: parentId } });
    if (!padre) return NextResponse.json({ error: "El comentario al que respondés ya no existe" }, { status: 404 });
  }

  const comentario = await prisma.comentario.create({
    data: {
      profileId: perfil.id,
      serieId,
      episodioId,
      parentId,
      contenido: contenidoLimpio,
      spoiler,
    },
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

  return NextResponse.json({ comentario: { ...comentario, hijos: [] } }, { status: 201 });
}
