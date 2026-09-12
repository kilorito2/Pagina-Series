import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Estado vacío compartido (sin resultados, lista vacía, filtros sin match).
 * Antes cada pantalla armaba el suyo con un icono suelto y un párrafo gris;
 * unificarlo hace que "no hay nada acá" se vea igual en todo el sitio y deje
 * siempre una salida a mano.
 */
export function EstadoVacio({
  icono: Icono,
  titulo,
  descripcion,
  accion,
  className,
}: {
  icono: LucideIcon;
  titulo: string;
  descripcion?: ReactNode;
  /** Botón o link para salir del callejón sin salida. */
  accion?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border px-6 py-16 text-center",
        className
      )}
    >
      <span className="flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground ring-1 ring-border">
        <Icono className="size-6" />
      </span>
      <div className="space-y-1">
        <p className="font-medium">{titulo}</p>
        {descripcion && (
          <p className="max-w-sm text-sm text-balance text-muted-foreground">{descripcion}</p>
        )}
      </div>
      {accion && <div className="pt-1">{accion}</div>}
    </div>
  );
}
