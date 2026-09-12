import type { Metadata } from "next";
import Link from "next/link";
import { Compass } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Página no encontrada" };

/** 404 genérico: cualquier ruta que no matchee ningún segmento. Las
 * páginas con contenido propio (serie, episodio) tienen su propio
 * not-found.tsx con copy más específico. */
export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 py-16 text-center">
      <Logo />
      <div className="flex flex-col items-center gap-3">
        <Compass className="size-10 text-muted-foreground" />
        <h1 className="text-2xl font-bold sm:text-3xl">Página no encontrada</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          El link puede estar roto o la página se movió. Probá desde el inicio o el catálogo.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button render={<Link href="/" />}>Volver al inicio</Button>
        <Button render={<Link href="/catalogo" />} variant="outline">
          Ir al catálogo
        </Button>
      </div>
    </div>
  );
}
