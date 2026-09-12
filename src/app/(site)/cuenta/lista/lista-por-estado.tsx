"use client";

import type { EstadoLista, TipoSerie } from "@prisma/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TarjetaListaItem } from "./tarjeta-lista-item";

const TABS: { value: EstadoLista; label: string }[] = [
  { value: "VIENDO", label: "Viendo" },
  { value: "PENDIENTE", label: "Pendiente" },
  { value: "COMPLETADO", label: "Completado" },
  { value: "FAVORITO", label: "Favoritos" },
  { value: "ABANDONADO", label: "Abandonado" },
];

export type ItemMiLista = {
  id: string;
  estado: EstadoLista;
  serie: {
    id: string;
    slug: string;
    titulo: string;
    poster: string;
    anio: number;
    ratingPromedio: number;
    tipo: TipoSerie;
  };
};

export function ListaPorEstado({ items }: { items: ItemMiLista[] }) {
  return (
    <Tabs defaultValue="VIENDO">
      <TabsList>
        {TABS.map((tab) => {
          const cantidad = items.filter((i) => i.estado === tab.value).length;
          return (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label} ({cantidad})
            </TabsTrigger>
          );
        })}
      </TabsList>

      {TABS.map((tab) => {
        const filtrados = items.filter((i) => i.estado === tab.value);
        return (
          <TabsContent key={tab.value} value={tab.value} className="pt-4">
            {filtrados.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">
                Todavía no tenés series acá.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                {filtrados.map((item) => (
                  <TarjetaListaItem key={item.id} item={item} />
                ))}
              </div>
            )}
          </TabsContent>
        );
      })}
    </Tabs>
  );
}
