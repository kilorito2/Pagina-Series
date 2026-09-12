import Link from "next/link";
import Image from "next/image";
import { Play } from "lucide-react";
import { rutaVer } from "@/lib/rutas";

export type EpisodioCardData = {
  numero: number;
  titulo: string | null;
  thumbnail: string | null;
  temporada: {
    numero: number;
    serie: { slug: string; titulo: string; poster: string };
  };
  /** 0 a 100. Si se pasa, se muestra la barra de progreso sobre el thumbnail. */
  progresoPorcentaje?: number;
  /** Muestra el badge "Nuevo" (episodios agregados hace pocos días). */
  esNuevo?: boolean;
};

export function EpisodioCard({ episodio }: { episodio: EpisodioCardData }) {
  const { serie } = episodio.temporada;
  const href = rutaVer(serie.slug, episodio.temporada.numero, episodio.numero);
  const progreso =
    typeof episodio.progresoPorcentaje === "number"
      ? Math.min(100, Math.max(0, episodio.progresoPorcentaje))
      : null;

  return (
    <Link href={href} className="group block outline-none">
      <div className="tarjeta-elevar relative aspect-video overflow-hidden rounded-xl bg-muted shadow-[var(--sombra-card)] ring-1 ring-white/5 group-focus-visible:ring-2 group-focus-visible:ring-primary">
        <Image
          src={episodio.thumbnail ?? serie.poster}
          alt=""
          fill
          sizes="(min-width: 1024px) 260px, 60vw"
          className="object-cover transition-transform duration-500 ease-out-fuerte puntero-fino:group-hover:scale-[1.07] group-focus-visible:scale-[1.07]"
        />

        <div className="absolute inset-0 flex items-center justify-center bg-black/45 opacity-0 transition-opacity duration-200 ease-out group-hover:opacity-100 group-focus-visible:opacity-100">
          <span className="flex size-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/40 transition-transform duration-200 ease-out-fuerte scale-75 group-hover:scale-100 group-focus-visible:scale-100">
            <Play className="size-4.5 fill-current" />
          </span>
        </div>

        <span className="absolute top-1.5 left-1.5 rounded-md bg-black/70 px-1.5 py-0.5 text-[11px] font-medium text-white backdrop-blur-sm">
          T{episodio.temporada.numero} · E{episodio.numero}
        </span>
        {episodio.esNuevo && (
          <span className="latido absolute top-1.5 right-1.5 rounded-md bg-brand-accent px-1.5 py-0.5 text-[11px] font-semibold text-brand-accent-foreground">
            Nuevo
          </span>
        )}

        {progreso !== null && (
          <div className="absolute inset-x-0 bottom-0 h-1 bg-black/50">
            <div
              className="h-full bg-primary shadow-[0_0_8px_var(--color-primary)]"
              style={{ width: `${progreso}%` }}
            />
          </div>
        )}
      </div>
      <p className="mt-2 line-clamp-1 text-sm font-medium transition-colors duration-200 ease-out group-hover:text-primary">
        {serie.titulo}
      </p>
      <p className="line-clamp-1 text-xs text-muted-foreground">
        {episodio.titulo ?? `Episodio ${episodio.numero}`}
      </p>
    </Link>
  );
}
