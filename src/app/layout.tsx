import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { SkipLink } from "@/components/shared/skip-link";
import { siteConfig } from "@/lib/config";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.dominio),
  title: {
    default: siteConfig.nombre,
    template: `%s | ${siteConfig.nombre}`,
  },
  description: siteConfig.descripcion,
  icons: {
    icon: [
      { url: "/icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    type: "website",
    locale: siteConfig.idioma,
    siteName: siteConfig.nombre,
    title: siteConfig.nombre,
    description: siteConfig.descripcion,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="es"
      // Dark mode primero (ver DISEÑO), pero el tema real lo maneja
      // next-themes (clase "dark" agregada por su script inline antes de
      // hidratar) — por eso suppressHydrationWarning acá.
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {/* Las secciones con <Revelar> arrancan en opacity:0 y las muestra un
            IntersectionObserver. Sin JS eso dejaría media home invisible, así
            que acá se anula la animación por completo. Va como HTML crudo y no
            como <style> JSX porque React 19 trata a <style> como una hoja de
            estilos "a cargar" y suspende hasta que resuelva. */}
        <noscript
          dangerouslySetInnerHTML={{
            __html: "<style>[data-revelar]{opacity:1!important;transform:none!important}</style>",
          }}
        />
        <SkipLink />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
