import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { Importador } from "./importador";

export const metadata: Metadata = { title: "Importador" };

export default async function ImportadorPage() {
  const generos = await prisma.genero.findMany({ orderBy: { nombre: "asc" } });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold sm:text-2xl">Importador</h1>
        <p className="text-sm text-muted-foreground">
          Buscá una serie en Jikan (MyAnimeList) y autocompletá sinopsis, poster, géneros y año con
          un click. Revisá los datos antes de guardar.
        </p>
      </div>
      <Importador generosDisponibles={generos} />
    </div>
  );
}
