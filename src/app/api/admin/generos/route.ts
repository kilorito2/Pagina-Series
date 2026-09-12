import { NextResponse } from "next/server";
import { exigirAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";
import { generoSchema } from "@/lib/validaciones/admin";
import { slugify } from "@/lib/slug";

export async function POST(request: Request) {
  const { error } = await exigirAdmin();
  if (error) return error;

  const body = await request.json().catch(() => null);
  const parseado = generoSchema.safeParse(body);
  if (!parseado.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const { nombre } = parseado.data;
  const slug = slugify(nombre);

  const existente = await prisma.genero.findFirst({ where: { OR: [{ nombre }, { slug }] } });
  if (existente) {
    return NextResponse.json({ error: "Ya existe ese género" }, { status: 409 });
  }

  const genero = await prisma.genero.create({ data: { nombre, slug } });
  return NextResponse.json({ genero }, { status: 201 });
}
