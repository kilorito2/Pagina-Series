import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * "Cerrar sesión en todos los dispositivos". Con estrategia JWT no hay
 * sesiones que borrar en la base: marcamos la fecha y lib/auth.ts invalida
 * cualquier token emitido antes (con hasta 5 minutos de margen — ver
 * el comentario en el callback jwt()).
 */
export async function POST() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { sesionesInvalidadasEn: new Date() },
  });

  return NextResponse.json({ ok: true });
}
