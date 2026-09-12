"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/cuenta/lista", label: "Mi lista" },
  { href: "/cuenta/historial", label: "Historial" },
  { href: "/cuenta/configuracion", label: "Configuración" },
] as const;

export function SubnavCuenta() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 border-b border-border">
      {LINKS.map((link) => {
        const activo = pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "-mb-px border-b-2 px-3 py-2 text-sm font-medium transition-colors",
              activo
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
