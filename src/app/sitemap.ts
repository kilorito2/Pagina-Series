import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/lib/config";

// Se recalcula como máximo cada hora; no hace falta más frecuencia para un
// sitemap (a diferencia de las queries de home, que sí revalidan por tag).
export const revalidate = 3600;

const RUTAS_ESTATICAS = ["", "/catalogo", "/calendario", "/buscar"] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const series = await prisma.serie.findMany({
    select: { slug: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
  });

  const estaticas: MetadataRoute.Sitemap = RUTAS_ESTATICAS.map((ruta) => ({
    url: `${siteConfig.dominio}${ruta}`,
    lastModified: new Date(),
    changeFrequency: ruta === "" ? "daily" : "weekly",
    priority: ruta === "" ? 1 : 0.7,
  }));

  const fichas: MetadataRoute.Sitemap = series.map((serie) => ({
    url: `${siteConfig.dominio}/serie/${serie.slug}`,
    lastModified: serie.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...estaticas, ...fichas];
}
