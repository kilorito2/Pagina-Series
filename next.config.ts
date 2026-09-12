import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // AVIF/WebP primero: Next elige el mejor que soporte el navegador y
    // cae a la extensión original si ninguno aplica.
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      // Posters/banners de placeholder que usa el seed.
      { protocol: "https", hostname: "picsum.photos" },
      // Galería de avatares predefinida de los perfiles.
      { protocol: "https", hostname: "api.dicebear.com" },
      // Almacenamiento real de imágenes (Cloudflare R2). Ajustar el host
      // cuando se configure el bucket de producción.
      { protocol: "https", hostname: "*.r2.dev" },
      { protocol: "https", hostname: "*.r2.cloudflarestorage.com" },
    ],
  },
};

export default nextConfig;
