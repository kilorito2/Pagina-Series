"use client";

import { useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { SerieInput } from "@/lib/validaciones/admin";
import { FormularioSerie } from "../series/formulario-serie";
import { mapearEstadoJikan, mapearGenerosJikan, mapearTipoJikan } from "@/lib/importador/mapeo";

type ResultadoBusqueda = {
  malId: number;
  titulo: string;
  tituloIngles: string | null;
  poster: string | null;
  anio: number | null;
  tipo: string | null;
  episodios: number | null;
};

type GeneroOpcion = { id: string; nombre: string };

export function Importador({ generosDisponibles }: { generosDisponibles: GeneroOpcion[] }) {
  const [query, setQuery] = useState("");
  const [buscando, setBuscando] = useState(false);
  const [resultados, setResultados] = useState<ResultadoBusqueda[]>([]);
  const [cargandoDetalle, setCargandoDetalle] = useState<number | null>(null);
  const [valoresIniciales, setValoresIniciales] = useState<Partial<SerieInput> | null>(null);
  const [episodiosSugeridos, setEpisodiosSugeridos] = useState<number | null>(null);

  async function buscar() {
    if (!query.trim()) return;
    setBuscando(true);
    setValoresIniciales(null);
    try {
      const r = await fetch(`/api/admin/importador/buscar?q=${encodeURIComponent(query)}`);
      const cuerpo = await r.json();
      if (!r.ok) throw new Error(cuerpo.error);
      setResultados(cuerpo.resultados);
    } catch {
      toast.error("No pudimos buscar en Jikan ahora mismo.");
    } finally {
      setBuscando(false);
    }
  }

  async function importar(malId: number) {
    setCargandoDetalle(malId);
    try {
      const r = await fetch(`/api/admin/importador/detalle?malId=${malId}`);
      const cuerpo = await r.json();
      if (!r.ok) throw new Error(cuerpo.error);
      const d = cuerpo.detalle;

      const nombresGenerosMapeados = mapearGenerosJikan(d.generos);
      const generoIds = generosDisponibles
        .filter((g) => nombresGenerosMapeados.includes(g.nombre))
        .map((g) => g.id);

      setValoresIniciales({
        titulo: d.titulo,
        tituloAlternativo: d.tituloIngles ?? "",
        tituloOriginal: d.tituloOriginal ?? "",
        sinopsis: d.sinopsis ?? "",
        poster: d.poster ?? "",
        anio: d.anio ?? new Date().getFullYear(),
        estado: mapearEstadoJikan(d.estadoEmision) as SerieInput["estado"],
        tipo: mapearTipoJikan(d.tipo) as SerieInput["tipo"],
        estudio: d.estudio ?? "",
        generoIds,
      });
      setEpisodiosSugeridos(d.episodios);
      toast.success("Datos importados, revisalos antes de guardar");
    } catch {
      toast.error("No pudimos traer el detalle de esa serie.");
    } finally {
      setCargandoDetalle(null);
    }
  }

  return (
    <div className="space-y-6">
      <form
        className="flex max-w-lg gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          buscar();
        }}
      >
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar anime en MyAnimeList..." />
        <Button type="submit" disabled={buscando}>
          {buscando ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
          Buscar
        </Button>
      </form>

      {resultados.length > 0 && !valoresIniciales && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {resultados.map((r) => (
            <Card key={r.malId} className="overflow-hidden">
              <div className="relative aspect-[2/3] bg-muted">
                {r.poster && <Image src={r.poster} alt="" fill sizes="160px" className="object-cover" />}
              </div>
              <CardContent className="space-y-2 p-2">
                <p className="line-clamp-2 text-xs font-medium">{r.titulo}</p>
                <p className="text-xs text-muted-foreground">
                  {r.anio ?? "—"} · {r.tipo ?? "?"} · {r.episodios ?? "?"} eps
                </p>
                <Button
                  size="sm"
                  className="w-full"
                  disabled={cargandoDetalle !== null}
                  onClick={() => importar(r.malId)}
                >
                  {cargandoDetalle === r.malId ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    "Importar"
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {valoresIniciales && (
        <div className="space-y-2">
          {episodiosSugeridos && (
            <p className="text-sm text-muted-foreground">
              Jikan reporta {episodiosSugeridos} episodios — después de crear la serie, generalos
              desde &ldquo;Temporadas y episodios → Generar en lote&rdquo;.
            </p>
          )}
          <FormularioSerie generosDisponibles={generosDisponibles} valoresIniciales={valoresIniciales} />
        </div>
      )}
    </div>
  );
}
