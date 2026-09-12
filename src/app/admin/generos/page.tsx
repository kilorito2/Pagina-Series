import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { TablaGeneros } from "./tabla-generos";

export const metadata: Metadata = { title: "Géneros" };

export default async function GenerosPage() {
  const generos = await prisma.genero.findMany({
    orderBy: { nombre: "asc" },
    include: { _count: { select: { series: true } } },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold sm:text-2xl">Géneros</h1>
      <TablaGeneros generos={generos} />
    </div>
  );
}
