"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/catalogo", label: "Catálogo" },
  { href: "/calendario", label: "Calendario" },
] as const;

/**
 * Nav de escritorio con indicador de sección activa. El pill se mueve entre
 * links (layoutId) en vez de desaparecer y aparecer: mostrar de dónde viene
 * la selección es exactamente para lo que sirve una transición compartida.
 */
export function NavLinks() {
  const pathname = usePathname();
  const reducirMovimiento = useReducedMotion();

  return (
    <nav className="hidden items-center gap-1 md:flex">
      {NAV_LINKS.map((link) => {
        const activo = pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={activo ? "page" : undefined}
            className={cn(
              "relative rounded-md px-3 py-1.5 text-sm transition-colors duration-200 ease-out",
              activo ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {activo && (
              <motion.span
                layoutId="nav-activo"
                aria-hidden
                transition={
                  reducirMovimiento
                    ? { duration: 0 }
                    : { type: "spring", duration: 0.4, bounce: 0.15 }
                }
                className="absolute inset-0 -z-10 rounded-md bg-accent"
              />
            )}
            <span className="relative">{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
