import type { Metadata } from "next";
import Link from "next/link";
import { SearchX, Search } from "lucide-react";
import { buscarSeries } from "@/lib/buscar-series";
import { Button } from "@/components/ui/button";
import { SerieCard } from "@/components/shared/serie-card";
import { Revelar } from "@/components/shared/revelar";
import { EstadoVacio } from "@/components/shared/estado-vacio";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}): Promise<Metadata> {
  const { q } = await searchParams;
  return {
    title: q ? `Resultados para "${q}"` : "Buscar",
    // Página de resultados: contenido duplicado del catálogo/fichas, no
    // aporta nada indexada aparte.
    robots: { index: false, follow: true },
  };
}

export default async function BuscarPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";
  const series = query ? await buscarSeries(query, 40) : [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight sm:text-3xl">
        {query ? (
          <>
            Resultados para <span className="text-primary">&ldquo;{query}&rdquo;</span>
          </>
        ) : (
          "Buscar"
        )}
      </h1>

      {!query && (
        <EstadoVacio
          icono={Search}
          titulo="Buscá una serie"
          descripcion="Escribí un título en el buscador de arriba. También podés recorrer el catálogo completo."
          accion={
            <Button render={<Link href="/catalogo" />} variant="outline" size="sm">
              Ver catálogo
            </Button>
          }
        />
      )}

      {query && series.length === 0 && (
        <EstadoVacio
          icono={SearchX}
          titulo="Sin resultados"
          descripcion={<>No encontramos series que coincidan con &ldquo;{query}&rdquo;.</>}
          accion={
            <Button render={<Link href="/catalogo" />} variant="outline" size="sm">
              Ver catálogo
            </Button>
          }
        />
      )}

      {series.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {series.map((serie, i) => (
            <Revelar key={serie.id} retraso={Math.min(i, 12) * 25}>
              <SerieCard serie={serie} />
            </Revelar>
          ))}
        </div>
      )}
    </div>
  );
}
