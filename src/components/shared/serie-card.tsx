import Link from "next/link";
import Image from "next/image";
import { Play, Star } from "lucide-react";
import type { Serie } from "@prisma/client";
import { ETIQUETA_TIPO } from "@/lib/etiquetas";

export type SerieCardData = Pick<
  Serie,
  "slug" | "titulo" | "poster" | "anio" | "ratingPromedio" | "tipo"
>;

/**
 * Tarjeta de serie: poster 2:3, sin nada encima en reposo. Al hover
 * (o foco por teclado) se eleva y revela título + año + play, como pide
 * DISEÑO en el prompt original.
 *
 * El movimiento es corto y rápido a propósito: es un elemento que se ve
 * decenas de veces por sesión, así que tiene que leerse como respuesta, no
 * como animación.
 */
export function SerieCard({ serie }: { serie: SerieCardData }) {
  return (
    <Link
      href={`/serie/${serie.slug}`}
      className="tarjeta-elevar group relative block aspect-[2/3] overflow-hidden rounded-xl bg-muted shadow-[var(--sombra-card)] ring-1 ring-white/5 outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      <Image
        src={serie.poster}
        alt={serie.titulo}
        fill
        sizes="(min-width: 1024px) 180px, (min-width: 640px) 33vw, 45vw"
        className="object-cover transition-transform duration-500 ease-out-fuerte puntero-fino:group-hover:scale-[1.07] group-focus-visible:scale-[1.07]"
      />

      <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/92 via-black/35 to-transparent p-3 opacity-0 transition-opacity duration-200 ease-out group-hover:opacity-100 group-focus-visible:opacity-100">
        {/* El play entra un pelín después que el degradado (delay-75) para que
            se lea como "aparece la ficha y después el botón", no como un
            bloque que se prende de golpe. */}
        <span className="mb-2 flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 transition-transform duration-200 ease-out-fuerte delay-75 scale-75 group-hover:scale-100 group-focus-visible:scale-100">
          <Play className="size-4 fill-current" />
        </span>
        <p className="line-clamp-2 text-sm leading-snug font-medium text-white">{serie.titulo}</p>
        <p className="mt-0.5 flex items-center gap-1.5 text-xs text-white/70">
          <span>{serie.anio}</span>
          <span aria-hidden>·</span>
          <span>{ETIQUETA_TIPO[serie.tipo]}</span>
          {serie.ratingPromedio > 0 && (
            <>
              <span aria-hidden>·</span>
              <span className="flex items-center gap-0.5">
                <Star className="size-3 fill-brand-accent text-brand-accent" />
                {serie.ratingPromedio.toFixed(1)}
              </span>
            </>
          )}
        </p>
      </div>

      {/* Borde interior que se enciende con el hover: separa la tarjeta del
          fondo oscuro sin agregar un contorno permanente. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-white/0 transition-shadow duration-200 ease-out group-hover:ring-white/20 group-focus-visible:ring-white/20"
      />
    </Link>
  );
}
