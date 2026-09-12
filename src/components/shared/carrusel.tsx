"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Revelar } from "@/components/shared/revelar";
import { cn } from "@/lib/utils";

/** Envoltorio de ancho fijo para cada item de un <Carrusel>. */
export function CarruselItem({
  children,
  className,
  ancho = "w-32 sm:w-40",
}: {
  children: ReactNode;
  className?: string;
  ancho?: string;
}) {
  return <div className={cn("shrink-0 snap-start", ancho, className)}>{children}</div>;
}

/** Ancho del degradado de los bordes, en px. */
const MASK = 56;

export function Carrusel({
  titulo,
  verMasHref,
  children,
}: {
  titulo: string;
  verMasHref?: string;
  children: ReactNode;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [puedeIzq, setPuedeIzq] = useState(false);
  const [puedeDer, setPuedeDer] = useState(false);

  // Una sola fuente de verdad para flechas y máscara: si no hay scroll de ese
  // lado, ni la flecha ni el degradado tienen por qué estar.
  const medir = useCallback(() => {
    const c = scrollRef.current;
    if (!c) return;
    const restante = c.scrollWidth - c.clientWidth - c.scrollLeft;
    setPuedeIzq(c.scrollLeft > 8);
    setPuedeDer(restante > 8);
  }, []);

  useEffect(() => {
    const c = scrollRef.current;
    if (!c) return;
    medir();
    c.addEventListener("scroll", medir, { passive: true });
    // El ancho del contenedor cambia al redimensionar y también cuando las
    // imágenes terminan de cargar y empujan el layout.
    const ro = new ResizeObserver(medir);
    ro.observe(c);
    return () => {
      c.removeEventListener("scroll", medir);
      ro.disconnect();
    };
  }, [medir, children]);

  function desplazar(direccion: 1 | -1) {
    const c = scrollRef.current;
    if (!c) return;
    c.scrollBy({ left: direccion * c.clientWidth * 0.9, behavior: "smooth" });
  }

  return (
    <Revelar as="section" className="space-y-3">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <h2 className="text-lg font-semibold tracking-tight sm:text-xl">{titulo}</h2>
        {verMasHref && (
          <Link
            href={verMasHref}
            className="group/vermas flex shrink-0 items-center gap-0.5 rounded-md text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <span className="link-subrayado">Ver todo</span>
            <ChevronRight className="size-4 transition-transform duration-200 ease-out group-hover/vermas:translate-x-0.5" />
          </Link>
        )}
      </div>

      <div className="group/carrusel relative mx-auto max-w-7xl">
        <button
          type="button"
          aria-label="Desplazar hacia la izquierda"
          tabIndex={-1}
          aria-hidden={!puedeIzq}
          onClick={() => desplazar(-1)}
          className={cn(
            "absolute inset-y-0 left-0 z-10 hidden w-14 items-center justify-start bg-gradient-to-r from-background via-background/80 to-transparent pl-1 transition-opacity duration-200 ease-out md:flex",
            puedeIzq
              ? "opacity-0 group-hover/carrusel:opacity-100 group-focus-within/carrusel:opacity-100"
              : "pointer-events-none opacity-0"
          )}
        >
          <span className="flex size-9 items-center justify-center rounded-full bg-background/90 ring-1 ring-border transition-transform duration-200 ease-out hover:scale-110 active:scale-95">
            <ChevronLeft className="size-4" />
          </span>
        </button>

        <div
          ref={scrollRef}
          style={
            {
              "--mask-izq": puedeIzq ? `${MASK}px` : "0px",
              "--mask-der": puedeDer ? `${MASK}px` : "0px",
            } as React.CSSProperties
          }
          className="carrusel carrusel-mask flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-4 pt-2 pb-4 sm:px-6"
        >
          {children}
        </div>

        <button
          type="button"
          aria-label="Desplazar hacia la derecha"
          tabIndex={-1}
          aria-hidden={!puedeDer}
          onClick={() => desplazar(1)}
          className={cn(
            "absolute inset-y-0 right-0 z-10 hidden w-14 items-center justify-end bg-gradient-to-l from-background via-background/80 to-transparent pr-1 transition-opacity duration-200 ease-out md:flex",
            puedeDer
              ? "opacity-0 group-hover/carrusel:opacity-100 group-focus-within/carrusel:opacity-100"
              : "pointer-events-none opacity-0"
          )}
        >
          <span className="flex size-9 items-center justify-center rounded-full bg-background/90 ring-1 ring-border transition-transform duration-200 ease-out hover:scale-110 active:scale-95">
            <ChevronRight className="size-4" />
          </span>
        </button>
      </div>
    </Revelar>
  );
}
