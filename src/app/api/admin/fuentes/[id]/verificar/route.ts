import { NextResponse } from "next/server";
import { exigirAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";

type Contexto = { params: Promise<{ id: string }> };

/**
 * Chequeo best-effort: solo confirma que la URL responde. No garantiza que
 * el video adentro funcione (no podemos inspeccionar el reproductor de un
 * servidor externo), pero agarra el caso más común: el link ya no existe.
 */
export async function POST(_request: Request, { params }: Contexto) {
  const { error } = await exigirAdmin();
  if (error) return error;

  const { id } = await params;
  const fuente = await prisma.fuenteVideo.findUnique({ where: { id } });
  if (!fuente) {
    return NextResponse.json({ error: "Fuente no encontrada" }, { status: 404 });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);

  let alcanzable = false;
  let status: number | null = null;

  try {
    let respuesta = await fetch(fuente.url, { method: "HEAD", signal: controller.signal });
    if (respuesta.status === 405) {
      respuesta = await fetch(fuente.url, { method: "GET", signal: controller.signal });
    }
    status = respuesta.status;
    alcanzable = respuesta.ok;
  } catch {
    alcanzable = false;
  } finally {
    clearTimeout(timeout);
  }

  if (!alcanzable) {
    await prisma.fuenteVideo.update({
      where: { id },
      data: { reportesCaido: { increment: 1 } },
    });
  }

  return NextResponse.json({ alcanzable, status });
}
