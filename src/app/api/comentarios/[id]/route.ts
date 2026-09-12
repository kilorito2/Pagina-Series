import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { obtenerPerfilActivo } from "@/lib/perfil-activo";

type Contexto = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, { params }: Contexto) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { id } = await params;
  const comentario = await prisma.comentario.findUnique({ where: { id } });
  if (!comentario) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  const esAdmin = session.user.role === "ADMIN" || session.user.role === "MOD";
  if (!esAdmin) {
    const perfil = await obtenerPerfilActivo(session.user.id);
    if (!perfil || perfil.id !== comentario.profileId) {
      return NextResponse.json({ error: "No podés borrar este comentario" }, { status: 403 });
    }
  }

  await prisma.comentario.update({ where: { id }, data: { eliminado: true } });
  return NextResponse.json({ ok: true });
}
