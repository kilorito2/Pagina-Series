"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { Home, LayoutGrid, Search, CalendarDays, User } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/", label: "Inicio", Icon: Home },
  { href: "/catalogo", label: "Catálogo", Icon: LayoutGrid },
  { href: "/buscar", label: "Buscar", Icon: Search },
  { href: "/calendario", label: "Calendario", Icon: CalendarDays },
  { href: "/perfiles", label: "Cuenta", Icon: User },
] as const;

export function NavMobile() {
  const pathname = usePathname();
  const reducirMovimiento = useReducedMotion();

  return (
    <nav
      aria-label="Navegación principal"
      className="fixed inset-x-0 bottom-0 z-40 flex h-14 items-center justify-around border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
    >
      {ITEMS.map(({ href, label, Icon }) => {
        const activo = href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={activo ? "page" : undefined}
            className={cn(
              "relative flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] transition-colors duration-200 ease-out",
              // active:scale-95 da el "acuse de recibo" del tap, que en mobile
              // es lo único que confirma que el toque entró.
              "active:scale-95",
              activo ? "text-primary" : "text-muted-foreground"
            )}
          >
            {activo && (
              <motion.span
                layoutId="nav-mobile-activo"
                aria-hidden
                transition={
                  reducirMovimiento
                    ? { duration: 0 }
                    : { type: "spring", duration: 0.35, bounce: 0.2 }
                }
                className="absolute top-0 h-0.5 w-8 rounded-full bg-primary"
              />
            )}
            <Icon className={cn("size-5 transition-transform duration-200 ease-out-fuerte", activo && "scale-110")} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
