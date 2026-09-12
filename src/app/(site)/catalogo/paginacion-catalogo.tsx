import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

function construirHref(
  searchParams: Record<string, string | string[] | undefined>,
  pagina: number
) {
  const params = new URLSearchParams();
  for (const [clave, valor] of Object.entries(searchParams)) {
    if (clave === "pagina" || valor === undefined) continue;
    params.set(clave, Array.isArray(valor) ? valor[0]! : valor);
  }
  if (pagina > 1) params.set("pagina", String(pagina));
  const query = params.toString();
  return query ? `/catalogo?${query}` : "/catalogo";
}

export function PaginacionCatalogo({
  paginaActual,
  totalPaginas,
  searchParams,
}: {
  paginaActual: number;
  totalPaginas: number;
  searchParams: Record<string, string | string[] | undefined>;
}) {
  if (totalPaginas <= 1) return null;

  // Ventana de páginas alrededor de la actual, con la primera y la última siempre visibles.
  const paginas = new Set<number>([1, totalPaginas]);
  for (let p = paginaActual - 1; p <= paginaActual + 1; p++) {
    if (p >= 1 && p <= totalPaginas) paginas.add(p);
  }
  const ordenadas = [...paginas].sort((a, b) => a - b);

  return (
    <Pagination className="mt-8">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href={construirHref(searchParams, Math.max(1, paginaActual - 1))}
            aria-disabled={paginaActual === 1}
            className={paginaActual === 1 ? "pointer-events-none opacity-50" : undefined}
            text="Anterior"
          />
        </PaginationItem>

        {ordenadas.map((pagina, i) => (
          <PaginacionSegmento
            key={pagina}
            pagina={pagina}
            anterior={ordenadas[i - 1]}
            activa={pagina === paginaActual}
            href={construirHref(searchParams, pagina)}
          />
        ))}

        <PaginationItem>
          <PaginationNext
            href={construirHref(searchParams, Math.min(totalPaginas, paginaActual + 1))}
            aria-disabled={paginaActual === totalPaginas}
            className={paginaActual === totalPaginas ? "pointer-events-none opacity-50" : undefined}
            text="Siguiente"
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

function PaginacionSegmento({
  pagina,
  anterior,
  activa,
  href,
}: {
  pagina: number;
  anterior?: number;
  activa: boolean;
  href: string;
}) {
  const salto = anterior !== undefined && pagina - anterior > 1;
  return (
    <>
      {salto && (
        <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem>
      )}
      <PaginationItem>
        <PaginationLink href={href} isActive={activa}>
          {pagina}
        </PaginationLink>
      </PaginationItem>
    </>
  );
}
