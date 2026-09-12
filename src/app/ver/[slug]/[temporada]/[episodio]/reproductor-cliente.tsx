"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Maximize, Rows3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { siteConfig } from "@/lib/config";
import { rutaVer } from "@/lib/rutas";
import { ReproductorEmbed } from "./reproductor-embed";
import { SelectorFuente, type FuenteVideoOpcion } from "./selector-fuente";
import { BarraLateralEpisodios } from "./barra-lateral-episodios";
import { BotonReportar } from "./boton-reportar";
import { OverlaySiguienteEpisodio } from "./overlay-siguiente-episodio";
import { AtajosAyuda } from "./atajos-ayuda";

// Vidstack + HLS.js son pesados y solo hacen falta con NEXT_PUBLIC_ORIGEN_VIDEO=HLS;
// con el default (EMBEDS, un iframe) nunca deberían llegar al bundle del cliente.
const ReproductorHls = dynamic(
  () => import("./reproductor-hls").then((m) => m.ReproductorHls),
  { ssr: false, loading: () => <Skeleton className="aspect-video w-full rounded-lg" /> }
);

type EpisodioSidebar = { id: string; numero: number; titulo: string | null; thumbnail: string | null };
type EpisodioSiguiente = {
  temporadaNumero: number;
  numero: number;
  titulo: string | null;
  thumbnail: string | null;
} | null;
type EpisodioAnterior = { temporadaNumero: number; numero: number } | null;

