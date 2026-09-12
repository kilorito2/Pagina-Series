import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { recuperarSchema } from "@/lib/validaciones/auth";
import { verificarRateLimit, obtenerIp } from "@/lib/rate-limit";
import { enviarEmailRecuperacion } from "@/lib/email";

export async function POST(request: Request) {
  const ip = obtenerIp(request);
  const { permitido } = await verificarRateLimit("recuperar", ip, {
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
  const parseado = recuperarSchema.safeParse(body);
  if (!parseado.success) {
    return NextResponse.json({ error: "Email inválido" }, { status: 400 });
  }

  const usuario = await prisma.user.findUnique({ where: { email: parseado.data.email } });

  // Respondemos "ok" siempre exista o no la cuenta, para no filtrar qué
  // emails están registrados.
  if (usuario?.passwordHash) {
    const token = randomBytes(32).toString("hex");
    await prisma.tokenAccion.create({
      data: {
        userId: usuario.id,
        tipo: "RESET_PASSWORD",
        token,
        expira: new Date(Date.now() + 1000 * 60 * 60),
      },
    });
    await enviarEmailRecuperacion(usuario.email, token);
  }

  return NextResponse.json({ ok: true });
}
