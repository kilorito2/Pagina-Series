"use client";

import { useState } from "react";
import { toast } from "sonner";
import { FlagTriangleRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function BotonReportar({ fuenteVideoId }: { fuenteVideoId: string }) {
  const [abierto, setAbierto] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function enviar() {
    setEnviando(true);
    const respuesta = await fetch("/api/reportes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fuenteVideoId, motivo: motivo.trim() || undefined }),
    });
    setEnviando(false);

    if (!respuesta.ok) {
      toast.error("No pudimos enviar el reporte.");
      return;
    }

    toast.success("Gracias, lo vamos a revisar.");
    setMotivo("");
    setAbierto(false);
  }

  return (
    <Dialog open={abierto} onOpenChange={setAbierto}>
      <DialogTrigger
        render={
          <Button type="button" variant="ghost" size="sm">
            <FlagTriangleRight className="size-4" />
            Reportar enlace caído
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reportar enlace caído</DialogTitle>
          <DialogDescription>
            Le avisamos al equipo de moderación que este servidor no está funcionando.
          </DialogDescription>
        </DialogHeader>
        <Textarea
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          placeholder="Contanos qué pasó (opcional)"
          maxLength={300}
        />
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setAbierto(false)}>
            Cancelar
          </Button>
          <Button type="button" onClick={enviar} disabled={enviando}>
            {enviando ? "Enviando..." : "Enviar reporte"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
