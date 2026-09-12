import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { obtenerPerfilActivo } from "@/lib/perfil-activo";
import { obtenerMiLista } from "@/lib/queries/mi-lista";
import { ListaPorEstado } from "./lista-por-estado";

export const metadata: Metadata = { title: "Mi lista" };

export default async function MiListaPage() {
  const session = await auth();
  if (!session?.user) return null; // el layout de /cuenta ya redirige

  const perfil = await obtenerPerfilActivo(session.user.id);
  if (!perfil) return null;

  const items = await obtenerMiLista(perfil.id);

  return <ListaPorEstado items={items} />;
}
