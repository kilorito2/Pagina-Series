import { NextResponse } from "next/server";
import { exigirAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";
import { generoSchema } from "@/lib/validaciones/admin";
import { slugify } from "@/lib/slug";

type Contexto = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Contexto) {
  const { error } = await exigirAdmin();
  if (error) return error;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parseado = generoSchema.safeParse(body);
  if (!parseado.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const genero = await prisma.genero.update({
    where: { id },
    data: { nombre: parseado.data.nombre, slug: slugify(parseado.data.nombre) },
  });
  return NextResponse.json({ genero });
}

export async function DELETE(_request: Request, { params }: Contexto) {
  const { error } = await exigirAdmin();
  if (error) return error;

  const { id } = await params;
  await prisma.genero.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
