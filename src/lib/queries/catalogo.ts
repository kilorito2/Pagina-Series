import "server-only";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { CatalogoFiltros } from "@/lib/validaciones/catalogo";

export const SERIES_POR_PAGINA = 24;

function armarWhere(filtros: CatalogoFiltros): Prisma.SerieWhereInput {
  const where: Prisma.SerieWhereInput = {};

  if (filtros.genero) {
    const slugs = filtros.genero.split(",").filter(Boolean);
    if (slugs.length > 0) {
      where.generos = { some: { genero: { slug: { in: slugs } } } };
    }
  }
  if (filtros.anio) where.anio = filtros.anio;
  if (filtros.estado) where.estado = filtros.estado;
  if (filtros.tipo) where.tipo = filtros.tipo;
  if (filtros.clasificacion) where.clasificacion = filtros.clasificacion;
  if (filtros.idioma) {
    where.temporadas = {
      some: {
        episodios: {
          some: { fuentes: { some: { idioma: filtros.idioma, esActiva: true } } },
        },
      },
    };
  }

  return where;
}

function armarOrderBy(orden: CatalogoFiltros["orden"]): Prisma.SerieOrderByWithRelationInput {
  switch (orden) {
    case "vistos":
      return { vistas: "desc" };
    case "puntuados":
      return { ratingPromedio: "desc" };
    case "az":
      return { titulo: "asc" };
    case "recientes":
    default:
      return { createdAt: "desc" };
  }
}

export async function obtenerCatalogo(filtros: CatalogoFiltros) {
  const where = armarWhere(filtros);
  const orderBy = armarOrderBy(filtros.orden);

  const [series, total] = await Promise.all([
    prisma.serie.findMany({
      where,
      select: {
        id: true,
        slug: true,
        titulo: true,
        poster: true,
        anio: true,
        ratingPromedio: true,
        tipo: true,
      },
      orderBy,
      skip: (filtros.pagina - 1) * SERIES_POR_PAGINA,
      take: SERIES_POR_PAGINA,
    }),
    prisma.serie.count({ where }),
  ]);

  return {
    series,
    total,
    totalPaginas: Math.max(1, Math.ceil(total / SERIES_POR_PAGINA)),
  };
}

export async function obtenerGeneros() {
  return prisma.genero.findMany({ orderBy: { nombre: "asc" } });
}

export async function obtenerAniosDisponibles() {
  const filas = await prisma.serie.findMany({
    distinct: ["anio"],
    select: { anio: true },
    orderBy: { anio: "desc" },
  });
  return filas.map((f) => f.anio);
}
