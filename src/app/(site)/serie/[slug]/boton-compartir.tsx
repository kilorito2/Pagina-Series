"use client";

import { toast } from "sonner";
import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BotonCompartir({ titulo }: { titulo: string }) {
  async function compartir() {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({ title: titulo, url });
      } catch {
        // El usuario canceló el share sheet; no es un error real.
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copiado");
    } catch {
      toast.error("No pudimos copiar el link");
    }
  }

  return (
    <Button type="button" variant="ghost" size="lg" onClick={compartir}>
      <Share2 className="size-4" />
      Compartir
    </Button>
  );
}
