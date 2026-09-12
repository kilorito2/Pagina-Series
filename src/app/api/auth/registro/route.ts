import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registroSchema } from "@/lib/validaciones/auth";
import { verificarRateLimit, obtenerIp } from "@/lib/rate-limit";
import { enviarEmailVerificacion } from "@/lib/email";

export async function POST(request: Request) {
  const ip = obtenerIp(request);
  const { permitido } = await verificarRateLimit("registro", ip, {
    puntos: 5,
    duracionSeg: 60 * 10,
  });
  if (!permitido) {
    return NextResponse.json(
      { error: "Demasiados intentos. Probá de nuevo en un rato." },
      { status: 429 }
    );
  }

  const body = await request.json().catch(() => null);
  const parseado = registroSchema.safeParse(body);
  if (!parseado.success) {
    return NextResponse.json(
      { error: "Datos inválidos", detalles: parseado.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { email, password } = parseado.data;

  const existente = await prisma.user.findUnique({ where: { email } });
  if (existente) {
    return NextResponse.json({ error: "Ese email ya está registrado" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const usuario = await prisma.user.create({ data: { email, passwordHash } });

  const token = randomBytes(32).toString("hex");
  await prisma.tokenAccion.create({
    data: {
      userId: usuario.id,
      tipo: "VERIFICACION_EMAIL",
      token,
      expira: new Date(Date.now() + 1000 * 60 * 60 * 24),
    },
  });
  await enviarEmailVerificacion(usuario.email, token);

  return NextResponse.json({ ok: true });
}
