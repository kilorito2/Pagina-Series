"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function SelectorValoracion({
  serieId,
  puntajeInicial,
  haySesion,
}: {
  serieId: string;
  puntajeInicial: number | null;
  haySesion: boolean;
}) {
  const router = useRouter();
  const [puntaje, setPuntaje] = useState(puntajeInicial);
  const [hover, setHover] = useState<number | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function calificar(valor: number) {
    if (!haySesion) {
      router.push("/login");
      return;
    }
    setEnviando(true);
    const respuesta = await fetch("/api/valoraciones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ serieId, puntaje: valor }),
    });
    setEnviando(false);

    if (respuesta.status === 409) {
      router.push("/perfiles");
      return;
    }
    if (!respuesta.ok) {
      toast.error("No pudimos guardar tu valoración.");
      return;
    }
    setPuntaje(valor);
    toast.success(`Le pusiste ${valor}/10`);
    router.refresh();
  }

  const mostrar = hover ?? puntaje ?? 0;

  return (
    <div className="flex items-center gap-0.5" onMouseLeave={() => setHover(null)}>
      {Array.from({ length: 10 }, (_, i) => i + 1).map((valor) => (
        <button
          key={valor}
          type="button"
          disabled={enviando}
          onMouseEnter={() => setHover(valor)}
          onClick={() => calificar(valor)}
          aria-label={`Calificar con ${valor}`}
          className="p-0.5"
        >
          <Star
            className={cn(
              "size-4 transition-colors",
              valor <= mostrar ? "fill-brand-accent text-brand-accent" : "text-muted-foreground"
            )}
          />
        </button>
      ))}
      {puntaje && <span className="ml-1 text-xs text-muted-foreground">Le pusiste {puntaje}/10</span>}
    </div>
  );
}
