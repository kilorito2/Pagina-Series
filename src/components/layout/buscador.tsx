"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Search, X, Clock, Loader2, TrendingUp } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";

type ResultadoBusqueda = {
  id: string;
  slug: string;
  titulo: string;
  poster: string;
  anio: number;
};

type SeriePopular = { id: string; slug: string; titulo: string; poster: string; anio: number };

const CLAVE_HISTORIAL = "animeverse:busquedas-recientes";
const MAX_HISTORIAL = 6;

function leerHistorial(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const crudo = window.localStorage.getItem(CLAVE_HISTORIAL);
    return crudo ? (JSON.parse(crudo) as string[]) : [];
  } catch {
    return [];
  }
}

function guardarHistorial(termino: string) {
  try {
    const actual = leerHistorial().filter((t) => t.toLowerCase() !== termino.toLowerCase());
    const nuevo = [termino, ...actual].slice(0, MAX_HISTORIAL);
    window.localStorage.setItem(CLAVE_HISTORIAL, JSON.stringify(nuevo));
  } catch {
    // localStorage puede fallar (modo privado, cuota llena); no es crítico.
  }
}

export function Buscador({
  className,
  populares = [],
}: {
  className?: string;
  /** Series con más vistas, para sugerir búsquedas cuando el input está vacío. */
  populares?: SeriePopular[];
}) {
  const router = useRouter();
  const contenedorRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [abierto, setAbierto] = useState(false);
  const [resultados, setResultados] = useState<ResultadoBusqueda[]>([]);
  const [cargando, setCargando] = useState(false);
  const [historial, setHistorial] = useState<string[]>([]);
  const queryDebounced = useDebounce(query, 300);

  useEffect(() => {
    if (abierto) setHistorial(leerHistorial());
  }, [abierto]);

  useEffect(() => {
    if (!queryDebounced.trim()) {
      setResultados([]);
      return;
    }
    const controller = new AbortController();
    setCargando(true);
    fetch(`/api/buscar?q=${encodeURIComponent(queryDebounced)}`, { signal: controller.signal })
      .then((r) => r.json())
      .then((data: { series?: ResultadoBusqueda[] }) => setResultados(data.series ?? []))
      .catch(() => {})
      .finally(() => setCargando(false));
    return () => controller.abort();
  }, [queryDebounced]);

  useEffect(() => {
    function alClickAfuera(evento: MouseEvent) {
      if (contenedorRef.current && !contenedorRef.current.contains(evento.target as Node)) {
        setAbierto(false);
      }
    }
    function alApretarEscape(evento: KeyboardEvent) {
      if (evento.key === "Escape") setAbierto(false);
    }
    document.addEventListener("mousedown", alClickAfuera);
    document.addEventListener("keydown", alApretarEscape);
    return () => {
      document.removeEventListener("mousedown", alClickAfuera);
      document.removeEventListener("keydown", alApretarEscape);
    };
  }, []);

  function buscar(termino: string) {
    const limpio = termino.trim();
    if (!limpio) return;
    guardarHistorial(limpio);
    setAbierto(false);
    setQuery("");
    router.push(`/buscar?q=${encodeURIComponent(limpio)}`);
  }

  const mostrarDropdown =
    abierto && (query.trim().length > 0 || historial.length > 0 || populares.length > 0);

  return (
    <div ref={contenedorRef} className={cn("relative w-full", className)}>
      <form
        role="search"
        onSubmit={(evento) => {
          evento.preventDefault();
          buscar(query);
        }}
      >
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground transition-colors duration-200 ease-out peer-focus-visible:text-foreground" />
          <input
            type="search"
            value={query}
            onChange={(evento) => setQuery(evento.target.value)}
            onFocus={() => setAbierto(true)}
            placeholder="Buscar series..."
            aria-label="Buscar series"
            className="peer h-9 w-full rounded-lg border border-input bg-transparent py-2 pr-8 pl-8 text-sm outline-none transition-[color,background-color,border-color,box-shadow] duration-200 ease-out focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded text-muted-foreground transition-colors duration-150 ease-out hover:text-foreground active:scale-90"
              aria-label="Borrar búsqueda"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
      </form>

      {mostrarDropdown && (
        <div className="absolute top-full z-50 mt-2 w-full origin-top overflow-hidden rounded-xl bg-popover text-popover-foreground shadow-xl ring-1 ring-foreground/10 animate-in fade-in-0 zoom-in-95 slide-in-from-top-1 duration-200 ease-out">
          {query.trim() ? (
            <ResultadosDropdown
              resultados={resultados}
              cargando={cargando}
              query={query}
              onElegir={buscar}
            />
          ) : (
            <DropdownVacio historial={historial} populares={populares} onElegir={buscar} />
          )}
        </div>
      )}
    </div>
  );
}

