import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Layers } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { obtenerSerieParaEditar } from "@/lib/queries/admin";
import { Button } from "@/components/ui/button";
import { FormularioSerie } from "../../formulario-serie";

export const metadata: Metadata = { title: "Editar serie" };

export default async function EditarSeriePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [serie, generos] = await Promise.all([
    obtenerSerieParaEditar(id),
    prisma.genero.findMany({ orderBy: { nombre: "asc" } }),
  ]);
  if (!serie) notFound();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-xl font-semibold sm:text-2xl">Editar: {serie.titulo}</h1>
        <Button variant="outline" render={<Link href={`/admin/series/${serie.id}/temporadas`} />}>
          <Layers className="size-4" />
          Temporadas y episodios
        </Button>
      </div>
      <FormularioSerie
        serie={serie}
        generosDisponibles={generos}
        generoIdsIniciales={serie.generos.map((g) => g.generoId)}
      />
    </div>
  );
}
