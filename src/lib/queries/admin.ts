import "server-only";
import { prisma } from "@/lib/prisma";

function inicioDelDia() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}
function inicioDeLaSemana() {
  const d = inicioDelDia();
  const diff = (d.getDay() + 6) % 7; // lunes = 0
  d.setDate(d.getDate() - diff);
  return d;
}

export async function obtenerResumenDashboard() {
  const [totalSeries, totalEpisodios, totalUsuarios, vistasHoy, vistasSemana, ultimosComentarios, reportesPendientes] =
    await Promise.all([
      prisma.serie.count(),
      prisma.episodio.count(),
      prisma.user.count(),
      // Aproximamos "vistas" con guardados de progreso: no llevamos un log
      // de eventos de vista, así que contamos actualizaciones de Progreso
      // como proxy razonable de actividad de reproducción.
      prisma.progreso.count({ where: { updatedAt: { gte: inicioDelDia() } } }),
      prisma.progreso.count({ where: { updatedAt: { gte: inicioDeLaSemana() } } }),
      prisma.comentario.findMany({
        where: { eliminado: false },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          contenido: true,
          createdAt: true,
          profile: { select: { nombre: true } },
          serie: { select: { titulo: true, slug: true } },
        },
      }),
      prisma.reporte.count({ where: { estado: "PENDIENTE" } }),
    ]);

  return { totalSeries, totalEpisodios, totalUsuarios, vistasHoy, vistasSemana, ultimosComentarios, reportesPendientes };
}

export const SERIES_ADMIN_POR_PAGINA = 20;

const ORDEN_SERIES_ADMIN = {
  recientes: { createdAt: "desc" as const },
  titulo: { titulo: "asc" as const },
  anio: { anio: "desc" as const },
  vistas: { vistas: "desc" as const },
};
export type OrdenSeriesAdmin = keyof typeof ORDEN_SERIES_ADMIN;

export async function obtenerSeriesAdmin({
  q,
  pagina,
  orden = "recientes",
}: {
  q?: string;
  pagina: number;
  orden?: OrdenSeriesAdmin;
}) {
  const where = q
    ? { titulo: { contains: q, mode: "insensitive" as const } }
    : {};

  const [series, total] = await Promise.all([
    prisma.serie.findMany({
      where,
      orderBy: ORDEN_SERIES_ADMIN[orden] ?? ORDEN_SERIES_ADMIN.recientes,
      skip: (pagina - 1) * SERIES_ADMIN_POR_PAGINA,
      take: SERIES_ADMIN_POR_PAGINA,
      select: {
        id: true,
        titulo: true,
        slug: true,
        poster: true,
        anio: true,
        estado: true,
        tipo: true,
        vistas: true,
        _count: { select: { temporadas: true } },
      },
    }),
    prisma.serie.count({ where }),
  ]);

  return { series, total, totalPaginas: Math.max(1, Math.ceil(total / SERIES_ADMIN_POR_PAGINA)) };
}

export async function obtenerSerieParaEditar(id: string) {
  return prisma.serie.findUnique({
    where: { id },
    include: { generos: { select: { generoId: true } } },
  });
}

export async function obtenerSerieConTemporadas(id: string) {
  return prisma.serie.findUnique({
    where: { id },
    select: {
      id: true,
      titulo: true,
      slug: true,
      temporadas: {
        orderBy: { numero: "asc" },
        select: {
          id: true,
          numero: true,
          titulo: true,
          episodios: {
            orderBy: { numero: "asc" },
            select: {
              id: true,
              numero: true,
              titulo: true,
              duracionMin: true,
              _count: { select: { fuentes: true } },
            },
          },
        },
      },
    },
  });
}

export const USUARIOS_POR_PAGINA = 20;

export async function obtenerUsuariosAdmin({ q, pagina }: { q?: string; pagina: number }) {
  const where = q ? { email: { contains: q, mode: "insensitive" as const } } : {};

  const [usuarios, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (pagina - 1) * USUARIOS_POR_PAGINA,
      take: USUARIOS_POR_PAGINA,
      select: {
        id: true,
        email: true,
        role: true,
        baneado: true,
        emailVerified: true,
        createdAt: true,
        _count: { select: { perfiles: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return { usuarios, total, totalPaginas: Math.max(1, Math.ceil(total / USUARIOS_POR_PAGINA)) };
}

export async function obtenerReportesModeracion() {
  const reportes = await prisma.reporte.findMany({
    where: { estado: "PENDIENTE" },
    orderBy: { createdAt: "desc" },
  });

  const idsComentarios = reportes.filter((r) => r.tipo === "COMENTARIO").map((r) => r.referenciaId);
  const idsFuentes = reportes.filter((r) => r.tipo === "ENLACE_CAIDO").map((r) => r.referenciaId);

  const [comentarios, fuentes] = await Promise.all([
    prisma.comentario.findMany({
      where: { id: { in: idsComentarios } },
      include: {
        profile: { select: { nombre: true } },
        serie: { select: { titulo: true, slug: true } },
      },
    }),
    prisma.fuenteVideo.findMany({
      where: { id: { in: idsFuentes } },
      include: {
        episodio: {
          include: { temporada: { include: { serie: { select: { titulo: true, slug: true } } } } },
        },
      },
    }),
  ]);

  const comentariosPorId = new Map(comentarios.map((c) => [c.id, c]));
  const fuentesPorId = new Map(fuentes.map((f) => [f.id, f]));

  return reportes.map((r) => ({
    ...r,
    comentario: r.tipo === "COMENTARIO" ? (comentariosPorId.get(r.referenciaId) ?? null) : null,
    fuente: r.tipo === "ENLACE_CAIDO" ? (fuentesPorId.get(r.referenciaId) ?? null) : null,
  }));
}

export async function obtenerEpisodioConFuentesAdmin(id: string) {
  return prisma.episodio.findUnique({
    where: { id },
    include: {
      fuentes: { orderBy: { createdAt: "asc" } },
      temporada: { include: { serie: { select: { id: true, titulo: true, slug: true } } } },
    },
  });
}
