import { NextResponse } from "next/server";
import { exigirAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";
import { serieSchema } from "@/lib/validaciones/admin";

type Contexto = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Contexto) {
  const { error } = await exigirAdmin();
  if (error) return error;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parseado = serieSchema.safeParse(body);
  if (!parseado.success) {
    return NextResponse.json(
      { error: "Datos inválidos", detalles: parseado.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { generoIds, ...datos } = parseado.data;

  const otraConEseSlug = await prisma.serie.findFirst({
    where: { slug: datos.slug, NOT: { id } },
  });
  if (otraConEseSlug) {
    return NextResponse.json({ error: "Ya existe otra serie con ese slug" }, { status: 409 });
  }

  const serie = await prisma.$transaction(async (tx) => {
    await tx.generoEnSerie.deleteMany({ where: { serieId: id } });
    return tx.serie.update({
      where: { id },
      data: {
        ...datos,
        tituloAlternativo: datos.tituloAlternativo || null,
        tituloOriginal: datos.tituloOriginal || null,
        banner: datos.banner || null,
        estudio: datos.estudio || null,
        generos: { create: generoIds.map((generoId) => ({ generoId })) },
      },
    });
  });

  return NextResponse.json({ serie });
}

export async function DELETE(_request: Request, { params }: Contexto) {
  const { error } = await exigirAdmin();
  if (error) return error;

  const { id } = await params;
  await prisma.serie.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
