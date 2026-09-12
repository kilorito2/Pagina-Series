import { NextResponse } from "next/server";
import { buscarSeries } from "@/lib/buscar-series";
import { busquedaSchema } from "@/lib/validaciones/busqueda";
import { verificarRateLimit, obtenerIp } from "@/lib/rate-limit";

export async function GET(request: Request) {
  const ip = obtenerIp(request);
  const { permitido } = await verificarRateLimit("buscar", ip, { puntos: 30, duracionSeg: 60 });
  if (!permitido) {
    return NextResponse.json({ error: "Demasiadas búsquedas, esperá un momento." }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const parseado = busquedaSchema.safeParse({ q: searchParams.get("q") });
  if (!parseado.success) {
    return NextResponse.json({ series: [] });
  }

  const { q } = parseado.data;
  const resultados = await buscarSeries(q, 8);
  const series = resultados.map((serie) => ({
    id: serie.id,
    slug: serie.slug,
    titulo: serie.titulo,
    poster: serie.poster,
    anio: serie.anio,
  }));

  return NextResponse.json({ series });
}
