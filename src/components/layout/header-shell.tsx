"use client";

import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Cáscara del header. En tema oscuro, arriba del todo es transparente (deja
 * pasar el banner del hero, que sube por debajo con -mt-14) y apenas hay
 * scroll se vuelve sólido con blur y borde.
 *
 * En tema claro va siempre sólido: el texto del header es oscuro y el hero
 * lleva un scrim negro por debajo, así que transparente no se leería.
 *
 * Existe aparte de <Header> porque ese es un Server Component: necesita
 * `auth()` y no puede tener estado ni listeners.
 */
export function HeaderShell({ children }: { children: ReactNode }) {
  const [scrolleado, setScrolleado] = useState(false);

  useEffect(() => {
    const alScrollear = () => setScrolleado(window.scrollY > 8);
    alScrollear(); // el navegador puede restaurar el scroll al volver atrás
    window.addEventListener("scroll", alScrollear, { passive: true });
    return () => window.removeEventListener("scroll", alScrollear);
  }, []);

  return (
    <header
      data-scrolleado={scrolleado ? "true" : "false"}
      className={cn(
        "sticky top-0 z-40 border-b transition-colors duration-300 ease-out",
        "border-border/60 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/65",
        // dark: sólo en oscuro se permite el header transparente arriba.
        !scrolleado && "dark:border-transparent dark:bg-transparent dark:backdrop-blur-none dark:supports-[backdrop-filter]:bg-transparent"
      )}
    >
      {children}
    </header>
  );
}
