import type { Metadata } from "next";
import { Input } from "@/components/ui/input";
import { obtenerUsuariosAdmin } from "@/lib/queries/admin";
import { auth } from "@/lib/auth";
import { TablaUsuarios } from "./tabla-usuarios";
import { PaginacionSimple } from "@/components/shared/paginacion-simple";

export const metadata: Metadata = { title: "Usuarios" };

export default async function UsuariosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; pagina?: string }>;
}) {
  const { q, pagina: paginaParam } = await searchParams;
  const pagina = Math.max(1, Number(paginaParam) || 1);
  const [{ usuarios, total, totalPaginas }, session] = await Promise.all([
    obtenerUsuariosAdmin({ q, pagina }),
    auth(),
  ]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold sm:text-2xl">Usuarios</h1>
        <p className="text-sm text-muted-foreground">{total} en total</p>
      </div>

      <form className="max-w-sm">
        <Input type="search" name="q" defaultValue={q} placeholder="Buscar por email..." />
      </form>

      <TablaUsuarios usuarios={usuarios} usuarioActualId={session?.user?.id} />

      <PaginacionSimple paginaActual={pagina} totalPaginas={totalPaginas} base="/admin/usuarios" searchParams={{ q }} />
    </div>
  );
}
