import Link from "next/link";
import Image from "next/image";
import { Play } from "lucide-react";
import type { SerieCardData } from "@/components/shared/serie-card";

/** Tarjeta de la fila "Top 10" (estilo Netflix): mismo poster que
 * `SerieCard`, con el puesto como número grande semi-transparente detrás. */
export function TopDiezCard({ serie, puesto }: { serie: SerieCardData; puesto: number }) {
  return (
    <Link href={`/serie/${serie.slug}`} className="group relative flex items-end outline-none">
      {/* El número se corre al hover, en sentido contrario al poster que sube:
          refuerza la profundidad sin animar color (los stops de gradiente no
          son interpolables de forma confiable entre navegadores). */}
      <span
        aria-hidden
        className="-mr-4 shrink-0 select-none bg-gradient-to-b from-muted-foreground/40 to-muted-foreground/5 bg-clip-text text-[5.5rem] leading-[0.8] font-black text-transparent transition-transform duration-300 ease-out-fuerte puntero-fino:group-hover:-translate-x-1.5 sm:text-[6.5rem]"
        style={{ WebkitTextStroke: "2px var(--muted-foreground)" }}
      >
        {puesto}
      </span>
      <div className="tarjeta-elevar relative aspect-[2/3] w-24 shrink-0 overflow-hidden rounded-xl bg-muted shadow-[var(--sombra-card)] ring-1 ring-white/5 group-focus-visible:ring-2 group-focus-visible:ring-primary sm:w-32">
        <Image
          src={serie.poster}
          alt={serie.titulo}
          fill
          sizes="(min-width: 640px) 128px, 96px"
          className="object-cover transition-transform duration-500 ease-out-fuerte puntero-fino:group-hover:scale-[1.07] group-focus-visible:scale-[1.07]"
        />
        <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/92 via-black/30 to-transparent p-2 opacity-0 transition-opacity duration-200 ease-out group-hover:opacity-100 group-focus-visible:opacity-100">
          <span className="mb-1.5 flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 transition-transform duration-200 ease-out-fuerte delay-75 scale-75 group-hover:scale-100 group-focus-visible:scale-100">
            <Play className="size-3.5 fill-current" />
          </span>
          <p className="line-clamp-2 text-xs leading-snug font-medium text-white">{serie.titulo}</p>
        </div>
      </div>
    </Link>
  );
}
