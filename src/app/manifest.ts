import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/config";

// Íconos reales en /public (icon-192.png, icon-512.png), generados a
// partir del mismo mark de marca. Son "any" (fondo redondeado incluido en
// la imagen), no "maskable" — un maskable de verdad necesita una versión
// full-bleed sin el redondeo propio, para que cada OS aplique su máscara.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.nombre,
    short_name: siteConfig.nombre,
    description: siteConfig.descripcion,
    start_url: "/",
    display: "standalone",
    background_color: "#080d18",
    theme_color: siteConfig.colorPrincipal,
    lang: siteConfig.idioma,
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
  };
}
