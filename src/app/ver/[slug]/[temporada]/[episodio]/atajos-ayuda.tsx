"use client";

import { Keyboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { siteConfig } from "@/lib/config";

const ATAJOS_PAGINA = [
  { tecla: "Shift + P", accion: "Episodio anterior" },
  { tecla: "Shift + N", accion: "Episodio siguiente" },
  { tecla: "T", accion: "Modo teatro" },
  { tecla: "F", accion: "Pantalla completa" },
  { tecla: "?", accion: "Mostrar esta ayuda" },
] as const;

// Espacio/flechas/M los maneja el layout nativo de Vidstack cuando el
// reproductor tiene foco — solo aplican en modo HLS. En EMBEDS el video es
// un iframe de otro origen, así que esos atajos no existen (limitación
// real, ya documentada en reproductor-embed.tsx).
const ATAJOS_REPRODUCTOR = [
  { tecla: "Espacio", accion: "Reproducir / pausar" },
  { tecla: "← / →", accion: "Retroceder / avanzar" },
  { tecla: "M", accion: "Silenciar" },
] as const;

/** Diálogo de ayuda con los atajos de teclado, abierto con "?" o desde este botón. */
export function AtajosAyuda({ open, onOpenChange }: { open: boolean; onOpenChange: (abierto: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger
        render={
          <Button type="button" variant="ghost" size="icon-sm" aria-label="Atajos de teclado">
            <Keyboard className="size-4" />
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Atajos de teclado</DialogTitle>
          <DialogDescription>Navegá el reproductor sin tocar el mouse.</DialogDescription>
        </DialogHeader>

        <ListaAtajos titulo="En esta página" atajos={ATAJOS_PAGINA} />

        {siteConfig.origenVideo === "HLS" && (
          <ListaAtajos titulo="Dentro del video" atajos={ATAJOS_REPRODUCTOR} />
        )}
      </DialogContent>
    </Dialog>
  );
}

function ListaAtajos({
  titulo,
  atajos,
}: {
  titulo: string;
  atajos: readonly { tecla: string; accion: string }[];
}) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium text-muted-foreground">{titulo}</p>
      <ul className="space-y-1.5">
        {atajos.map((atajo) => (
          <li key={atajo.tecla} className="flex items-center justify-between text-sm">
            <span>{atajo.accion}</span>
            <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-xs">
              {atajo.tecla}
            </kbd>
          </li>
        ))}
      </ul>
    </div>
  );
}
