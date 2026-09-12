"use client";

import { useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { EyeOff, Flag, Reply, Trash2 } from "lucide-react";
import type { ComentarioConHijos } from "@/lib/queries/comentarios";
import { FormularioComentario } from "./formulario-comentario";

function insertarHijo(
  lista: ComentarioConHijos[],
  parentId: string,
  nuevo: ComentarioConHijos
): ComentarioConHijos[] {
  return lista.map((c) =>
    c.id === parentId
      ? { ...c, hijos: [...c.hijos, nuevo] }
      : { ...c, hijos: insertarHijo(c.hijos, parentId, nuevo) }
  );
}

function marcarEliminado(lista: ComentarioConHijos[], id: string): ComentarioConHijos[] {
  return lista
    .filter((c) => c.id !== id)
    .map((c) => ({ ...c, hijos: marcarEliminado(c.hijos, id) }));
}

export function SeccionComentarios({
  serieId,
  comentariosIniciales,
  perfilActivoId,
  esAdmin,
}: {
  serieId: string;
  comentariosIniciales: ComentarioConHijos[];
  perfilActivoId: string | null;
  esAdmin: boolean;
}) {
  const [comentarios, setComentarios] = useState(comentariosIniciales);

  return (
    <div className="space-y-6">
      <FormularioComentario
        serieId={serieId}
        onEnviado={(nuevo) => setComentarios((prev) => [...prev, nuevo])}
      />

      {comentarios.length === 0 ? (
        <p className="text-sm text-muted-foreground">Todavía no hay comentarios. ¡Sé el primero!</p>
      ) : (
        <div className="space-y-4">
          {comentarios.map((comentario) => (
            <ItemComentario
              key={comentario.id}
              comentario={comentario}
              serieId={serieId}
              perfilActivoId={perfilActivoId}
              esAdmin={esAdmin}
              onResponder={(nuevo) =>
                setComentarios((prev) => insertarHijo(prev, nuevo.parentId!, nuevo))
              }
              onEliminado={(id) => setComentarios((prev) => marcarEliminado(prev, id))}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ItemComentario({
  comentario,
  serieId,
  perfilActivoId,
  esAdmin,
  onResponder,
  onEliminado,
  nivel = 0,
}: {
  comentario: ComentarioConHijos;
  serieId: string;
  perfilActivoId: string | null;
  esAdmin: boolean;
  onResponder: (nuevo: ComentarioConHijos) => void;
  onEliminado: (id: string) => void;
  nivel?: number;
}) {
  const [respondiendo, setRespondiendo] = useState(false);
  const [spoilerRevelado, setSpoilerRevelado] = useState(false);
  const [eliminando, setEliminando] = useState(false);

  const esPropio = comentario.profileId === perfilActivoId;
  const puedeEliminar = esPropio || esAdmin;

  async function reportar() {
    const respuesta = await fetch(`/api/comentarios/${comentario.id}/reportar`, { method: "POST" });
    if (!respuesta.ok) {
      toast.error("No pudimos enviar el reporte.");
      return;
    }
    toast.success("Gracias, lo vamos a revisar.");
  }

  async function eliminar() {
    if (!confirm("¿Eliminar este comentario?")) return;
    setEliminando(true);
    const respuesta = await fetch(`/api/comentarios/${comentario.id}`, { method: "DELETE" });
    setEliminando(false);
    if (!respuesta.ok) {
      toast.error("No pudimos eliminar el comentario.");
      return;
    }
    onEliminado(comentario.id);
  }

  return (
    <div className={nivel > 0 ? "ml-6 border-l border-border pl-4 sm:ml-10" : ""}>
      <div className="flex gap-3">
        <span className="relative size-8 shrink-0 overflow-hidden rounded-full bg-muted">
          <Image src={comentario.profile.avatar} alt="" fill sizes="32px" className="object-cover" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium">{comentario.profile.nombre}</span>
            <span className="text-xs text-muted-foreground">
              {new Date(comentario.createdAt).toLocaleDateString("es-419")}
            </span>
          </div>

          {comentario.spoiler && !spoilerRevelado ? (
            <button
              type="button"
              onClick={() => setSpoilerRevelado(true)}
              className="mt-1 flex items-center gap-1.5 rounded-md bg-muted px-2.5 py-1.5 text-sm text-muted-foreground hover:text-foreground"
            >
              <EyeOff className="size-3.5" />
              Contiene spoilers — click para ver
            </button>
          ) : (
            <p className="mt-1 text-sm whitespace-pre-wrap">{comentario.contenido}</p>
          )}

          <div className="mt-1 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setRespondiendo((v) => !v)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <Reply className="size-3.5" />
              Responder
            </button>
            <button
              type="button"
              onClick={reportar}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <Flag className="size-3.5" />
              Reportar
            </button>
            {puedeEliminar && (
              <button
                type="button"
                disabled={eliminando}
                onClick={eliminar}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="size-3.5" />
                Eliminar
              </button>
            )}
          </div>

          {respondiendo && (
            <div className="mt-2">
              <FormularioComentario
                serieId={serieId}
                parentId={comentario.id}
                autoFocus
                onEnviado={(nuevo) => {
                  onResponder(nuevo);
                  setRespondiendo(false);
                }}
              />
            </div>
          )}

          {comentario.hijos.length > 0 && (
            <div className="mt-3 space-y-3">
              {comentario.hijos.map((hijo) => (
                <ItemComentario
                  key={hijo.id}
                  comentario={hijo}
                  serieId={serieId}
                  perfilActivoId={perfilActivoId}
                  esAdmin={esAdmin}
                  onResponder={onResponder}
                  onEliminado={onEliminado}
                  nivel={nivel + 1}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
