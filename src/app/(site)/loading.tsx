import { Skeleton } from "@/components/ui/skeleton";

/** Calca la forma real de la home (hero + filas de carrusel) para que no
 * haya salto de layout cuando llegan los datos. */
export default function CargandoHome() {
  return (
    <div className="space-y-12 pb-14">
      <Skeleton className="-mt-14 h-[62vh] min-h-[420px] w-full rounded-none sm:h-[74vh]" />

      <div className="space-y-10">
        {Array.from({ length: 4 }).map((_, fila) => (
          <div key={fila} className="mx-auto max-w-7xl space-y-3 px-4 sm:px-6">
            <Skeleton className="h-6 w-40" />
            <div className="flex gap-3 overflow-hidden">
              {Array.from({ length: 7 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[2/3] w-32 shrink-0 sm:w-40" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
