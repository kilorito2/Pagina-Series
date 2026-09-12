import Link from "next/link";
import { siteConfig } from "@/lib/config";

const COLUMNAS = [
  {
    titulo: "Explorar",
    links: [
      { href: "/catalogo", label: "Catálogo" },
      { href: "/calendario", label: "Calendario de emisión" },
      { href: "/buscar", label: "Buscar" },
    ],
  },
  {
    titulo: "Cuenta",
    links: [
      { href: "/perfiles", label: "Perfiles" },
      { href: "/login", label: "Iniciar sesión" },
      { href: "/registro", label: "Crear cuenta" },
    ],
  },
] as const;

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border/60 bg-background">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:grid-cols-[1.5fr_1fr_1fr] sm:px-6">
        <div className="space-y-2">
          <Link href="/" className="text-lg font-bold tracking-tight transition-colors duration-200 ease-out hover:text-primary">
            {siteConfig.nombre}
          </Link>
          <p className="max-w-xs text-sm text-muted-foreground">{siteConfig.descripcion}</p>
        </div>
        {COLUMNAS.map((columna) => (
          <div key={columna.titulo}>
            <h3 className="mb-3 text-sm font-semibold">{columna.titulo}</h3>
            <ul className="space-y-2">
              {columna.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="link-subrayado text-sm text-muted-foreground transition-colors duration-200 ease-out hover:text-foreground">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border/60 px-4 py-4 text-center text-xs text-muted-foreground">
        <p>
          © {new Date().getFullYear()} {siteConfig.nombre}. Sitio de fans, sin fines de lucro.
        </p>
        <p>La responsabilidad sobre los derechos del contenido cargado es de quien administra la plataforma.</p>
      </div>
    </footer>
  );
}
