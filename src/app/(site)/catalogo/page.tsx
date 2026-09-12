import type { Metadata } from "next";
import Link from "next/link";
import { SearchX } from "lucide-react";
import { catalogoFiltrosSchema } from "@/lib/validaciones/catalogo";
import { obtenerCatalogo, obtenerGeneros, obtenerAniosDisponibles } from "@/lib/queries/catalogo";
import { Button } from "@/components/ui/button";
import { SerieCard } from "@/components/shared/serie-card";
import { Revelar } from "@/components/shared/revelar";
import { EstadoVacio } from "@/components/shared/estado-vacio";
import { FiltrosCatalogo } from "./filtros-catalogo";
import { PaginacionCatalogo } from "./paginacion-catalogo";

export const metadata: Metadata = { title: "Catálogo" };

type SearchParamsCatalogo = Record<string, string | string[] | undefined>;

function primero(valor: string | string[] | undefined) {
  return Array.isArray(valor) ? valor[0] : valor;
}

export default async function CatalogoPage({
  searchParams,
}: {
  searchParams: Promise<SearchParamsCatalogo>;
}) {
  const rawParams = await searchParams;
  const filtros = catalogoFiltrosSchema.parse({
    genero: primero(rawParams.genero),
    anio: primero(rawParams.anio),
    estado: primero(rawParams.estado),
    tipo: primero(rawParams.tipo),
    clasificacion: primero(rawParams.clasificacion),
    idioma: primero(rawParams.idioma),
    orden: primero(rawParams.orden),
    pagina: primero(rawParams.pagina),
  });

  const [{ series, total, totalPaginas }, generos, anios] = await Promise.all([
    obtenerCatalogo(filtros),
    obtenerGeneros(),
    obtenerAniosDisponibles(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="mb-1 text-2xl font-semibold tracking-tight sm:text-3xl">Catálogo</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        {total} {total === 1 ? "serie" : "series"}
      </p>

      <FiltrosCatalogo generos={generos} anios={anios} />

      {series.length === 0 ? (
        <EstadoVacio
          className="mt-6"
          icono={SearchX}
          titulo="Ninguna serie coincide"
          descripcion="Ningún título entra en esta combinación de filtros. Probá sacando alguno."
          accion={
            <Button render={<Link href="/catalogo" />} variant="outline" size="sm">
              Limpiar filtros
            </Button>
          }
        />
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {series.map((serie, i) => (
            // Escalonado corto y con tope: 12 pasos de 25ms = 300ms como
            // máximo. Más que eso y la última fila se siente lenta.
            <Revelar key={serie.id} retraso={Math.min(i, 12) * 25}>
              <SerieCard serie={serie} />
            </Revelar>
          ))}
        </div>
      )}

      <PaginacionCatalogo
        paginaActual={filtros.pagina}
        totalPaginas={totalPaginas}
        searchParams={rawParams}
      />
    </div>
  );
}
