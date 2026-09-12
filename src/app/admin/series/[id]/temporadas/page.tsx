import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { obtenerSerieConTemporadas } from "@/lib/queries/admin";
import { GestorTemporadas } from "./gestor-temporadas";

export const metadata: Metadata = { title: "Temporadas y episodios" };

export default async function TemporadasPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const serie = await obtenerSerieConTemporadas(id);
  if (!serie) notFound();

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold sm:text-2xl">{serie.titulo} — Temporadas y episodios</h1>
      <GestorTemporadas serieId={serie.id} temporadas={serie.temporadas} />
    </div>
  );
}
