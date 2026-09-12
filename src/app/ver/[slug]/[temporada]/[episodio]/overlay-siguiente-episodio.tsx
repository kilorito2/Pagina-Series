"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { X, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

export function OverlaySiguienteEpisodio({
  hrefSiguiente,
  tituloSiguiente,
  thumbnail,
  segundos = 8,
  onCancelar,
}: {
  hrefSiguiente: string;
  tituloSiguiente: string;
  thumbnail: string | null;
  segundos?: number;
  onCancelar: () => void;
}) {
  const router = useRouter();
  const [restante, setRestante] = useState(segundos);

  useEffect(() => {
    if (restante <= 0) {
      router.push(hrefSiguiente);
      return;
    }
    const id = setTimeout(() => setRestante((r) => r - 1), 1000);
    return () => clearTimeout(id);
  }, [restante, hrefSiguiente, router]);

  return (
    <div className="absolute inset-0 z-20 flex items-end justify-end bg-black/60 p-4 duration-300 ease-out animate-in fade-in-0 sm:p-6">
      {/* La tarjeta entra desde abajo, que es de donde "viene": el mismo eje
          por el que se iría si el usuario cancela. */}
      <div className="w-full max-w-xs overflow-hidden rounded-xl bg-card p-4 shadow-2xl ring-1 ring-border duration-300 ease-out animate-in slide-in-from-bottom-4 sm:w-72">
        <div className="mb-2 flex items-start justify-between gap-2">
          <p className="text-sm text-muted-foreground">Siguiente episodio en {restante}s</p>
          <button
            type="button"
            onClick={onCancelar}
            aria-label="Cancelar reproducción automática"
            className="rounded text-muted-foreground transition-colors duration-150 ease-out hover:text-foreground active:scale-90"
          >
            <X className="size-4" />
          </button>
        </div>
        {/* Cuenta regresiva visible: la barra dura lo mismo que el contador
            y avanza en linear, que es como se lee "tiempo que pasa". */}
        <div className="mb-3 h-1 overflow-hidden rounded-full bg-muted">
          <span
            className="barra-autoplay block h-full w-full rounded-full bg-primary"
            style={{ "--autoplay-duracion": `${segundos}s` } as React.CSSProperties}
          />
        </div>
        {thumbnail && (
          <div className="relative mb-3 aspect-video overflow-hidden rounded-lg bg-muted ring-1 ring-border">
            <Image src={thumbnail} alt="" fill sizes="288px" className="object-cover" />
          </div>
        )}
        <p className="mb-3 line-clamp-1 text-sm font-medium">{tituloSiguiente}</p>
        <Button render={<Link href={hrefSiguiente} />} className="w-full" size="sm">
          <Play className="size-4 fill-current" />
          Reproducir ahora
        </Button>
      </div>
    </div>
  );
}
