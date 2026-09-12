import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { perfilSchema } from "@/lib/validaciones/perfil";
import { siteConfig } from "@/lib/config";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const perfiles = await prisma.profile.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json({ perfiles });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const cantidad = await prisma.profile.count({ where: { userId: session.user.id } });
  if (cantidad >= siteConfig.maxPerfilesPorCuenta) {
    return NextResponse.json(
      { error: `Máximo ${siteConfig.maxPerfilesPorCuenta} perfiles por cuenta` },
      { status: 409 }
    );
  }

  const body = await request.json().catch(() => null);
  const parseado = perfilSchema.safeParse(body);
  if (!parseado.success) {
    return NextResponse.json(
      { error: "Datos inválidos", detalles: parseado.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const perfil = await prisma.profile.create({
    data: { ...parseado.data, userId: session.user.id },
  });

  return NextResponse.json({ perfil }, { status: 201 });
}
