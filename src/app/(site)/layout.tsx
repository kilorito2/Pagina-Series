import type { ReactNode } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { NavMobile } from "@/components/layout/nav-mobile";

/**
 * Layout de las páginas públicas del sitio (home, catálogo, ficha, buscador,
 * calendario...). Login/registro y el selector de perfiles tienen sus
 * propios layouts sin este header/footer.
 */
export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col pb-14 md:pb-0">
      <Header />
      <main id="main-content" tabIndex={-1} className="flex-1 outline-none">
        {children}
      </main>
      <Footer />
      <NavMobile />
    </div>
  );
}
