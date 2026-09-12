"use client";

import { useEffect } from "react";
import { TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Error boundary del panel: se monta dentro de `admin/layout.tsx`, el
 * sidebar sigue visible para poder navegar a otra sección. */
export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center gap-4 py-20 text-center">
      <TriangleAlert className="size-10 text-destructive" />
      <div className="space-y-1">
        <h1 className="text-lg font-semibold">Esta sección tuvo un error</h1>
        <p className="text-sm text-muted-foreground">
          Revisá la consola del servidor para más detalle. Podés reintentar la carga.
        </p>
      </div>
      <Button onClick={() => reset()}>Reintentar</Button>
    </div>
  );
}
