import { NextResponse } from "next/server";
import { exigirAdmin } from "@/lib/admin-guard";
import { buscarEnJikan } from "@/lib/importador/jikan";

export async function GET(request: Request) {
  const { error } = await exigirAdmin();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();
  if (!q) return NextResponse.json({ resultados: [] });

  try {
    const resultados = await buscarEnJikan(q);
    return NextResponse.json({ resultados });
  } catch {
    return NextResponse.json({ error: "No pudimos buscar en Jikan ahora mismo" }, { status: 502 });
  }
}
