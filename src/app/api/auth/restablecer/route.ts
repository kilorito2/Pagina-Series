import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { restablecerSchema } from "@/lib/validaciones/auth";
import { verificarRateLimit, obtenerIp } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const ip = obtenerIp(request);
  const { permitido } = await verificarRateLimit("restablecer", ip, {
    puntos: 8,
    duracionSeg: 60 * 10,
  });
  if (!permitido) {
    return NextResponse.json(
      { error: "Demasiados intentos. Probá de nuevo en un rato." },
      { status: 429 }
    );
  }

  const body = await request.json().catch(() => null);
  const parseado = restablecerSchema.safeParse(body);
  if (!parseado.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const { token, password } = parseado.data;

  const tokenAccion = await prisma.tokenAccion.findUnique({ where: { token } });
  if (
    !tokenAccion ||
    tokenAccion.tipo !== "RESET_PASSWORD" ||
    tokenAccion.usado ||
    tokenAccion.expira < new Date()
  ) {
    return NextResponse.json(
      { error: "El link venció o ya se usó. Pedí uno nuevo." },
      { status: 400 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.$transaction([
    prisma.user.update({ where: { id: tokenAccion.userId }, data: { passwordHash } }),
    prisma.tokenAccion.update({ where: { id: tokenAccion.id }, data: { usado: true } }),
  ]);

  return NextResponse.json({ ok: true });
}
