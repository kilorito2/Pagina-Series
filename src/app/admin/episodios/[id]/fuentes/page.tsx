import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { obtenerEpisodioConFuentesAdmin } from "@/lib/queries/admin";
import { GestorFuentes } from "./gestor-fuentes";

export const metadata: Metadata = { title: "Fuentes de video" };

export default async function FuentesEpisodioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const episodio = await obtenerEpisodioConFuentesAdmin(id);
  if (!episodio) notFound();

  const { serie } = episodio.temporada;

  return (
    <div className="space-y-4">
      <Link
        href={`/admin/series/${serie.id}/temporadas`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        Volver a temporadas
      </Link>
      <h1 className="text-xl font-semibold sm:text-2xl">
        {serie.titulo} — T{episodio.temporada.numero} E{episodio.numero}: fuentes de video
      </h1>
      <GestorFuentes episodioId={episodio.id} fuentes={episodio.fuentes} />
    </div>
  );
}
