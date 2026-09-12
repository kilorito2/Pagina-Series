"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * Subida directa a R2 vía URL prefirmada + campo de URL manual como
 * respaldo (útil en desarrollo, sin credenciales de R2 configuradas, o
 * para pegar directamente una imagen ya alojada en otro lado).
 */
export function SubirImagen({
  etiqueta,
  valor,
  onCambiar,
  aspecto = "aspect-[2/3]",
}: {
  etiqueta: string;
  valor: string;
  onCambiar: (url: string) => void;
  aspecto?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [subiendo, setSubiendo] = useState(false);

  async function subirArchivo(archivo: File) {
    setSubiendo(true);
    try {
      const respuesta = await fetch("/api/admin/subir-imagen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombreArchivo: archivo.name, contentType: archivo.type }),
      });
      const cuerpo = await respuesta.json();
      if (!respuesta.ok) throw new Error(cuerpo.error ?? "Error al subir");

      const subida = await fetch(cuerpo.urlSubida, {
        method: "PUT",
        headers: { "Content-Type": archivo.type },
        body: archivo,
      });
      if (!subida.ok) throw new Error("El archivo no se pudo subir a R2");

      onCambiar(cuerpo.urlPublica);
      toast.success("Imagen subida");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No pudimos subir la imagen");
    } finally {
      setSubiendo(false);
    }
  }

  return (
    <div className="space-y-2">
      <Label>{etiqueta}</Label>
      <div className="flex gap-3">
        <div className={`relative w-24 shrink-0 overflow-hidden rounded-md bg-muted ${aspecto}`}>
          {valor && <Image src={valor} alt="" fill sizes="96px" className="object-cover" />}
        </div>
        <div className="flex-1 space-y-2">
          <Input
            value={valor}
            onChange={(e) => onCambiar(e.target.value)}
            placeholder="https://... (o subí un archivo)"
          />
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              const archivo = e.target.files?.[0];
              if (archivo) void subirArchivo(archivo);
              e.target.value = "";
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={subiendo}
            onClick={() => inputRef.current?.click()}
          >
            {subiendo ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
            Subir archivo
          </Button>
        </div>
      </div>
    </div>
  );
}
