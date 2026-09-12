"use client";

import type { Calidad, IdiomaAudio } from "@prisma/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ETIQUETA_IDIOMA } from "@/lib/etiquetas";

export type FuenteVideoOpcion = {
  id: string;
  servidor: string;
  url: string;
  calidad: Calidad;
  idioma: IdiomaAudio;
};

const ETIQUETA_CALIDAD: Record<Calidad, string> = {
  P480: "480p",
  P720: "720p",
  P1080: "1080p",
};

/** Busca la fuente que mejor respeta el cambio pedido; si la combinación
 * exacta no existe, prioriza el campo recién tocado y cae al primero. */
function mejorCoincidencia(
  fuentes: FuenteVideoOpcion[],
  actual: FuenteVideoOpcion,
  cambios: Partial<Pick<FuenteVideoOpcion, "idioma" | "servidor" | "calidad">>
): FuenteVideoOpcion {
  const objetivo = { ...actual, ...cambios };
  const exacta = fuentes.find(
    (f) => f.idioma === objetivo.idioma && f.servidor === objetivo.servidor && f.calidad === objetivo.calidad
  );
  if (exacta) return exacta;

  if (cambios.idioma) {
    const porIdioma = fuentes.find((f) => f.idioma === cambios.idioma);
    if (porIdioma) return porIdioma;
  }
  if (cambios.servidor) {
    const porServidor = fuentes.find((f) => f.servidor === cambios.servidor);
    if (porServidor) return porServidor;
  }
  if (cambios.calidad) {
    const porCalidad = fuentes.find((f) => f.calidad === cambios.calidad);
    if (porCalidad) return porCalidad;
  }

  return fuentes[0]!;
}

export function SelectorFuente({
  fuentes,
  actual,
  onCambiar,
}: {
  fuentes: FuenteVideoOpcion[];
  actual: FuenteVideoOpcion;
  onCambiar: (fuente: FuenteVideoOpcion) => void;
}) {
  const idiomas = [...new Set(fuentes.map((f) => f.idioma))];
  const servidores = [...new Set(fuentes.filter((f) => f.idioma === actual.idioma).map((f) => f.servidor))];
  const calidades = [
    ...new Set(
      fuentes.filter((f) => f.idioma === actual.idioma && f.servidor === actual.servidor).map((f) => f.calidad)
    ),
  ];

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select
        value={actual.idioma}
        onValueChange={(v) => v && onCambiar(mejorCoincidencia(fuentes, actual, { idioma: v as IdiomaAudio }))}
      >
        <SelectTrigger size="sm" className="w-28">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {idiomas.map((idioma) => (
            <SelectItem key={idioma} value={idioma}>
              {ETIQUETA_IDIOMA[idioma]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={actual.servidor}
        onValueChange={(v) => v && onCambiar(mejorCoincidencia(fuentes, actual, { servidor: v }))}
      >
        <SelectTrigger size="sm" className="w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {servidores.map((servidor) => (
            <SelectItem key={servidor} value={servidor}>
              {servidor}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={actual.calidad}
        onValueChange={(v) => v && onCambiar(mejorCoincidencia(fuentes, actual, { calidad: v as Calidad }))}
      >
        <SelectTrigger size="sm" className="w-24">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {calidades.map((calidad) => (
            <SelectItem key={calidad} value={calidad}>
              {ETIQUETA_CALIDAD[calidad]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
