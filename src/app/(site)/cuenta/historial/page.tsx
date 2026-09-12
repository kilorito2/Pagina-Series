import type { Metadata } from "next";
import { History } from "lucide-react";
import { auth } from "@/lib/auth";
import { obtenerPerfilActivo } from "@/lib/perfil-activo";
import { obtenerHistorial } from "@/lib/queries/historial";
import { FilaHistorial } from "./fila-historial";
import { BotonBorrarTodo } from "./boton-borrar-todo";
import { PaginacionSimple } from "@/components/shared/paginacion-simple";

export const metadata: Metadata = { title: "Historial" };

export default async function HistorialPage({
  searchParams,
}: {
  searchParams: Promise<{ pagina?: string }>;
}) {
  const session = await auth();
  if (!session?.user) return null;

  const perfil = await obtenerPerfilActivo(session.user.id);
  if (!perfil) return null;

  const { pagina: paginaParam } = await searchParams;
  const pagina = Math.max(1, Number(paginaParam) || 1);
  const { items, totalPaginas } = await obtenerHistorial(perfil.id, pagina);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Episodios vistos, más reciente primero.</p>
        {items.length > 0 && <BotonBorrarTodo />}
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center text-muted-foreground">
          <History className="size-10" />
          <p>Todavía no viste ningún episodio.</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {items.map((item) => (
            <FilaHistorial key={item.id} item={item} />
          ))}
        </div>
      )}

      <PaginacionSimple paginaActual={pagina} totalPaginas={totalPaginas} base="/cuenta/historial" />
    </div>
  );
}
