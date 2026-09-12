"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { toast } from "sonner";

/** Botón "×" que aparece al hover sobre una tarjeta de "Continuar viendo"
 * (Netflix/Crunchyroll) para sacarla sin tener que ir a Historial. Usa el
 * mismo DELETE /api/progreso que ya usa `cuenta/historial`. */
export function BotonQuitarProgreso({ episodioId }: { episodioId: string }) {
  const router = useRouter();
  const [quitando, setQuitando] = useState(false);

  async function quitar(evento: React.MouseEvent) {
    evento.preventDefault();
    evento.stopPropagation();
    setQuitando(true);
    const respuesta = await fetch(`/api/progreso?episodioId=${episodioId}`, { method: "DELETE" });
    setQuitando(false);

    if (!respuesta.ok) {
      toast.error("No pudimos quitarla de continuar viendo.");
      return;
    }
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={quitar}
      disabled={quitando}
      aria-label="Quitar de continuar viendo"
      className="absolute top-1.5 right-1.5 z-10 flex size-6 items-center justify-center rounded-full bg-black/70 text-white opacity-0 transition-opacity hover:bg-black/90 focus-visible:opacity-100 group-hover:opacity-100 disabled:opacity-50"
    >
      <X className="size-3.5" />
    </button>
  );
}
