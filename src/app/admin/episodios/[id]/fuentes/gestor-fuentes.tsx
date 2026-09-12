"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Calidad, FuenteVideo, IdiomaAudio } from "@prisma/client";
import { Plus, Trash2, ShieldCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function GestorFuentes({ episodioId, fuentes }: { episodioId: string; fuentes: FuenteVideo[] }) {
  const router = useRouter();
  const [servidor, setServidor] = useState("");
  const [url, setUrl] = useState("");
  const [calidad, setCalidad] = useState<Calidad>("P1080");
  const [idioma, setIdioma] = useState<IdiomaAudio>("SUB");
  const [enviando, setEnviando] = useState(false);
  const [verificando, setVerificando] = useState<string | null>(null);

  async function agregar() {
    if (!servidor.trim() || !url.trim()) {
      toast.error("Completá servidor y URL.");
      return;
    }
    setEnviando(true);
    const r = await fetch(`/api/admin/episodios/${episodioId}/fuentes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ servidor, url, calidad, idioma, esActiva: true }),
    });
    setEnviando(false);
    if (!r.ok) return toast.error("No pudimos agregar la fuente.");
    toast.success("Fuente agregada");
    setServidor("");
    setUrl("");
    router.refresh();
  }

  async function alternarActiva(id: string, esActiva: boolean) {
    const r = await fetch(`/api/admin/fuentes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ esActiva }),
    });
    if (!r.ok) return toast.error("No pudimos actualizar la fuente.");
    router.refresh();
  }

  async function eliminar(id: string) {
    if (!confirm("¿Eliminar esta fuente?")) return;
    const r = await fetch(`/api/admin/fuentes/${id}`, { method: "DELETE" });
    if (!r.ok) return toast.error("No pudimos eliminar la fuente.");
    toast.success("Fuente eliminada");
    router.refresh();
  }

  async function verificar(id: string) {
    setVerificando(id);
    const r = await fetch(`/api/admin/fuentes/${id}/verificar`, { method: "POST" });
    const cuerpo = await r.json().catch(() => null);
    setVerificando(null);
    if (!r.ok) return toast.error("No pudimos verificar la fuente.");
    if (cuerpo.alcanzable) toast.success("El enlace responde bien");
    else toast.error(`El enlace no responde (${cuerpo.status ?? "sin respuesta"})`);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3 rounded-lg border border-border p-3">
        <div>
          <Label>Servidor</Label>
          <Input value={servidor} onChange={(e) => setServidor(e.target.value)} className="w-40" />
        </div>
        <div className="min-w-56 flex-1">
          <Label>URL</Label>
          <Input value={url} onChange={(e) => setUrl(e.target.value)} />
        </div>
        <div>
          <Label>Calidad</Label>
          <Select value={calidad} onValueChange={(v) => v && setCalidad(v as Calidad)}>
            <SelectTrigger className="w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="P480">480p</SelectItem>
              <SelectItem value="P720">720p</SelectItem>
              <SelectItem value="P1080">1080p</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Idioma</Label>
          <Select value={idioma} onValueChange={(v) => v && setIdioma(v as IdiomaAudio)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="SUB">Subtitulado</SelectItem>
              <SelectItem value="DUB">Doblado</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={agregar} disabled={enviando}>
          <Plus className="size-4" />
          Agregar
        </Button>
      </div>

      {fuentes.length === 0 ? (
        <p className="text-sm text-muted-foreground">Sin fuentes cargadas.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Servidor</TableHead>
              <TableHead>URL</TableHead>
              <TableHead>Calidad</TableHead>
              <TableHead>Idioma</TableHead>
              <TableHead>Reportes</TableHead>
              <TableHead>Activa</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fuentes.map((fuente) => (
              <TableRow key={fuente.id}>
                <TableCell>{fuente.servidor}</TableCell>
                <TableCell className="max-w-64 truncate text-xs text-muted-foreground">{fuente.url}</TableCell>
                <TableCell>{fuente.calidad.replace("P", "")}p</TableCell>
                <TableCell>{fuente.idioma}</TableCell>
                <TableCell>
                  {fuente.reportesCaido > 0 ? (
                    <Badge variant="destructive">{fuente.reportesCaido}</Badge>
                  ) : (
                    "0"
                  )}
                </TableCell>
                <TableCell>
                  <Switch
                    checked={fuente.esActiva}
                    onCheckedChange={(v) => alternarActiva(fuente.id, v)}
                  />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      disabled={verificando === fuente.id}
                      onClick={() => verificar(fuente.id)}
                      aria-label="Verificar enlace"
                    >
                      {verificando === fuente.id ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <ShieldCheck className="size-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => eliminar(fuente.id)}
                      aria-label="Eliminar fuente"
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
    </div>
  );
}
