import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { obtenerPerfilActivo } from "@/lib/perfil-activo";
import { miListaSchema } from "@/lib/validaciones/mi-lista";

async function requerirPerfilActivo() {
  const session = await auth();
  if (!session?.user) return { error: NextResponse.json({ error: "No autenticado" }, { status: 401 }) };

  const perfil = await obtenerPerfilActivo(session.user.id);
  if (!perfil) {
    return {
      error: NextResponse.json({ error: "Elegí un perfil primero", codigo: "SIN_PERFIL" }, { status: 409 }),
    };
  }
  return { perfil };
}

export async function POST(request: Request) {
  const { perfil, error } = await requerirPerfilActivo();
  if (error) return error;

  const body = await request.json().catch(() => null);
  const parseado = miListaSchema.safeParse(body);
  if (!parseado.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const { serieId, estado } = parseado.data;

  const item = await prisma.listaItem.upsert({
    where: { profileId_serieId: { profileId: perfil!.id, serieId } },
    update: { estado },
    create: { profileId: perfil!.id, serieId, estado },
  });

  return NextResponse.json({ item });
}

export async function DELETE(request: Request) {
  const { perfil, error } = await requerirPerfilActivo();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const serieId = searchParams.get("serieId");
  if (!serieId) {
    return NextResponse.json({ error: "Falta serieId" }, { status: 400 });
  }

  await prisma.listaItem.deleteMany({ where: { profileId: perfil!.id, serieId } });

  return NextResponse.json({ ok: true });
}
