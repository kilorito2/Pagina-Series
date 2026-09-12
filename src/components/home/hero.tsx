"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Play, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BotonMiListaRapido } from "@/components/shared/boton-mi-lista-rapido";
import { cn } from "@/lib/utils";
import { rutaPrimerEpisodio } from "@/lib/rutas";

export type SerieDestacada = {
  id: string;
  slug: string;
  titulo: string;
  sinopsis: string;
  banner: string | null;
  poster: string;
  anio: number;
  generos: { genero: { nombre: string } }[];
  temporadas: { numero: number; episodios: { numero: number }[] }[];
};

/** Duración de cada slide del autoplay. La usa la barra de progreso (CSS) y,
 *  cuando esa barra termina, avanza el carrusel: así no puede haber desfase
 *  entre lo que se ve y lo que pasa. */
const DURACION_SLIDE_MS = 7000;

export function Hero({ series }: { series: SerieDestacada[] }) {
  const [indice, setIndice] = useState(0);
  const [pausado, setPausado] = useState(false);
  // useReducedMotion() lee matchMedia, que no existe en el server: si lo
  // usáramos directo, el primer render del cliente (con el valor real) no
  // coincidiría con el HTML del server (siempre "sin preferencia") y React
  // tira un hydration mismatch. Se resuelve como el theme-toggle: ignorarlo
  // hasta después de montar.
  const [montado, setMontado] = useState(false);
  useEffect(() => setMontado(true), []);
  const prefiereMenosMovimientoOS = useReducedMotion();
  const prefiereMenosMovimiento = montado && !!prefiereMenosMovimientoOS;

  if (series.length === 0) return null;
  const serie = series[indice]!;
  const hrefVer = rutaPrimerEpisodio(serie) ?? `/serie/${serie.slug}`;
  const hayVarias = series.length > 1;

  // Entrada escalonada del bloque de texto. 60ms entre elementos: suficiente
  // para que se lea como una secuencia, no tanto como para hacer esperar.
  const aparecer = (orden: number) =>
    prefiereMenosMovimiento
      ? { initial: false as const, animate: { opacity: 1 } }
      : {
          initial: { opacity: 0, transform: "translateY(14px)" },
          animate: { opacity: 1, transform: "translateY(0px)" },
          transition: {
            duration: 0.45,
            delay: 0.12 + orden * 0.06,
            ease: [0.23, 1, 0.32, 1] as const,
          },
        };

  return (
    <section
      aria-roledescription="carrusel"
      aria-label="Series destacadas"
      className="relative h-[62vh] min-h-[420px] w-full overflow-hidden sm:h-[74vh]"
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
      onFocusCapture={() => setPausado(true)}
      onBlurCapture={() => setPausado(false)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={serie.id}
          initial={prefiereMenosMovimiento ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={prefiereMenosMovimiento ? undefined : { opacity: 0 }}
          transition={{ duration: prefiereMenosMovimiento ? 0 : 0.6, ease: "easeOut" }}
          className="absolute inset-0"
        >
          {/* El Ken Burns va en un wrapper propio: si se animara el <Image>
              con fill, la escala pelearía con el object-cover del crossfade. */}
          <div className="absolute inset-0 kenburns">
            <Image
              src={serie.banner ?? serie.poster}
              alt=""
              fill
              priority={indice === 0}
              className="object-cover"
              sizes="100vw"
            />
          </div>
          {/* Scrims. Los tres primeros son NEGROS, no del color de fondo: el
              texto del hero es blanco en los dos temas, así que la legibilidad
              no puede depender de si el tema es claro u oscuro. El último sí
              usa el fondo del tema, sólo para empalmar el borde inferior con
              el resto de la página sin un corte duro. */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/10" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/25 to-transparent" />
          <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/55 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background via-background/55 to-transparent" />
        </motion.div>
      </AnimatePresence>

      <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-end gap-4 px-4 pb-12 sm:px-6 sm:pb-16">
        <motion.div key={`${serie.id}-generos`} {...aparecer(0)} className="flex flex-wrap gap-1.5">
          {serie.generos.slice(0, 3).map(({ genero }) => (
            <span
              key={genero.nombre}
              className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-medium text-white ring-1 ring-white/25 backdrop-blur-sm"
            >
              {genero.nombre}
            </span>
          ))}
        </motion.div>

        <motion.h1
          key={`${serie.id}-titulo`}
          {...aparecer(1)}
          className="max-w-3xl text-4xl font-bold tracking-tight text-balance text-white drop-shadow-[0_2px_16px_rgba(0,0,0,0.55)] sm:text-6xl"
        >
          {serie.titulo}
        </motion.h1>

        <motion.p
          key={`${serie.id}-sinopsis`}
          {...aparecer(2)}
          className="line-clamp-2 max-w-xl text-sm text-pretty text-white/85 drop-shadow-[0_1px_8px_rgba(0,0,0,0.6)] sm:text-base"
        >
          {serie.sinopsis}
        </motion.p>

        <motion.div
          key={`${serie.id}-acciones`}
          {...aparecer(3)}
          className="flex flex-wrap items-center gap-2.5 pt-1"
        >
          <Button render={<Link href={hrefVer} />} size="lg">
            <Play className="size-4 fill-current" />
            Ver ahora
          </Button>
          <Button render={<Link href={`/serie/${serie.slug}`} />} size="lg" variant="secondary">
            <Info className="size-4" />
            Más info
          </Button>
          <BotonMiListaRapido serieId={serie.id} />
        </motion.div>

        {hayVarias && (
          <div className="flex items-center gap-2 pt-3">
            {series.map((s, i) => {
              const activo = i === indice;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setIndice(i)}
                  aria-label={`Ir a ${s.titulo}`}
                  aria-current={activo ? "true" : undefined}
                  className={cn(
                    "h-1.5 overflow-hidden rounded-full transition-[width,background-color] duration-300 ease-out",
                    activo ? "w-10 bg-white/25" : "w-1.5 bg-white/40 hover:bg-white/70"
                  )}
                >
                  {activo && (
                    <span
                      // key por índice: al hacer click en otro punto la
                      // animación se reinicia desde cero en vez de continuar.
                      key={indice}
                      onAnimationEnd={() => setIndice((n) => (n + 1) % series.length)}
                      style={
                        {
                          "--autoplay-duracion": `${DURACION_SLIDE_MS}ms`,
                          animationPlayState: pausado ? "paused" : "running",
                        } as React.CSSProperties
                      }
                      className="barra-autoplay block h-full w-full rounded-full bg-primary"
                    />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
