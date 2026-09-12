import { NextResponse } from "next/server";
import { z } from "zod";
import { exigirAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";

const schema = z.object({ ids: z.array(z.string()).min(1) });

export async function POST(request: Request) {
  const { error } = await exigirAdmin();
  if (error) return error;

  const body = await request.json().catch(() => null);
  const parseado = schema.safeParse(body);
  if (!parseado.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const { count } = await prisma.serie.deleteMany({ where: { id: { in: parseado.data.ids } } });
  return NextResponse.json({ ok: true, eliminadas: count });
}
