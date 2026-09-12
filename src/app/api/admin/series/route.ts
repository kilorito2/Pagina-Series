import { NextResponse } from "next/server";
import { exigirAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";
import { serieSchema } from "@/lib/validaciones/admin";

export async function POST(request: Request) {
  const { error } = await exigirAdmin();
  if (error) return error;

  const body = await request.json().catch(() => null);
  const parseado = serieSchema.safeParse(body);
  if (!parseado.success) {
    return NextResponse.json(
      { error: "Datos inválidos", detalles: parseado.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { generoIds, ...datos } = parseado.data;

  const existente = await prisma.serie.findUnique({ where: { slug: datos.slug } });
  if (existente) {
    return NextResponse.json({ error: "Ya existe una serie con ese slug" }, { status: 409 });
  }

  const serie = await prisma.serie.create({
    data: {
      ...datos,
      tituloAlternativo: datos.tituloAlternativo || null,
      tituloOriginal: datos.tituloOriginal || null,
      banner: datos.banner || null,
      estudio: datos.estudio || null,
      generos: { create: generoIds.map((generoId) => ({ generoId })) },
    },
  });

  return NextResponse.json({ serie }, { status: 201 });
}
