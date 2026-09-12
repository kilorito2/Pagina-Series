import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { perfilSchema } from "@/lib/validaciones/perfil";
import { obtenerIdPerfilActivo, limpiarPerfilActivo } from "@/lib/perfil-activo";

type Contexto = { params: Promise<{ id: string }> };

async function verificarPropietario(perfilId: string, userId: string) {
  return prisma.profile.findFirst({ where: { id: perfilId, userId } });
}

export async function PATCH(request: Request, { params }: Contexto) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { id } = await params;
  const perfil = await verificarPropietario(id, session.user.id);
  if (!perfil) {
    return NextResponse.json({ error: "Perfil no encontrado" }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const parseado = perfilSchema.partial().safeParse(body);
  if (!parseado.success) {
    return NextResponse.json(
      { error: "Datos inválidos", detalles: parseado.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const actualizado = await prisma.profile.update({
    where: { id },
    data: parseado.data,
  });

  return NextResponse.json({ perfil: actualizado });
}

export async function DELETE(_request: Request, { params }: Contexto) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { id } = await params;
  const perfil = await verificarPropietario(id, session.user.id);
  if (!perfil) {
    return NextResponse.json({ error: "Perfil no encontrado" }, { status: 404 });
  }

  await prisma.profile.delete({ where: { id } });

  const perfilActivoId = await obtenerIdPerfilActivo();
  if (perfilActivoId === id) {
    await limpiarPerfilActivo();
  }

  return NextResponse.json({ ok: true });
}
