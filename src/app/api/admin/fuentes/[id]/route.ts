import { NextResponse } from "next/server";
import { exigirAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";
import { fuenteSchema } from "@/lib/validaciones/admin";

type Contexto = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Contexto) {
  const { error } = await exigirAdmin();
  if (error) return error;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parseado = fuenteSchema.partial().safeParse(body);
  if (!parseado.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const fuente = await prisma.fuenteVideo.update({ where: { id }, data: parseado.data });
  return NextResponse.json({ fuente });
}

export async function DELETE(_request: Request, { params }: Contexto) {
  const { error } = await exigirAdmin();
  if (error) return error;

  const { id } = await params;
  await prisma.fuenteVideo.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
