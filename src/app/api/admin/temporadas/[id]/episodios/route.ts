import { NextResponse } from "next/server";
import { exigirAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";
import { episodioSchema } from "@/lib/validaciones/admin";

type Contexto = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Contexto) {
  const { error } = await exigirAdmin();
  if (error) return error;

  const { id: temporadaId } = await params;
  const body = await request.json().catch(() => null);
  const parseado = episodioSchema.safeParse(body);
  if (!parseado.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const { numero, titulo, sinopsis, duracionMin, thumbnail } = parseado.data;

  const existente = await prisma.episodio.findUnique({
    where: { temporadaId_numero: { temporadaId, numero } },
  });
  if (existente) {
    return NextResponse.json({ error: "Ya existe un episodio con ese número" }, { status: 409 });
  }

  const episodio = await prisma.episodio.create({
    data: {
      temporadaId,
      numero,
      titulo: titulo || null,
      sinopsis: sinopsis || null,
      duracionMin,
      thumbnail: thumbnail || null,
    },
  });

  return NextResponse.json({ episodio }, { status: 201 });
}
