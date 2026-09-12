"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Clapperboard,
  Download,
  Tags,
  Users,
  ShieldAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/shared/logo";

const LINKS = [
  { href: "/admin", label: "Dashboard", Icon: LayoutDashboard, exacto: true },
  { href: "/admin/series", label: "Series", Icon: Clapperboard, exacto: false },
  { href: "/admin/importador", label: "Importador", Icon: Download, exacto: false },
  { href: "/admin/generos", label: "Géneros", Icon: Tags, exacto: false },
  { href: "/admin/usuarios", label: "Usuarios", Icon: Users, exacto: false },
  { href: "/admin/moderacion", label: "Moderación", Icon: ShieldAlert, exacto: false },
] as const;

export function SidebarAdmin() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-56 shrink-0 border-r border-border bg-sidebar text-sidebar-foreground md:block">
      <div className="p-4">
        <Logo />
        <p className="mt-0.5 text-xs text-muted-foreground">Panel de administración</p>
      </div>
      <nav className="space-y-0.5 px-2">
        {LINKS.map(({ href, label, Icon, exacto }) => {
          const activo = exacto ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
                activo
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon className="size-4" />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="p-2">
        <Link
          href="/"
          className="block rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-sidebar-accent/60"
        >
          ← Volver al sitio
        </Link>
      </div>
    </aside>
  );
}
