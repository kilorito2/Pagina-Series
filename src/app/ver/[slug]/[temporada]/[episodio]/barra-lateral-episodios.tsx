"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { rutaVer } from "@/lib/rutas";

type EpisodioLista = { id: string; numero: number; titulo: string | null; thumbnail: string | null };

export function BarraLateralEpisodios({
  slugSerie,
  temporadaNumero,
  episodios,
  episodioActualId,
}: {
  slugSerie: string;
  temporadaNumero: number;
  episodios: EpisodioLista[];
  episodioActualId: string;
}) {
  const [abiertoMovil, setAbiertoMovil] = useState(false);

  return (
    <aside className="lg:w-80 lg:shrink-0">
      <button
        type="button"
        onClick={() => setAbiertoMovil((v) => !v)}
        aria-expanded={abiertoMovil}
        className="flex w-full items-center justify-between rounded-lg bg-card px-4 py-3 text-sm font-medium ring-1 ring-border transition-colors duration-200 ease-out hover:bg-accent lg:hidden"
      >
        Episodios de esta temporada
        <ChevronDown
          className={cn(
            "size-4 transition-transform duration-300 ease-out-fuerte",
            abiertoMovil && "rotate-180"
          )}
        />
      </button>

      <div
        className={cn(
          "mt-2 max-h-[70vh] space-y-1 overflow-y-auto lg:mt-0 lg:block lg:max-h-[calc(100vh-8rem)]",
          !abiertoMovil && "hidden"
        )}
      >
        {episodios.map((episodio) => {
          const activo = episodio.id === episodioActualId;
          return (
            <Link
              key={episodio.id}
              href={rutaVer(slugSerie, temporadaNumero, episodio.numero)}
              aria-current={activo ? "page" : undefined}
              className={cn(
                "group/ep relative flex items-center gap-3 overflow-hidden rounded-lg p-2 text-sm transition-colors duration-200 ease-out",
                activo ? "bg-primary/15 text-foreground ring-1 ring-primary/40" : "hover:bg-accent"
              )}
            >
              {/* Barra de acento del episodio en curso: se distingue de un
                  simple fondo teñido cuando la lista es larga. */}
              {activo && (
                <span aria-hidden className="absolute inset-y-1 left-0 w-1 rounded-full bg-primary" />
              )}
              <div className="relative h-12 w-20 shrink-0 overflow-hidden rounded-md bg-muted">
                {episodio.thumbnail && (
                  <Image
                    src={episodio.thumbnail}
                    alt=""
                    fill
                    sizes="80px"
                    className="object-cover transition-transform duration-300 ease-out-fuerte puntero-fino:group-hover/ep:scale-110"
                  />
                )}
              </div>
              <span className="min-w-0 flex-1 truncate">
                {episodio.numero}. {episodio.titulo ?? `Episodio ${episodio.numero}`}
              </span>
              {activo && <Check className="size-4 shrink-0 text-primary" />}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
