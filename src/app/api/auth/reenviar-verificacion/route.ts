import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { emailSchema } from "@/lib/validaciones/auth";
import { verificarRateLimit, obtenerIp } from "@/lib/rate-limit";
import { enviarEmailVerificacion } from "@/lib/email";

export async function POST(request: Request) {
  const ip = obtenerIp(request);
  const { permitido } = await verificarRateLimit("reenviar-verificacion", ip, {
    puntos: 3,
    duracionSeg: 60 * 10,
  });
  if (!permitido) {
    return NextResponse.json(
      { error: "Demasiados intentos. Probá de nuevo en un rato." },
      { status: 429 }
    );
  }

  const body = await request.json().catch(() => null);
  const parseado = emailSchema.safeParse(body);
  if (!parseado.success) {
    return NextResponse.json({ error: "Email inválido" }, { status: 400 });
  }

  const usuario = await prisma.user.findUnique({ where: { email: parseado.data.email } });
  if (usuario && !usuario.emailVerified) {
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
  }

  // Siempre "ok", exista o no la cuenta / ya esté verificada.
  return NextResponse.json({ ok: true });
}
