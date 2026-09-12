/**
 * Configuración de marca del sitio.
 *
 * Estos valores vienen del bloque VARIABLES del prompt original.
 * Como no se completaron con datos reales, se usan valores de ejemplo
 * razonables — cambiá lo que necesites acá, es la única fuente de verdad.
 */
export const siteConfig = {
  nombre: "AnimeVerse",
  descripcion:
    "Catálogo de anime y series en streaming: mirá los últimos episodios, seguí tu progreso y armá tu lista.",
  dominio: process.env.NEXT_PUBLIC_SITE_URL ?? "https://animeverse.app",
  idioma: "es-419",
  // Paleta "Blue Cinema": ver la tabla de variables asumidas en el README.
  colorPrincipal: "#2563EB",
  colorSecundario: "#1D4ED8",
  colorAcento: "#38BDF8",
  /**
   * "EMBEDS": los episodios reproducen iframes de servidores externos.
   * "HLS": los episodios reproducen archivos .m3u8 propios vía HLS.js / Vidstack.
   * Se lee de FuenteVideo.url en ambos casos; esto solo cambia cómo el
   * reproductor interpreta esa URL.
   */
  origenVideo: (process.env.NEXT_PUBLIC_ORIGEN_VIDEO ?? "EMBEDS") as
    | "EMBEDS"
    | "HLS",
  maxPerfilesPorCuenta: 5,
} as const;

export type SiteConfig = typeof siteConfig;
