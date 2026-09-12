import Link from "next/link";
import { FileSearch } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function EpisodioNoEncontrado() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-24 text-center">
      <FileSearch className="size-10 text-muted-foreground" />
      <div className="space-y-1">
        <h1 className="text-xl font-semibold">Episodio no encontrado</h1>
        <p className="text-sm text-muted-foreground">
          Esa temporada o episodio no existe para esta serie.
        </p>
      </div>
      <Button render={<Link href="/catalogo" />}>Ir al catálogo</Button>
    </div>
  );
}
