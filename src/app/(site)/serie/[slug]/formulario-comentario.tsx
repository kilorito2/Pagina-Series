"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import type { ComentarioConHijos } from "@/lib/queries/comentarios";

export function FormularioComentario({
  serieId,
  parentId,
  onEnviado,
  autoFocus,
}: {
  serieId: string;
  parentId?: string;
  onEnviado: (nuevo: ComentarioConHijos) => void;
  autoFocus?: boolean;
}) {
  const router = useRouter();
  const [contenido, setContenido] = useState("");
  const [spoiler, setSpoiler] = useState(false);
  const [enviando, setEnviando] = useState(false);

  async function enviar() {
    if (!contenido.trim()) return;
    setEnviando(true);
    const respuesta = await fetch("/api/comentarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contenido, spoiler, serieId, parentId }),
    });
    setEnviando(false);

    if (respuesta.status === 401) {
      router.push("/login");
      return;
    }
    if (respuesta.status === 409) {
      router.push("/perfiles");
      return;
    }
    if (!respuesta.ok) {
      toast.error("No pudimos publicar tu comentario.");
      return;
    }

    const cuerpo = await respuesta.json();
    setContenido("");
    setSpoiler(false);
    onEnviado(cuerpo.comentario);
  }

  return (
    <div className="space-y-2">
      <Textarea
        value={contenido}
        onChange={(e) => setContenido(e.target.value)}
        placeholder={parentId ? "Escribí una respuesta..." : "Escribí un comentario..."}
        maxLength={1000}
        rows={parentId ? 2 : 3}
        autoFocus={autoFocus}
      />
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <Checkbox checked={spoiler} onCheckedChange={(v) => setSpoiler(!!v)} />
          Contiene spoilers
        </label>
        <Button size="sm" onClick={enviar} disabled={enviando || !contenido.trim()}>
          {parentId ? "Responder" : "Comentar"}
        </Button>
      </div>
    </div>
  );
}
