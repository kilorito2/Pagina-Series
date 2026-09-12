"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { rutaVer } from "@/lib/rutas";

export type ItemHistorial = {
  id: string;
  episodioId: string;
  segundoActual: number;
  duracionTotal: number;
  completado: boolean;
  updatedAt: string | Date;
  episodio: {
    numero: number;
    titulo: string | null;
    thumbnail: string | null;
    temporada: {
      numero: number;
      serie: { slug: string; titulo: string; poster: string };
    };
  };
};

export function FilaHistorial({ item }: { item: ItemHistorial }) {
  const router = useRouter();
  const [eliminando, setEliminando] = useState(false);
  const { serie } = item.episodio.temporada;
  const porcentaje = item.duracionTotal > 0 ? Math.min(100, (item.segundoActual / item.duracionTotal) * 100) : 0;

  async function eliminar() {
    setEliminando(true);
    const respuesta = await fetch(`/api/progreso?episodioId=${item.episodioId}`, { method: "DELETE" });
    if (!respuesta.ok) {
      setEliminando(false);
      toast.error("No pudimos borrar este ítem.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex items-center gap-3 rounded-lg p-2 hover:bg-accent">
      <Link
        href={rutaVer(serie.slug, item.episodio.temporada.numero, item.episodio.numero)}
        className="relative h-16 w-28 shrink-0 overflow-hidden rounded-md bg-muted"
      >
        <Image
          src={item.episodio.thumbnail ?? serie.poster}
          alt=""
          fill
          sizes="112px"
          className="object-cover"
        />
        <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20">
          <div className="h-full bg-primary" style={{ width: `${porcentaje}%` }} />
        </div>
      </Link>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{serie.titulo}</p>
        <p className="truncate text-xs text-muted-foreground">
          T{item.episodio.temporada.numero} · E{item.episodio.numero}
          {item.episodio.titulo ? ` — ${item.episodio.titulo}` : ""}
        </p>
        <p className="text-xs text-muted-foreground">
          {new Date(item.updatedAt).toLocaleDateString("es-419", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
          {item.completado ? " · Completado" : ` · ${Math.round(porcentaje)}%`}
        </p>
      </div>

      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        disabled={eliminando}
        onClick={eliminar}
        aria-label="Borrar del historial"
      >
        <X className="size-4" />
      </Button>
    </div>
  );
}