export function ReproductorCliente({
  serieSlug,
  serieTitulo,
  poster,
  episodioId,
  episodioNumero,
  episodioTitulo,
  temporadaNumero,
  duracionInicial,
  fuentes,
  fuenteInicial,
  tiempoInicial,
  autoplayPreferido,
  episodiosTemporada,
  episodioAnterior,
  episodioSiguiente,
}: {
  serieSlug: string;
  serieTitulo: string;
  poster: string;
  episodioId: string;
  episodioNumero: number;
  episodioTitulo: string | null;
  temporadaNumero: number;
  duracionInicial: number;
  fuentes: FuenteVideoOpcion[];
  fuenteInicial: FuenteVideoOpcion;
  tiempoInicial: number;
  autoplayPreferido: boolean;
  episodiosTemporada: EpisodioSidebar[];
  episodioAnterior: EpisodioAnterior;
  episodioSiguiente: EpisodioSiguiente;
}) {
  const router = useRouter();
  const [fuente, setFuente] = useState(fuenteInicial);
  const [modoTeatro, setModoTeatro] = useState(false);
  const [mostrarSiguiente, setMostrarSiguiente] = useState(false);
  const [atajosAbiertos, setAtajosAbiertos] = useState(false);
  const contenedorRef = useRef<HTMLDivElement>(null);

  const tiempoRef = useRef({ segundoActual: tiempoInicial, duracionTotal: duracionInicial });

  const guardarProgreso = useCallback(
    (completado?: boolean) => {
      const { segundoActual, duracionTotal } = tiempoRef.current;
      if (segundoActual <= 0) return;

      const body = JSON.stringify({ episodioId, segundoActual, duracionTotal, completado });

      if (typeof document !== "undefined" && document.visibilityState === "hidden" && navigator.sendBeacon) {
        navigator.sendBeacon("/api/progreso", new Blob([body], { type: "application/json" }));
      } else {
        fetch("/api/progreso", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body,
          keepalive: true,
        }).catch(() => {});
      }
    },
    [episodioId]
  );

  // Guardado cada 10 segundos.
  useEffect(() => {
    const id = setInterval(() => guardarProgreso(), 10_000);
    return () => clearInterval(id);
  }, [guardarProgreso]);

  // Guardado al salir (cambiar de pestaña, cerrar, o navegar a otro episodio).
  useEffect(() => {
    function alOcultarse() {
      if (document.visibilityState === "hidden") guardarProgreso();
    }
    document.addEventListener("visibilitychange", alOcultarse);
    window.addEventListener("pagehide", alOcultarse);
    return () => {
      guardarProgreso();
      document.removeEventListener("visibilitychange", alOcultarse);
      window.removeEventListener("pagehide", alOcultarse);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [episodioId]);

  const onTiempo = useCallback((segundoActual: number, duracionTotal: number) => {
    tiempoRef.current = { segundoActual, duracionTotal: duracionTotal || tiempoRef.current.duracionTotal };
  }, []);

  const onFin = useCallback(() => {
    guardarProgreso(true);
    if (autoplayPreferido && episodioSiguiente) setMostrarSiguiente(true);
  }, [guardarProgreso, autoplayPreferido, episodioSiguiente]);

  function alternarPantallaCompleta() {
    if (!contenedorRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      contenedorRef.current.requestFullscreen?.().catch(() => {});
    }
  }

  const hrefSiguiente = episodioSiguiente
    ? rutaVer(serieSlug, episodioSiguiente.temporadaNumero, episodioSiguiente.numero)
    : null;
  const hrefAnterior = episodioAnterior
    ? rutaVer(serieSlug, episodioAnterior.temporadaNumero, episodioAnterior.numero)
    : null;

  // Atajos a nivel de página (no del video: eso lo maneja Vidstack solo en
  // modo HLS). Shift+N/P para navegar episodios como YouTube — nada de
  // Alt+flechas: en Chrome/Edge/Firefox esa combinación ya es "atrás/adelante"
  // del navegador y nunca le llegaría a la página. F y T para pantalla
  // completa/teatro sin mouse, y "?" para la ayuda.
  useEffect(() => {
    function alTeclear(evento: KeyboardEvent) {
      const objetivo = evento.target as HTMLElement | null;
      const escribiendo = objetivo?.tagName === "INPUT" || objetivo?.tagName === "TEXTAREA" || objetivo?.isContentEditable;
      if (escribiendo) return;
      if (evento.altKey || evento.ctrlKey || evento.metaKey) return;

      if (evento.key === "?") {
        evento.preventDefault();
        setAtajosAbiertos((v) => !v);
      } else if (evento.key.toLowerCase() === "t") {
        evento.preventDefault();
        setModoTeatro((v) => !v);
      } else if (evento.key.toLowerCase() === "f") {
        evento.preventDefault();
        alternarPantallaCompleta();
      } else if (evento.shiftKey && evento.key.toLowerCase() === "p" && hrefAnterior) {
        evento.preventDefault();
        router.push(hrefAnterior);
      } else if (evento.shiftKey && evento.key.toLowerCase() === "n" && hrefSiguiente) {
        evento.preventDefault();
        router.push(hrefSiguiente);
      }
    }
    document.addEventListener("keydown", alTeclear);
    return () => document.removeEventListener("keydown", alTeclear);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hrefAnterior, hrefSiguiente]);

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-4 sm:px-6">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <Link
            href={`/serie/${serieSlug}`}
            className="group/volver inline-flex items-center gap-1 rounded text-sm text-muted-foreground transition-colors duration-200 ease-out hover:text-foreground"
          >
            <ChevronLeft className="size-3.5 transition-transform duration-200 ease-out group-hover/volver:-translate-x-0.5" />
            {serieTitulo}
          </Link>
          <h1 className="truncate text-lg font-semibold tracking-tight sm:text-xl">
            T{temporadaNumero} · E{episodioNumero}
            {episodioTitulo ? ` — ${episodioTitulo}` : ""}
          </h1>
        </div>

        <SelectorFuente fuentes={fuentes} actual={fuente} onCambiar={setFuente} />
      </div>

      <div className={modoTeatro ? "flex flex-col" : "flex flex-col gap-4 lg:flex-row"}>
        <div className="min-w-0 flex-1">
          <div
            ref={contenedorRef}
            className="relative overflow-hidden rounded-xl bg-black shadow-2xl ring-1 ring-white/10"
          >
            {siteConfig.origenVideo === "HLS" ? (
              <ReproductorHls
                key={fuente.id}
                src={fuente.url}
                titulo={`${serieTitulo} - T${temporadaNumero} E${episodioNumero}`}
                poster={poster}
                tiempoInicial={tiempoInicial}
                onTiempo={onTiempo}
                onFin={onFin}
              />
            ) : (
              <ReproductorEmbed
                key={fuente.id}
                url={fuente.url}
                titulo={`${serieTitulo} - T${temporadaNumero} E${episodioNumero}`}
                tiempoInicial={tiempoInicial}
                duracionTotal={duracionInicial}
                onTiempo={onTiempo}
                onFin={onFin}
              />
            )}

            {mostrarSiguiente && hrefSiguiente && episodioSiguiente && (
              <OverlaySiguienteEpisodio
                hrefSiguiente={hrefSiguiente}
                tituloSiguiente={
                  episodioSiguiente.titulo ?? `Episodio ${episodioSiguiente.numero}`
                }
                thumbnail={episodioSiguiente.thumbnail}
                onCancelar={() => setMostrarSiguiente(false)}
              />
            )}
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="transition-transform duration-100 ease-out active:scale-95" disabled={!hrefAnterior} onClick={() => hrefAnterior && router.push(hrefAnterior)}>
                <ChevronLeft className="size-4" />
                Anterior
              </Button>
              <Button variant="outline" size="sm" className="transition-transform duration-100 ease-out active:scale-95" disabled={!hrefSiguiente} onClick={() => hrefSiguiente && router.push(hrefSiguiente)}>
                Siguiente
                <ChevronRight className="size-4" />
              </Button>
            </div>

            <div className="flex items-center gap-1">
              <BotonReportar fuenteVideoId={fuente.id} />
              <Button variant="ghost" size="sm" onClick={() => setModoTeatro((v) => !v)}>
                <Rows3 className="size-4" />
                {modoTeatro ? "Salir de teatro" : "Modo teatro"}
              </Button>
              <Button variant="ghost" size="sm" onClick={alternarPantallaCompleta}>
                <Maximize className="size-4" />
                Pantalla completa
              </Button>
              <AtajosAyuda open={atajosAbiertos} onOpenChange={setAtajosAbiertos} />
            </div>
          </div>
        </div>

        {!modoTeatro && (
          <BarraLateralEpisodios
            slugSerie={serieSlug}
            temporadaNumero={temporadaNumero}
            episodios={episodiosTemporada}
            episodioActualId={episodioId}
          />
        )}
      </div>
    </div>
  );
}
