import { NextResponse } from "next/server";
import { exigirAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";
import { episodioSchema } from "@/lib/validaciones/admin";

type Contexto = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Contexto) {
  const { error } = await exigirAdmin();
  if (error) return error;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parseado = episodioSchema.partial().safeParse(body);
  if (!parseado.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const { titulo, sinopsis, duracionMin, thumbnail, numero } = parseado.data;
  const episodio = await prisma.episodio.update({
    where: { id },
    data: {
      ...(numero !== undefined && { numero }),
      ...(titulo !== undefined && { titulo: titulo || null }),
      ...(sinopsis !== undefined && { sinopsis: sinopsis || null }),
      ...(duracionMin !== undefined && { duracionMin }),
      ...(thumbnail !== undefined && { thumbnail: thumbnail || null }),
    },
  });

  return NextResponse.json({ episodio });
}

export async function DELETE(_request: Request, { params }: Contexto) {
  const { error } = await exigirAdmin();
  if (error) return error;

  const { id } = await params;
  await prisma.episodio.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
