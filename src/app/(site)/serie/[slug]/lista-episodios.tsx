"use client";

import Image from "next/image";
import Link from "next/link";
import { Check, Play } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { rutaVer } from "@/lib/rutas";

type Episodio = {
  id: string;
  numero: number;
  titulo: string | null;
  thumbnail: string | null;
  duracionMin: number | null;
};
type Temporada = { numero: number; titulo: string | null; episodios: Episodio[] };

export function ListaEpisodios({
  slugSerie,
  temporadas,
  vistoIds,
}: {
  slugSerie: string;
  temporadas: Temporada[];
  vistoIds: string[];
}) {
  if (temporadas.length === 0) {
    return <p className="text-sm text-muted-foreground">Todavía no hay episodios cargados.</p>;
  }

  const vistos = new Set(vistoIds);

  return (
    <Tabs defaultValue={String(temporadas[0]!.numero)}>
      {temporadas.length > 1 && (
        <TabsList>
          {temporadas.map((temporada) => (
            <TabsTrigger key={temporada.numero} value={String(temporada.numero)}>
              {temporada.titulo ?? `Temporada ${temporada.numero}`}
            </TabsTrigger>
          ))}
        </TabsList>
      )}

      {temporadas.map((temporada) => (
        <TabsContent key={temporada.numero} value={String(temporada.numero)} className="space-y-1.5">
          {temporada.episodios.map((episodio) => (
            <Link
              key={episodio.id}
              href={rutaVer(slugSerie, temporada.numero, episodio.numero)}
              className="group flex items-center gap-3 rounded-lg p-2 outline-none hover:bg-accent focus-visible:bg-accent"
            >
              <div className="relative h-16 w-28 shrink-0 overflow-hidden rounded-md bg-muted">
                {episodio.thumbnail && (
                  <Image src={episodio.thumbnail} alt="" fill sizes="112px" className="object-cover" />
                )}
                <div className="absolute inset-0 flex items-center justify-center transition group-hover:bg-black/40">
                  <Play className="size-5 text-white opacity-0 transition group-hover:opacity-100" />
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {episodio.numero}. {episodio.titulo ?? `Episodio ${episodio.numero}`}
                </p>
                {episodio.duracionMin && (
                  <p className="text-xs text-muted-foreground">{episodio.duracionMin} min</p>
                )}
              </div>
              {vistos.has(episodio.id) && (
                <Check className="size-4 shrink-0 text-brand-accent" aria-label="Visto" />
              )}
            </Link>
          ))}
        </TabsContent>
      ))}
    </Tabs>
  );
}
