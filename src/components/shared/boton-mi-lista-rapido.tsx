"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Plus, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Botón "+ Mi Lista" de acción rápida (hero, tarjetas): agrega como
 * PENDIENTE. Para cambiar de estado o sacarlo, se usa el selector de la
 * ficha de la serie. */
export function BotonMiListaRapido({
  serieId,
  variant = "outline",
}: {
  serieId: string;
  variant?: "outline" | "secondary";
}) {
  const { status } = useSession();
  const router = useRouter();
  const [agregado, setAgregado] = useState(false);
  const [enCurso, setEnCurso] = useState(false);

  async function agregar() {
    if (status !== "authenticated") {
      router.push("/login");
      return;
    }

    setEnCurso(true);
    const respuesta = await fetch("/api/mi-lista", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ serieId, estado: "PENDIENTE" }),
    });
    setEnCurso(false);

    if (respuesta.status === 409) {
      router.push("/perfiles");
      return;
    }
    if (!respuesta.ok) {
      toast.error("No pudimos agregarla a tu lista.");
      return;
    }

    setAgregado(true);
    toast.success("Agregada a tu lista");
  }

  return (
    <Button
      type="button"
      variant={variant}
      size="lg"
      disabled={enCurso || agregado}
      onClick={agregar}
      className="transition-transform duration-100 ease-out active:scale-[0.97]"
    >
      {enCurso ? (
        <Loader2 className="size-4 animate-spin" />
      ) : agregado ? (
        // El check entra desde 60% en 200ms: acusa recibo de que la accion
        // termino, que es justo el momento en que el usuario esta mirando.
        <Check className="size-4 animate-in zoom-in-50 duration-200 ease-out" />
      ) : (
        <Plus className="size-4" />
      )}
      {agregado ? "En tu lista" : "Mi lista"}
    </Button>
  );
}
