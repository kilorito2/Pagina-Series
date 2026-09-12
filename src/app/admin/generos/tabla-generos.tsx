"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Trash2, Pencil, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Genero = { id: string; nombre: string; slug: string; _count: { series: number } };

export function TablaGeneros({ generos }: { generos: Genero[] }) {
  const router = useRouter();
  const [nuevo, setNuevo] = useState("");
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [nombreEditado, setNombreEditado] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function crear() {
    if (!nuevo.trim()) return;
    setEnviando(true);
    const r = await fetch("/api/admin/generos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre: nuevo.trim() }),
    });
    setEnviando(false);
    if (!r.ok) {
      const cuerpo = await r.json().catch(() => null);
      toast.error(cuerpo?.error ?? "No pudimos crear el género.");
      return;
    }
    setNuevo("");
    router.refresh();
  }

  async function guardarEdicion(id: string) {
    if (!nombreEditado.trim()) return;
    const r = await fetch(`/api/admin/generos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre: nombreEditado.trim() }),
    });
    if (!r.ok) {
      toast.error("No pudimos actualizar el género.");
      return;
    }
    setEditandoId(null);
    router.refresh();
  }

  async function eliminar(id: string, cantidadSeries: number) {
    if (cantidadSeries > 0 && !confirm(`Este género tiene ${cantidadSeries} serie(s). ¿Eliminarlo igual?`)) return;
    const r = await fetch(`/api/admin/generos/${id}`, { method: "DELETE" });
    if (!r.ok) {
      toast.error("No pudimos eliminar el género.");
      return;
    }
    toast.success("Género eliminado");
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex max-w-sm gap-2">
        <Input
          value={nuevo}
          onChange={(e) => setNuevo(e.target.value)}
          placeholder="Nuevo género"
          onKeyDown={(e) => e.key === "Enter" && crear()}
        />
        <Button onClick={crear} disabled={enviando}>
          <Plus className="size-4" />
          Agregar
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead>Series</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {generos.map((genero) => (
            <TableRow key={genero.id}>
              <TableCell>
                {editandoId === genero.id ? (
                  <Input value={nombreEditado} onChange={(e) => setNombreEditado(e.target.value)} className="h-8" />
                ) : (
                  genero.nombre
                )}
              </TableCell>
              <TableCell className="text-muted-foreground">{genero.slug}</TableCell>
              <TableCell>{genero._count.series}</TableCell>
              <TableCell className="text-right">
                {editandoId === genero.id ? (
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon-sm" onClick={() => guardarEdicion(genero.id)}>
                      <Check className="size-4" />
                    </Button>
                    <Button variant="ghost" size="icon-sm" onClick={() => setEditandoId(null)}>
                      <X className="size-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => {
                        setEditandoId(genero.id);
                        setNombreEditado(genero.nombre);
                      }}
                      aria-label="Editar"
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => eliminar(genero.id, genero._count.series)}
                      aria-label="Eliminar"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
