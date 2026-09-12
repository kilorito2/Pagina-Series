import { NextResponse } from "next/server";
import { exigirAdminEstricto } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";
import { usuarioAdminSchema } from "@/lib/validaciones/admin";

type Contexto = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Contexto) {
  const { error, session } = await exigirAdminEstricto();
  if (error) return error;

  const { id } = await params;
  if (id === session!.user.id) {
    return NextResponse.json({ error: "No podés modificarte a vos mismo desde acá" }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const parseado = usuarioAdminSchema.safeParse(body);
  if (!parseado.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const { role, baneado, motivoBaneo } = parseado.data;
  const usuario = await prisma.user.update({
    where: { id },
    data: {
      ...(role !== undefined && { role }),
      ...(baneado !== undefined && { baneado, motivoBaneo: baneado ? motivoBaneo || null : null }),
    },
  });

  return NextResponse.json({ usuario });
}