function ResultadosDropdown({
  resultados,
  cargando,
  query,
  onElegir,
}: {
  resultados: ResultadoBusqueda[];
  cargando: boolean;
  query: string;
  onElegir: (termino: string) => void;
}) {
  if (cargando) {
    return (
      <div className="flex items-center gap-2 px-4 py-4 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Buscando...
      </div>
    );
  }

  if (resultados.length === 0) {
    return (
      <p className="px-4 py-4 text-sm text-muted-foreground">
        Sin resultados para &ldquo;{query}&rdquo;.
      </p>
    );
  }

  return (
    <div className="max-h-96 overflow-y-auto py-1">
      {resultados.map((serie) => (
        <button
          key={serie.id}
          type="button"
          onClick={() => onElegir(serie.titulo)}
          className="group/fila flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors duration-150 ease-out hover:bg-accent hover:text-accent-foreground"
        >
          <span className="relative size-10 shrink-0 overflow-hidden rounded-md bg-muted ring-1 ring-border">
            <Image
              src={serie.poster}
              alt=""
              fill
              sizes="40px"
              className="object-cover transition-transform duration-300 ease-out-fuerte puntero-fino:group-hover/fila:scale-110"
            />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate font-medium">{serie.titulo}</span>
            <span className="text-xs text-muted-foreground">{serie.anio}</span>
          </span>
        </button>
      ))}
      <button
        type="button"
        onClick={() => onElegir(query)}
        className="w-full border-t border-border px-3 py-2 text-left text-xs text-primary hover:underline"
      >
        Ver todos los resultados para &ldquo;{query}&rdquo;
      </button>
    </div>
  );
}

function DropdownVacio({
  historial,
  populares,
  onElegir,
}: {
  historial: string[];
  populares: SeriePopular[];
  onElegir: (termino: string) => void;
}) {
  if (historial.length === 0 && populares.length === 0) return null;

  return (
    <div className="max-h-96 overflow-y-auto py-1">
      {historial.length > 0 && (
        <div>
          <p className="px-3 pt-1 pb-1 text-xs text-muted-foreground">Búsquedas recientes</p>
          {historial.map((termino) => (
            <button
              key={termino}
              type="button"
              onClick={() => onElegir(termino)}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors duration-150 ease-out hover:bg-accent hover:text-accent-foreground"
            >
              <Clock className="size-3.5 text-muted-foreground" />
              {termino}
            </button>
          ))}
        </div>
      )}

      {populares.length > 0 && (
        <div>
          <p className="flex items-center gap-1 px-3 pt-2 pb-1 text-xs text-muted-foreground">
            <TrendingUp className="size-3.5" />
            Populares
          </p>
          {populares.map((serie) => (
            <button
              key={serie.id}
              type="button"
              onClick={() => onElegir(serie.titulo)}
              className="group/fila flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors duration-150 ease-out hover:bg-accent hover:text-accent-foreground"
            >
              <span className="relative size-10 shrink-0 overflow-hidden rounded bg-muted">
                <Image src={serie.poster} alt="" fill sizes="40px" className="object-cover" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium">{serie.titulo}</span>
                <span className="text-xs text-muted-foreground">{serie.anio}</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
