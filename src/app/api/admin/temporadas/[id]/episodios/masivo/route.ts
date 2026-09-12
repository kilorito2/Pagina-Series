import { NextResponse } from "next/server";
import { exigirAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";
import { episodiosMasivoSchema } from "@/lib/validaciones/admin";

type Contexto = { params: Promise<{ id: string }> };

const MAX_POR_TANDA = 100;

export async function POST(request: Request, { params }: Contexto) {
  const { error } = await exigirAdmin();
  if (error) return error;

  const { id: temporadaId } = await params;
  const body = await request.json().catch(() => null);
  const parseado = episodiosMasivoSchema.safeParse(body);
  if (!parseado.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const { desde, hasta, duracionMin } = parseado.data;
  if (hasta < desde) {
    return NextResponse.json({ error: "'Hasta' debe ser mayor o igual a 'desde'" }, { status: 400 });
  }
  if (hasta - desde + 1 > MAX_POR_TANDA) {
    return NextResponse.json({ error: `Máximo ${MAX_POR_TANDA} episodios por tanda` }, { status: 400 });
  }

  const yaExistentes = await prisma.episodio.findMany({
    where: { temporadaId, numero: { gte: desde, lte: hasta } },
    select: { numero: true },
  });
  const existentesSet = new Set(yaExistentes.map((e) => e.numero));

  const numeros: number[] = [];
  for (let n = desde; n <= hasta; n++) {
    if (!existentesSet.has(n)) numeros.push(n);
  }

  if (numeros.length === 0) {
    return NextResponse.json({ error: "Todos esos números de episodio ya existen" }, { status: 409 });
  }

  await prisma.episodio.createMany({
    data: numeros.map((numero) => ({
      temporadaId,
      numero,
      titulo: `Episodio ${numero}`,
      duracionMin,
    })),
  });

  return NextResponse.json({ ok: true, creados: numeros.length });
}
