"use client";

import { useEffect } from "react";
import Link from "next/link";
import { TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Error boundary de las páginas públicas: se monta dentro de
 * `(site)/layout.tsx`, así que header/footer/nav siguen visibles. */
export default function SiteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-24 text-center">
      <TriangleAlert className="size-10 text-destructive" />
      <div className="space-y-1">
        <h1 className="text-xl font-semibold">Algo salió mal</h1>
        <p className="text-sm text-muted-foreground">
          No pudimos cargar esta página. Podés intentar de nuevo o volver al inicio.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button onClick={() => reset()}>Reintentar</Button>
        <Button render={<Link href="/" />} variant="outline">
          Volver al inicio
        </Button>
      </div>
    </div>
  );
}
