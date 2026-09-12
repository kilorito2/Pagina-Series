import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export function PaginacionSimple({
  paginaActual,
  totalPaginas,
  base,
  searchParams,
}: {
  paginaActual: number;
  totalPaginas: number;
  base: string;
  /** Otros query params a preservar entre páginas (por ejemplo `q` de una búsqueda). */
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  if (totalPaginas <= 1) return null;

  function href(pagina: number) {
    const params = new URLSearchParams();
    if (searchParams) {
      for (const [clave, valor] of Object.entries(searchParams)) {
        if (clave === "pagina" || valor === undefined) continue;
        params.set(clave, Array.isArray(valor) ? valor[0]! : valor);
      }
    }
    if (pagina > 1) params.set("pagina", String(pagina));
    const query = params.toString();
    return query ? `${base}?${query}` : base;
  }

  return (
    <Pagination className="mt-6">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href={href(Math.max(1, paginaActual - 1))}
            className={paginaActual === 1 ? "pointer-events-none opacity-50" : undefined}
            text="Anterior"
          />
        </PaginationItem>
        {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((pagina) => (
          <PaginationItem key={pagina}>
            <PaginationLink href={href(pagina)} isActive={pagina === paginaActual}>
              {pagina}
            </PaginationLink>
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationNext
            href={href(Math.min(totalPaginas, paginaActual + 1))}
            className={paginaActual === totalPaginas ? "pointer-events-none opacity-50" : undefined}
            text="Siguiente"
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
