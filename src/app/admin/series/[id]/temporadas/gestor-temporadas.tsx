"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Trash2, Pencil, Video, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type Episodio = {
  id: string;
  numero: number;
  titulo: string | null;
  duracionMin: number | null;
  _count: { fuentes: number };
};
type Temporada = { id: string; numero: number; titulo: string | null; episodios: Episodio[] };

export function GestorTemporadas({ serieId, temporadas }: { serieId: string; temporadas: Temporada[] }) {
  const router = useRouter();

  async function eliminarTemporada(id: string) {
    if (!confirm("¿Eliminar esta temporada y todos sus episodios?")) return;
    const r = await fetch(`/api/admin/temporadas/${id}`, { method: "DELETE" });
    if (!r.ok) return toast.error("No pudimos eliminar la temporada.");
    toast.success("Temporada eliminada");
    router.refresh();
  }

  async function eliminarEpisodio(id: string) {
    if (!confirm("¿Eliminar este episodio?")) return;
    const r = await fetch(`/api/admin/episodios/${id}`, { method: "DELETE" });
    if (!r.ok) return toast.error("No pudimos eliminar el episodio.");
    toast.success("Episodio eliminado");
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <DialogNuevaTemporada serieId={serieId} onCreada={() => router.refresh()} />

      {temporadas.length === 0 ? (
        <p className="text-sm text-muted-foreground">Todavía no hay temporadas cargadas.</p>
      ) : (
        <Accordion multiple className="space-y-2">
          {temporadas.map((temporada) => (
            <AccordionItem
              key={temporada.id}
              value={temporada.id}
              className="rounded-lg border border-border px-3"
            >
              <div className="flex items-center justify-between">
                <AccordionTrigger className="flex-1">
                  <span className="flex items-center gap-2">
                    <Layers className="size-4" />
                    {temporada.titulo ?? `Temporada ${temporada.numero}`}
                    <span className="text-xs font-normal text-muted-foreground">
                      ({temporada.episodios.length} episodios)
                    </span>
                  </span>
                </AccordionTrigger>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => eliminarTemporada(temporada.id)}
                  aria-label="Eliminar temporada"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
              <AccordionContent className="space-y-3 pb-4">
                <div className="flex flex-wrap gap-2">
                  <DialogNuevoEpisodio temporadaId={temporada.id} onCreado={() => router.refresh()} />
                  <DialogEpisodiosMasivo temporadaId={temporada.id} onCreados={() => router.refresh()} />
                </div>

                {temporada.episodios.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Sin episodios todavía.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>#</TableHead>
                        <TableHead>Título</TableHead>
                        <TableHead>Duración</TableHead>
                        <TableHead>Fuentes</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {temporada.episodios.map((episodio) => (
                        <TableRow key={episodio.id}>
                          <TableCell>{episodio.numero}</TableCell>
                          <TableCell>{episodio.titulo ?? `Episodio ${episodio.numero}`}</TableCell>
                          <TableCell>{episodio.duracionMin ? `${episodio.duracionMin} min` : "—"}</TableCell>
                          <TableCell>{episodio._count.fuentes}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                render={<Link href={`/admin/episodios/${episodio.id}/fuentes`} />}
                                aria-label="Fuentes de video"
                              >
                                <Video className="size-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => eliminarEpisodio(episodio.id)}
                                aria-label="Eliminar episodio"
                              >
                                <Trash2 className="size-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );
}

function DialogNuevaTemporada({ serieId, onCreada }: { serieId: string; onCreada: () => void }) {
  const [abierto, setAbierto] = useState(false);
  const [numero, setNumero] = useState("1");
  const [titulo, setTitulo] = useState("");
  const [anio, setAnio] = useState(String(new Date().getFullYear()));
  const [enviando, setEnviando] = useState(false);

  async function crear() {
    setEnviando(true);
    const r = await fetch(`/api/admin/series/${serieId}/temporadas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ numero: Number(numero), titulo, anio: Number(anio) }),
    });
    setEnviando(false);
    if (!r.ok) {
      const cuerpo = await r.json().catch(() => null);
      toast.error(cuerpo?.error ?? "No pudimos crear la temporada.");
      return;
    }
    toast.success("Temporada creada");
    setAbierto(false);
    onCreada();
  }

  return (
    <Dialog open={abierto} onOpenChange={setAbierto}>
      <DialogTrigger render={<Button size="sm"><Plus className="size-4" />Nueva temporada</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nueva temporada</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Número</Label>
            <Input type="number" min={1} value={numero} onChange={(e) => setNumero(e.target.value)} />
          </div>
          <div>
            <Label>Título (opcional)</Label>
            <Input value={titulo} onChange={(e) => setTitulo(e.target.value)} />
          </div>
          <div>
            <Label>Año</Label>
            <Input type="number" value={anio} onChange={(e) => setAnio(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setAbierto(false)}>
            Cancelar
          </Button>
          <Button onClick={crear} disabled={enviando}>
            Crear
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DialogNuevoEpisodio({ temporadaId, onCreado }: { temporadaId: string; onCreado: () => void }) {
  const [abierto, setAbierto] = useState(false);
  const [numero, setNumero] = useState("1");
  const [titulo, setTitulo] = useState("");
  const [duracionMin, setDuracionMin] = useState("24");
  const [enviando, setEnviando] = useState(false);

  async function crear() {
    setEnviando(true);
    const r = await fetch(`/api/admin/temporadas/${temporadaId}/episodios`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ numero: Number(numero), titulo, duracionMin: Number(duracionMin) }),
    });
    setEnviando(false);
    if (!r.ok) {
      const cuerpo = await r.json().catch(() => null);
      toast.error(cuerpo?.error ?? "No pudimos crear el episodio.");
      return;
    }
    toast.success("Episodio creado");
    setAbierto(false);
    onCreado();
  }

  return (
    <Dialog open={abierto} onOpenChange={setAbierto}>
      <DialogTrigger render={<Button size="sm" variant="outline"><Plus className="size-4" />Episodio</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nuevo episodio</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Número</Label>
            <Input type="number" min={1} value={numero} onChange={(e) => setNumero(e.target.value)} />
          </div>
          <div>
            <Label>Título (opcional)</Label>
            <Input value={titulo} onChange={(e) => setTitulo(e.target.value)} />
          </div>
          <div>
            <Label>Duración (min)</Label>
            <Input type="number" value={duracionMin} onChange={(e) => setDuracionMin(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setAbierto(false)}>
            Cancelar
          </Button>
          <Button onClick={crear} disabled={enviando}>
            Crear
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DialogEpisodiosMasivo({ temporadaId, onCreados }: { temporadaId: string; onCreados: () => void }) {
  const [abierto, setAbierto] = useState(false);
  const [desde, setDesde] = useState("1");
  const [hasta, setHasta] = useState("12");
  const [duracionMin, setDuracionMin] = useState("24");
  const [enviando, setEnviando] = useState(false);

  async function generar() {
    setEnviando(true);
    const r = await fetch(`/api/admin/temporadas/${temporadaId}/episodios/masivo`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ desde: Number(desde), hasta: Number(hasta), duracionMin: Number(duracionMin) }),
    });
    const cuerpo = await r.json().catch(() => null);
    setEnviando(false);
    if (!r.ok) {
      toast.error(cuerpo?.error ?? "No pudimos generar los episodios.");
      return;
    }
    toast.success(`${cuerpo.creados} episodios creados`);
    setAbierto(false);
    onCreados();
  }

  return (
    <Dialog open={abierto} onOpenChange={setAbierto}>
      <DialogTrigger
        render={
          <Button size="sm" variant="outline">
            <Pencil className="size-4" />
            Generar en lote
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Generar episodios numerados</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Desde</Label>
            <Input type="number" min={1} value={desde} onChange={(e) => setDesde(e.target.value)} />
          </div>
          <div>
            <Label>Hasta</Label>
            <Input type="number" min={1} value={hasta} onChange={(e) => setHasta(e.target.value)} />
          </div>
          <div className="col-span-2">
            <Label>Duración (min, aplica a todos)</Label>
            <Input type="number" value={duracionMin} onChange={(e) => setDuracionMin(e.target.value)} />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Los que ya existan en ese rango se saltean, no se sobrescriben.
        </p>
        <DialogFooter>
          <Button variant="outline" onClick={() => setAbierto(false)}>
            Cancelar
          </Button>
          <Button onClick={generar} disabled={enviando}>
            Generar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
