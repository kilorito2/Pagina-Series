import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { obtenerCalendarioEmision } from "@/lib/queries/calendario";
import { Revelar } from "@/components/shared/revelar";

export const metadata: Metadata = { title: "Calendario de emisión" };

const DIAS = [
  { indice: 1, nombre: "Lunes" },
  { indice: 2, nombre: "Martes" },
  { indice: 3, nombre: "Miércoles" },
  { indice: 4, nombre: "Jueves" },
  { indice: 5, nombre: "Viernes" },
  { indice: 6, nombre: "Sábado" },
  { indice: 0, nombre: "Domingo" },
] as const;

export default async function CalendarioPage() {
  const series = await obtenerCalendarioEmision();
  const hoy = new Date().getDay();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="mb-1 text-2xl font-semibold tracking-tight sm:text-3xl">
        Calendario de emisión
      </h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Series en emisión, agrupadas por el día habitual de su último episodio.
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-7">
        {DIAS.map((dia, i) => {
          const seriesDelDia = series.filter((s) => s.diaSemana === dia.indice);
          const esHoy = dia.indice === hoy;

          return (
            <Revelar
              key={dia.indice}
              retraso={i * 45}
              className={cn(
                "rounded-xl border p-3 transition-colors duration-200 ease-out",
                esHoy
                  ? "border-primary/60 bg-primary/5 shadow-[0_0_0_1px_color-mix(in_oklch,var(--primary)_25%,transparent),0_18px_40px_-24px_color-mix(in_oklch,var(--primary)_60%,transparent)]"
                  : "border-border hover:border-foreground/20"
              )}
            >
              <h2
                className={cn(
                  "mb-3 flex items-center gap-1.5 text-sm font-semibold",
                  esHoy && "text-primary"
                )}
              >
                {esHoy && <span aria-hidden className="size-1.5 rounded-full bg-primary latido" />}
                {dia.nombre}
                {esHoy && (
                  <span className="text-xs font-normal text-muted-foreground">(hoy)</span>
                )}
              </h2>

              {seriesDelDia.length === 0 ? (
                <p className="text-xs text-muted-foreground">Sin estrenos</p>
              ) : (
                <ul className="space-y-2">
                  {seriesDelDia.map((serie) => (
                    <li key={serie.id}>
                      <Link
                        href={`/serie/${serie.slug}`}
                        className="group/dia flex items-center gap-2 rounded-lg p-1.5 text-sm transition-colors duration-150 ease-out hover:bg-accent"
                      >
                        <span className="relative size-10 shrink-0 overflow-hidden rounded-md bg-muted ring-1 ring-border">
                          <Image
                            src={serie.poster}
                            alt=""
                            fill
                            sizes="40px"
                            className="object-cover transition-transform duration-300 ease-out-fuerte puntero-fino:group-hover/dia:scale-110"
                          />
                        </span>
                        <span className="line-clamp-2">{serie.titulo}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </Revelar>
          );
        })}
      </div>
    </div>
  );
}
