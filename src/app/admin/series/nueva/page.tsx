import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { FormularioSerie } from "../formulario-serie";

export const metadata: Metadata = { title: "Nueva serie" };

export default async function NuevaSeriePage() {
  const generos = await prisma.genero.findMany({ orderBy: { nombre: "asc" } });

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold sm:text-2xl">Nueva serie</h1>
      <FormularioSerie generosDisponibles={generos} />
    </div>
  );
}
