import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fijarPerfilActivo } from "@/lib/perfil-activo";

type Contexto = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: Contexto) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { id } = await params;
  const perfil = await prisma.profile.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!perfil) {
    return NextResponse.json({ error: "Perfil no encontrado" }, { status: 404 });
  }

  await fijarPerfilActivo(perfil.id);

  return NextResponse.json({ ok: true });
}
