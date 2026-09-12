import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { obtenerSeriesAdmin, type OrdenSeriesAdmin } from "@/lib/queries/admin";
import { TablaSeries } from "./tabla-series";
import { PaginacionSimple } from "@/components/shared/paginacion-simple";

export const metadata: Metadata = { title: "Series" };

export default async function AdminSeriesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; pagina?: string; orden?: string }>;
}) {
  const { q, pagina: paginaParam, orden } = await searchParams;
  const pagina = Math.max(1, Number(paginaParam) || 1);
  const ordenValido = (["recientes", "titulo", "anio", "vistas"] as const).includes(
    orden as OrdenSeriesAdmin
  )
    ? (orden as OrdenSeriesAdmin)
    : "recientes";
  const { series, total, totalPaginas } = await obtenerSeriesAdmin({ q, pagina, orden: ordenValido });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold sm:text-2xl">Series</h1>
          <p className="text-sm text-muted-foreground">{total} en total</p>
        </div>
        <Button render={<Link href="/admin/series/nueva" />}>
          <Plus className="size-4" />
          Nueva serie
        </Button>
      </div>

      <form className="max-w-sm">
        <Input type="search" name="q" defaultValue={q} placeholder="Buscar por título..." />
      </form>

      <TablaSeries series={series} q={q} ordenActual={ordenValido} />

      <PaginacionSimple
        paginaActual={pagina}
        totalPaginas={totalPaginas}
        base="/admin/series"
        searchParams={{ q, orden: ordenValido }}
      />
    </div>
  );
}
