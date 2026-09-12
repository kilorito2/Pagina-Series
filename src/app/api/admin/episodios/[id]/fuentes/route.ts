import { NextResponse } from "next/server";
import { exigirAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";
import { fuenteSchema } from "@/lib/validaciones/admin";

type Contexto = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Contexto) {
  const { error } = await exigirAdmin();
  if (error) return error;

  const { id: episodioId } = await params;
  const body = await request.json().catch(() => null);
  const parseado = fuenteSchema.safeParse(body);
  if (!parseado.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const fuente = await prisma.fuenteVideo.create({
    data: { episodioId, ...parseado.data },
  });

  return NextResponse.json({ fuente }, { status: 201 });
}
