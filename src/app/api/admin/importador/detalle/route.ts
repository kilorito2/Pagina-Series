import { NextResponse } from "next/server";
import { exigirAdmin } from "@/lib/admin-guard";
import { obtenerDetalleJikan } from "@/lib/importador/jikan";

export async function GET(request: Request) {
  const { error } = await exigirAdmin();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const malId = Number(searchParams.get("malId"));
  if (!malId) return NextResponse.json({ error: "Falta malId" }, { status: 400 });

  try {
    const detalle = await obtenerDetalleJikan(malId);
    return NextResponse.json({ detalle });
  } catch {
    return NextResponse.json({ error: "No pudimos traer el detalle de Jikan ahora mismo" }, { status: 502 });
  }
}
