"use client";

import { useRef } from "react";
import {
  MediaPlayer,
  MediaProvider,
  type MediaPlayerInstance,
  type MediaTimeUpdateEvent,
} from "@vidstack/react";
import { DefaultVideoLayout, defaultLayoutIcons } from "@vidstack/react/player/layouts/default";
import "@vidstack/react/player/styles/default/theme.css";
import "@vidstack/react/player/styles/default/layouts/video.css";

/** Reproductor para archivos HLS (.m3u8) propios, vía Vidstack + HLS.js
 * (Vidstack lo carga internamente). Progreso real, atajos de teclado y
 * controles nativos vienen gratis con el layout por defecto. */
export function ReproductorHls({
  src,
  titulo,
  poster,
  tiempoInicial,
  onTiempo,
  onFin,
}: {
  src: string;
  titulo: string;
  poster: string;
  tiempoInicial: number;
  onTiempo: (segundoActual: number, duracionTotal: number) => void;
  onFin: () => void;
}) {
  const playerRef = useRef<MediaPlayerInstance>(null);

  return (
    <MediaPlayer
      ref={playerRef}
      src={{ src, type: "application/x-mpegurl" }}
      title={titulo}
      poster={poster}
      crossOrigin
      playsInline
      className="aspect-video w-full overflow-hidden rounded-lg bg-black"
      onLoadedMetadata={() => {
        if (playerRef.current && tiempoInicial > 0) {
          playerRef.current.currentTime = tiempoInicial;
        }
      }}
      onTimeUpdate={(detail: MediaTimeUpdateEvent["detail"]) => {
        onTiempo(Math.floor(detail.currentTime), Math.floor(playerRef.current?.duration || 0));
      }}
      onEnded={onFin}
    >
      <MediaProvider />
      <DefaultVideoLayout icons={defaultLayoutIcons} />
    </MediaPlayer>
  );
}
