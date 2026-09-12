"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ESTADOS = [
  { value: "EMISION", label: "En emisión" },
  { value: "FINALIZADO", label: "Finalizado" },
  { value: "PROXIMAMENTE", label: "Próximamente" },
] as const;

const TIPOS = [
  { value: "TV", label: "TV" },
  { value: "OVA", label: "OVA" },
  { value: "PELICULA", label: "Película" },
  { value: "ESPECIAL", label: "Especial" },
  { value: "ONA", label: "ONA" },
] as const;

const CLASIFICACIONES = [
  { value: "G", label: "G" },
  { value: "PG", label: "PG" },
  { value: "PG13", label: "PG-13" },
  { value: "R", label: "R" },
] as const;

const IDIOMAS = [
  { value: "SUB", label: "Subtitulado" },
  { value: "DUB", label: "Doblado" },
] as const;

const ORDENES = [
  { value: "recientes", label: "Más recientes" },
  { value: "vistos", label: "Más vistos" },
  { value: "puntuados", label: "Mejor puntuados" },
  { value: "az", label: "A-Z" },
] as const;

export function FiltrosCatalogo({
  generos,
  anios,
}: {
  generos: { nombre: string; slug: string }[];
  anios: number[];
}) {
  const opcionesAnio = anios.map((anio) => ({ value: String(anio), label: String(anio) }));
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // Cada filtro dispara una navegación del server, que puede tardar: sin
  // feedback la UI queda congelada y parece que el chip no hizo nada.
  //
  // OJO: lo natural sería useTransition(), pero envolver router.push() en
  // startTransition deja el pending colgado para siempre en esta versión de
  // Next (la navegación se completa, el transition nunca resuelve). Así que
  // el pendiente se guarda a mano y se limpia cuando los searchParams
  // realmente cambiaron, que es la señal de que la navegación aterrizó.
  const paramsActuales = searchParams.toString();
  const [pendiente, setPendiente] = useState<string | null>(null);
  useEffect(() => setPendiente(null), [paramsActuales]);
  // Si la navegación no aterriza en 8s, soltamos el estado igual: una barra de
  // filtros atenuada para siempre se lee como "roto", peor que sin feedback.
  useEffect(() => {
    if (pendiente === null) return;
    const id = setTimeout(() => setPendiente(null), 8000);
    return () => clearTimeout(id);
  }, [pendiente]);
  const navegando = pendiente !== null && pendiente !== paramsActuales;

  const generoSeleccionados = (searchParams.get("genero") ?? "").split(",").filter(Boolean);

  // OJO: acá se navega con el navegador (<a> nativo / location.assign) y no
  // con router.push() ni <Link>. La navegación de cliente hacia ESTA MISMA
  // ruta con otros searchParams falla de forma intermitente: la petición RSC
  // vuelve 200 pero el router nunca commitea y el filtro queda sin efecto (~2
  // de cada 3 clicks). Está comprobado que no depende de este componente:
  // pasa igual con router.push pelado y con <Link>. Recargar entero cuesta
  // unos cientos de ms más, pero filtra siempre — que es lo que importa.
  const actualizarUrl = useCallback(
    (cambios: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [clave, valor] of Object.entries(cambios)) {
        if (valor) params.set(clave, valor);
        else params.delete(clave);
      }
      // Cualquier cambio de filtro vuelve a la página 1.
      if (!("pagina" in cambios)) params.delete("pagina");
      setPendiente(params.toString());
      window.location.assign(`${pathname}?${params.toString()}`);
    },
    [pathname, searchParams]
  );

  /** URL que resulta de activar/desactivar este género, sin tocar el resto. */
  function urlConGenero(slug: string) {
    const nuevos = generoSeleccionados.includes(slug)
      ? generoSeleccionados.filter((g) => g !== slug)
      : [...generoSeleccionados, slug];
    const params = new URLSearchParams(searchParams.toString());
    if (nuevos.length > 0) params.set("genero", nuevos.join(","));
    else params.delete("genero");
    params.delete("pagina"); // cambiar de filtro vuelve a la página 1
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }

  const hayFiltrosActivos =
    generoSeleccionados.length > 0 ||
    !!searchParams.get("anio") ||
    !!searchParams.get("estado") ||
    !!searchParams.get("tipo") ||
    !!searchParams.get("clasificacion") ||
    !!searchParams.get("idioma");

  return (
    <div
      data-navegando={navegando ? "true" : "false"}
      className="space-y-4 transition-opacity duration-200 ease-out data-[navegando=true]:opacity-60"
    >
      <div className="flex flex-wrap gap-2">
        {/* Chips como <a> nativo: cada género tiene su propia URL, así que
            además de filtrar sirven para click-medio y "abrir en pestaña
            nueva". Ver la nota de actualizarUrl sobre por qué no son <Link>. */}
        {generos.map((genero) => {
          const activo = generoSeleccionados.includes(genero.slug);
          return (
            <a
              key={genero.slug}
              href={urlConGenero(genero.slug)}
              aria-current={activo ? "true" : undefined}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium outline-none",
                "transition-[color,background-color,border-color,box-shadow,transform] duration-200 ease-out",
                "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                // Feedback de pulsacion: 95% durante el click. Es lo unico que
                // confirma el toque antes de que responda el server.
                "active:scale-95",
                activo
                  ? "border-primary bg-primary text-primary-foreground shadow-[0_0_0_3px_color-mix(in_oklch,var(--primary)_18%,transparent)]"
                  : "border-border text-muted-foreground puntero-fino:hover:-translate-y-px hover:border-foreground/30 hover:text-foreground"
              )}
            >
              {genero.nombre}
            </a>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <SelectFiltro
          placeholder="Año"
          valor={searchParams.get("anio") ?? undefined}
          opciones={opcionesAnio}
          onCambiar={(v) => actualizarUrl({ anio: v })}
        />
        <SelectFiltro
          placeholder="Estado"
          valor={searchParams.get("estado") ?? undefined}
          opciones={ESTADOS}
          onCambiar={(v) => actualizarUrl({ estado: v })}
        />
        <SelectFiltro
          placeholder="Tipo"
          valor={searchParams.get("tipo") ?? undefined}
          opciones={TIPOS}
          onCambiar={(v) => actualizarUrl({ tipo: v })}
        />
        <SelectFiltro
          placeholder="Clasificación"
          valor={searchParams.get("clasificacion") ?? undefined}
          opciones={CLASIFICACIONES}
          onCambiar={(v) => actualizarUrl({ clasificacion: v })}
        />
        <SelectFiltro
          placeholder="Idioma"
          valor={searchParams.get("idioma") ?? undefined}
          opciones={IDIOMAS}
          onCambiar={(v) => actualizarUrl({ idioma: v })}
        />

        <div className="ml-auto flex items-center gap-2">
          {hayFiltrosActivos && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setPendiente("");
                window.location.assign(pathname);
              }}
              className="text-muted-foreground"
            >
              <X className="size-3.5" />
              Limpiar
            </Button>
          )}
          <SelectFiltro
            placeholder="Ordenar por"
            valor={searchParams.get("orden") ?? "recientes"}
            opciones={ORDENES}
            onCambiar={(v) => actualizarUrl({ orden: v })}
          />
        </div>
      </div>
    </div>
  );
}

function SelectFiltro({
  placeholder,
  valor,
  opciones,
  onCambiar,
}: {
  placeholder: string;
  valor?: string;
  opciones: readonly { value: string; label: string }[];
  onCambiar: (valor: string | undefined) => void;
}) {
  return (
    <Select
      value={valor}
      onValueChange={(v) => {
        const limpio = v ?? undefined;
        onCambiar(limpio === valor ? undefined : limpio);
      }}
    >
      <SelectTrigger size="sm">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {opciones.map((opcion) => (
          <SelectItem key={opcion.value} value={opcion.value}>
            {opcion.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
