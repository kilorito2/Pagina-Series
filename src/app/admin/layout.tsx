import type { Metadata } from "next";
import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { SidebarAdmin } from "@/components/admin/sidebar";

// Panel interno: no debe indexarse.
export const metadata: Metadata = { robots: { index: false, follow: false } };

// El middleware ya bloquea /admin/** a quien no sea ADMIN/MOD; esto es
// una segunda capa (y evita que un Server Component hijo asuma sesión sin
// chequearla).
export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  const rol = session?.user?.role;
  if (!session?.user || (rol !== "ADMIN" && rol !== "MOD")) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen">
      <SidebarAdmin />
      <main id="main-content" tabIndex={-1} className="min-w-0 flex-1 p-4 sm:p-6 outline-none">
        {children}
      </main>
    </div>
  );
}
