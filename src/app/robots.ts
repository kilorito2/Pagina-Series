import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/config";

// Rutas privadas o que redirigen para cualquier visitante sin sesión (un
// crawler nunca tiene una): no aportan nada indexadas y evitan gastar
// crawl budget en ellas.
const DISALLOW = [
  "/admin",
  "/api",
  "/cuenta",
  "/perfiles",
  "/ver",
  "/restablecer",
  "/verificar",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: DISALLOW,
    },
    sitemap: `${siteConfig.dominio}/sitemap.xml`,
  };
}
