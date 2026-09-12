"use client";

import type { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";

/**
 * Providers de cliente para toda la app. Server Components por defecto:
 * este es de los pocos archivos que necesitan "use client" (contexto de
 * sesión, tema, tooltips, toasts), así que lo aislamos acá para que
 * app/layout.tsx pueda seguir siendo un Server Component.
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem storageKey="animeverse-tema">
      <SessionProvider>
        <TooltipProvider delay={200}>
          {children}
          <Toaster />
        </TooltipProvider>
      </SessionProvider>
    </ThemeProvider>
  );
}
