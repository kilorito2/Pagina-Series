"use client";

import { TriangleAlert } from "lucide-react";
import { siteConfig } from "@/lib/config";

/**
 * Boundary de último recurso: solo se monta si el propio layout raíz
 * (`app/layout.tsx`) tira un error, así que reemplaza TODO, incluido
 * `<html>`/`<body>` — es el único error.tsx que necesita definirlos, según
 * la convención de Next.js.
 */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="es" className="dark h-full">
      <body className="flex min-h-full flex-col items-center justify-center gap-6 bg-background px-4 py-16 text-center text-foreground">
        <TriangleAlert className="size-10 text-destructive" />
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">{siteConfig.nombre} tuvo un problema</h1>
          <p className="max-w-sm text-sm text-muted-foreground">
            Algo salió mal cargando el sitio. Podés intentar de nuevo.
          </p>
        </div>
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover"
        >
          Reintentar
        </button>
      </body>
    </html>
  );
}
