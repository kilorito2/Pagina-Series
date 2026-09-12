import { NextResponse } from "next/server";
import { exigirAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";
import { temporadaSchema } from "@/lib/validaciones/admin";

type Contexto = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Contexto) {
  const { error } = await exigirAdmin();
  if (error) return error;

  const { id: serieId } = await params;
  const body = await request.json().catch(() => null);
  const parseado = temporadaSchema.safeParse(body);
  if (!parseado.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const { numero, titulo, anio } = parseado.data;

  const existente = await prisma.temporada.findUnique({
    where: { serieId_numero: { serieId, numero } },
  });
  if (existente) {
    return NextResponse.json({ error: "Ya existe una temporada con ese número" }, { status: 409 });
  }

  const temporada = await prisma.temporada.create({
    data: { serieId, numero, titulo: titulo || null, anio },
  });

  return NextResponse.json({ temporada }, { status: 201 });
}
