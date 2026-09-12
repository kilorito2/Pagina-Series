"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { EstadoLista } from "@prisma/client";
import { Heart, Check, Clock, Eye, XCircle, ChevronDown, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ESTADOS: { value: EstadoLista; label: string; Icon: typeof Eye }[] = [
  { value: "VIENDO", label: "Viendo", Icon: Eye },
  { value: "PENDIENTE", label: "Pendiente", Icon: Clock },
  { value: "COMPLETADO", label: "Completado", Icon: Check },
  { value: "FAVORITO", label: "Favorito", Icon: Heart },
  { value: "ABANDONADO", label: "Abandonado", Icon: XCircle },
];

export function SelectorMiLista({
  serieId,
  estadoInicial,
  haySesion,
}: {
  serieId: string;
  estadoInicial: EstadoLista | null;
  haySesion: boolean;
}) {
  const router = useRouter();
  const [estado, setEstado] = useState(estadoInicial);
  const [enCurso, setEnCurso] = useState(false);

  async function cambiar(nuevo: EstadoLista) {
    if (!haySesion) {
      router.push("/login");
      return;
    }
    setEnCurso(true);
    const respuesta = await fetch("/api/mi-lista", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ serieId, estado: nuevo }),
    });
    setEnCurso(false);

    if (respuesta.status === 409) {
      router.push("/perfiles");
      return;
    }
    if (!respuesta.ok) {
      toast.error("No pudimos actualizar tu lista.");
      return;
    }
    setEstado(nuevo);
    toast.success("Lista actualizada");
  }

  async function quitar() {
    setEnCurso(true);
    const respuesta = await fetch(`/api/mi-lista?serieId=${serieId}`, { method: "DELETE" });
    setEnCurso(false);

    if (!respuesta.ok) {
      toast.error("No pudimos quitarla de tu lista.");
      return;
    }
    setEstado(null);
    toast.success("Quitada de tu lista");
  }

  const actual = ESTADOS.find((e) => e.value === estado);
  const IconoActual = actual?.Icon ?? Plus;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button type="button" variant="outline" size="lg" disabled={enCurso}>
            <IconoActual className="size-4" />
            {actual ? actual.label : "Mi lista"}
            <ChevronDown className="size-4" />
          </Button>
        }
      />
      <DropdownMenuContent>
        {ESTADOS.map((e) => (
          <DropdownMenuItem key={e.value} onClick={() => cambiar(e.value)}>
            <e.Icon className="size-4" />
            {e.label}
          </DropdownMenuItem>
        ))}
        {estado && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={quitar}>
              Quitar de mi lista
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
