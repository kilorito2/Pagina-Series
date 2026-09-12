"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowUpDown, Layers, Pencil, Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ETIQUETA_ESTADO, ETIQUETA_TIPO } from "@/lib/etiquetas";
import type { OrdenSeriesAdmin } from "@/lib/queries/admin";

type FilaSerie = {
  id: string;
  titulo: string;
  slug: string;
  poster: string;
  anio: number;
  estado: "EMISION" | "FINALIZADO" | "PROXIMAMENTE";
  tipo: "TV" | "OVA" | "PELICULA" | "ESPECIAL" | "ONA";
  vistas: number;
  _count: { temporadas: number };
};

const COLUMNAS: { orden: OrdenSeriesAdmin; label: string }[] = [
  { orden: "titulo", label: "Título" },
  { orden: "anio", label: "Año" },
  { orden: "vistas", label: "Vistas" },
];

export function TablaSeries({
  series,
  q,
  ordenActual,
}: {
  series: FilaSerie[];
  q?: string;
  ordenActual: OrdenSeriesAdmin;
}) {
  const router = useRouter();
  const [seleccionadas, setSeleccionadas] = useState<Set<string>>(new Set());
  const [borrando, setBorrando] = useState(false);

  function hrefOrden(orden: OrdenSeriesAdmin) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    params.set("orden", orden);
    return `/admin/series?${params.toString()}`;
  }

  function alternarTodas(marcar: boolean) {
    setSeleccionadas(marcar ? new Set(series.map((s) => s.id)) : new Set());
  }

  function alternarUna(id: string, marcar: boolean) {
    setSeleccionadas((prev) => {
      const nuevo = new Set(prev);
      if (marcar) nuevo.add(id);
      else nuevo.delete(id);
      return nuevo;
    });
  }

  async function borrarSeleccionadas() {
    if (seleccionadas.size === 0) return;
    if (!confirm(`¿Eliminar ${seleccionadas.size} serie(s)? No se puede deshacer.`)) return;

    setBorrando(true);
    const respuesta = await fetch("/api/admin/series/bulk-delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: [...seleccionadas] }),
    });
    setBorrando(false);

    if (!respuesta.ok) {
      toast.error("No pudimos eliminar las series seleccionadas.");
      return;
    }
    toast.success("Series eliminadas");
    setSeleccionadas(new Set());
    router.refresh();
  }

  async function borrarUna(id: string) {
    if (!confirm("¿Eliminar esta serie? No se puede deshacer.")) return;
    const respuesta = await fetch(`/api/admin/series/${id}`, { method: "DELETE" });
    if (!respuesta.ok) {
      toast.error("No pudimos eliminar la serie.");
      return;
    }
    toast.success("Serie eliminada");
    router.refresh();
  }

  return (
    <div className="space-y-2">
      {seleccionadas.size > 0 && (
        <div className="flex items-center gap-2 rounded-md bg-muted px-3 py-2 text-sm">
          {seleccionadas.size} seleccionada(s)
          <Button size="sm" variant="destructive" disabled={borrando} onClick={borrarSeleccionadas}>
            <Trash2 className="size-3.5" />
            Eliminar
          </Button>
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  checked={series.length > 0 && seleccionadas.size === series.length}
                  onCheckedChange={(v) => alternarTodas(!!v)}
                />
              </TableHead>
              <TableHead>Poster</TableHead>
              {COLUMNAS.map((c) => (
                <TableHead key={c.orden}>
                  <Link href={hrefOrden(c.orden)} className="inline-flex items-center gap-1 hover:text-foreground">
                    {c.label}
                    <ArrowUpDown className={c.orden === ordenActual ? "size-3 text-primary" : "size-3"} />
                  </Link>
                </TableHead>
              ))}
              <TableHead>Estado</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Temporadas</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {series.map((serie) => (
              <TableRow key={serie.id}>
                <TableCell>
                  <Checkbox
                    checked={seleccionadas.has(serie.id)}
                    onCheckedChange={(v) => alternarUna(serie.id, !!v)}
                  />
                </TableCell>
                <TableCell>
                  <span className="relative block size-10 overflow-hidden rounded bg-muted">
                    <Image src={serie.poster} alt="" fill sizes="40px" className="object-cover" />
                  </span>
                </TableCell>
                <TableCell className="max-w-48 truncate font-medium">{serie.titulo}</TableCell>
                <TableCell>{serie.anio}</TableCell>
                <TableCell>{serie.vistas}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{ETIQUETA_ESTADO[serie.estado]}</Badge>
                </TableCell>
                <TableCell>{ETIQUETA_TIPO[serie.tipo]}</TableCell>
                <TableCell>{serie._count.temporadas}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      render={<Link href={`/admin/series/${serie.id}/temporadas`} />}
                      aria-label="Temporadas y episodios"
                    >
                      <Layers className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      render={<Link href={`/admin/series/${serie.id}/editar`} />}
                      aria-label="Editar"
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => borrarUna(serie.id)}
                      aria-label="Eliminar"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
