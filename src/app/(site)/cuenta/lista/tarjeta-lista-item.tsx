"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { EstadoLista } from "@prisma/client";
import { MoreVertical, Eye, Clock, Check, Heart, XCircle, Trash2 } from "lucide-react";
import { SerieCard } from "@/components/shared/serie-card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ItemMiLista } from "./lista-por-estado";

const ESTADOS: { value: EstadoLista; label: string; Icon: typeof Eye }[] = [
  { value: "VIENDO", label: "Viendo", Icon: Eye },
  { value: "PENDIENTE", label: "Pendiente", Icon: Clock },
  { value: "COMPLETADO", label: "Completado", Icon: Check },
  { value: "FAVORITO", label: "Favorito", Icon: Heart },
  { value: "ABANDONADO", label: "Abandonado", Icon: XCircle },
];

export function TarjetaListaItem({ item }: { item: ItemMiLista }) {
  const router = useRouter();
  const [ocupado, setOcupado] = useState(false);

  async function cambiar(estado: EstadoLista) {
    setOcupado(true);
    const respuesta = await fetch("/api/mi-lista", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ serieId: item.serie.id, estado }),
    });
    setOcupado(false);
    if (!respuesta.ok) {
      toast.error("No pudimos actualizar tu lista.");
      return;
    }
    router.refresh();
  }

  async function quitar() {
    setOcupado(true);
    const respuesta = await fetch(`/api/mi-lista?serieId=${item.serie.id}`, { method: "DELETE" });
    setOcupado(false);
    if (!respuesta.ok) {
      toast.error("No pudimos quitarla de tu lista.");
      return;
    }
    toast.success("Quitada de tu lista");
    router.refresh();
  }

  return (
    <div className="relative">
      <SerieCard serie={item.serie} />
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <button
              type="button"
              disabled={ocupado}
              aria-label="Opciones"
              className="absolute top-2 right-2 z-10 flex size-7 items-center justify-center rounded-full bg-black/70 text-white transition hover:bg-black/90 disabled:opacity-50"
            >
              <MoreVertical className="size-4" />
            </button>
          }
        />
        <DropdownMenuContent align="end">
          {ESTADOS.filter((e) => e.value !== item.estado).map((e) => (
            <DropdownMenuItem key={e.value} onClick={() => cambiar(e.value)}>
              <e.Icon className="size-4" />
              Mover a {e.label}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={quitar}>
            <Trash2 className="size-4" />
            Quitar de mi lista
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
