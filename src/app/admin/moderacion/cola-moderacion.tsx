"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { MessageSquareOff, LinkIcon, Trash2, PowerOff, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

type Reporte = {
  id: string;
  tipo: "COMENTARIO" | "ENLACE_CAIDO";
  motivo: string;
  createdAt: string | Date;
  comentario: {
    id: string;
    contenido: string;
    profile: { nombre: string };
    serie: { titulo: string; slug: string } | null;
  } | null;
  fuente: {
    id: string;
    servidor: string;
    url: string;
    episodio: { numero: number; temporada: { numero: number; serie: { titulo: string; slug: string } } };
  } | null;
};

export function ColaModeracion({ reportes }: { reportes: Reporte[] }) {
  const router = useRouter();
  const [enCurso, setEnCurso] = useState<string | null>(null);

  async function resolver(id: string, accion: "eliminar_comentario" | "desactivar_fuente" | "descartar") {
    setEnCurso(id);
    const r = await fetch(`/api/admin/reportes/${id}/resolver`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accion }),
    });
    setEnCurso(null);
    if (!r.ok) {
      toast.error("No pudimos resolver el reporte.");
      return;
    }
    toast.success("Resuelto");
    router.refresh();
  }

  return (
    <div className="space-y-3">
      {reportes.map((reporte) => (
        <Card key={reporte.id}>
          <CardContent className="flex flex-wrap items-start justify-between gap-3 pt-4">
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-center gap-2">
                <Badge variant={reporte.tipo === "COMENTARIO" ? "secondary" : "destructive"}>
                  {reporte.tipo === "COMENTARIO" ? (
                    <>
                      <MessageSquareOff className="size-3" />
                      Comentario
                    </>
                  ) : (
                    <>
                      <LinkIcon className="size-3" />
                      Enlace caído
                    </>
                  )}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {new Date(reporte.createdAt).toLocaleDateString("es-419")}
                </span>
              </div>

              <p className="text-sm text-muted-foreground">Motivo: {reporte.motivo}</p>

              {reporte.comentario && (
                <div className="mt-2 rounded-md bg-muted p-2 text-sm">
                  <p className="mb-1 text-xs text-muted-foreground">
                    {reporte.comentario.profile.nombre} en{" "}
                    {reporte.comentario.serie && (
                      <Link href={`/serie/${reporte.comentario.serie.slug}`} className="hover:underline">
                        {reporte.comentario.serie.titulo}
                      </Link>
                    )}
                  </p>
                  <p className="line-clamp-3">{reporte.comentario.contenido}</p>
                </div>
              )}

              {reporte.fuente && (
                <div className="mt-2 rounded-md bg-muted p-2 text-sm">
                  <p className="text-xs text-muted-foreground">
                    {reporte.fuente.episodio.temporada.serie.titulo} — T
                    {reporte.fuente.episodio.temporada.numero} E{reporte.fuente.episodio.numero} —{" "}
                    {reporte.fuente.servidor}
                  </p>
                  <p className="truncate text-xs">{reporte.fuente.url}</p>
                </div>
              )}

              {!reporte.comentario && !reporte.fuente && (
                <p className="mt-2 text-xs text-muted-foreground italic">
                  El contenido reportado ya no existe.
                </p>
              )}
            </div>

            <div className="flex shrink-0 gap-1">
              {reporte.comentario && (
                <Button
                  size="sm"
                  variant="destructive"
                  disabled={enCurso === reporte.id}
                  onClick={() => resolver(reporte.id, "eliminar_comentario")}
                >
                  <Trash2 className="size-3.5" />
                  Eliminar comentario
                </Button>
              )}
              {reporte.fuente && (
                <Button
                  size="sm"
                  variant="destructive"
                  disabled={enCurso === reporte.id}
                  onClick={() => resolver(reporte.id, "desactivar_fuente")}
                >
                  <PowerOff className="size-3.5" />
                  Desactivar fuente
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                disabled={enCurso === reporte.id}
                onClick={() => resolver(reporte.id, "descartar")}
              >
                <X className="size-3.5" />
                Descartar
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
