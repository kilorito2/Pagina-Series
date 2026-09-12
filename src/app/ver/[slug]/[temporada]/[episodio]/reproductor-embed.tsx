"use client";

import { useEffect, useRef } from "react";

/**
 * Reproductor para servidores externos embebidos en un iframe.
 *
 * Al ser contenido de otro origen no tenemos acceso a sus eventos reales
 * de reproducción, así que el progreso es una aproximación: cuenta
 * segundos mientras la pestaña está visible y asume que se está viendo.
 * Es la misma limitación que tiene cualquier agregador de embeds externos.
 */
export function ReproductorEmbed({
  url,
  titulo,
  tiempoInicial,
  duracionTotal,
  onTiempo,
  onFin,
}: {
  url: string;
  titulo: string;
  tiempoInicial: number;
  duracionTotal: number;
  onTiempo: (segundoActual: number, duracionTotal: number) => void;
  onFin: () => void;
}) {
  const segundoRef = useRef(tiempoInicial);
  const terminadoRef = useRef(false);

  useEffect(() => {
    segundoRef.current = tiempoInicial;
    terminadoRef.current = false;
  }, [url, tiempoInicial]);

  useEffect(() => {
    const id = setInterval(() => {
      if (document.visibilityState !== "visible" || terminadoRef.current) return;

      segundoRef.current += 1;
      onTiempo(segundoRef.current, duracionTotal);

      if (duracionTotal > 0 && segundoRef.current >= duracionTotal) {
        terminadoRef.current = true;
        onFin();
      }
    }, 1000);

    return () => clearInterval(id);
  }, [duracionTotal, onTiempo, onFin]);

  return (
    <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
      <iframe
        key={url}
        src={url}
        title={titulo}
        className="size-full"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        sandbox="allow-scripts allow-same-origin allow-presentation"
        referrerPolicy="no-referrer"
      />
    </div>
  );
}
