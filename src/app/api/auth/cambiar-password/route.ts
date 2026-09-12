import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cambiarPasswordSchema } from "@/lib/validaciones/password";
import { verificarRateLimit, obtenerIp } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const ip = obtenerIp(request);
  const { permitido } = await verificarRateLimit("cambiar-password", `${ip}:${session.user.id}`, {
    puntos: 5,
    duracionSeg: 60 * 10,
  });
  if (!permitido) {
    return NextResponse.json({ error: "Demasiados intentos. Probá de nuevo en un rato." }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parseado = cambiarPasswordSchema.safeParse(body);
  if (!parseado.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const { passwordActual, passwordNueva } = parseado.data;

  const usuario = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!usuario) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
  }

  // Si ya tiene contraseña (no es una cuenta 100% Google), hay que confirmarla.
  if (usuario.passwordHash) {
    const coincide = passwordActual
      ? await bcrypt.compare(passwordActual, usuario.passwordHash)
      : false;
    if (!coincide) {
      return NextResponse.json({ error: "La contraseña actual no es correcta" }, { status: 400 });
    }
  }

  const passwordHash = await bcrypt.hash(passwordNueva, 12);
  await prisma.user.update({ where: { id: usuario.id }, data: { passwordHash } });

  return NextResponse.json({ ok: true });
}
