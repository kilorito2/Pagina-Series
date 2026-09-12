import { Skeleton } from "@/components/ui/skeleton";

export default function CargandoFicha() {
  return (
    <div>
      <Skeleton className="h-[40vh] min-h-[280px] w-full rounded-none sm:h-[50vh]" />

      <div className="mx-auto -mt-20 max-w-7xl px-4 sm:-mt-28 sm:px-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end">
          <Skeleton className="aspect-[2/3] w-28 shrink-0 rounded-lg ring-4 ring-background sm:w-48" />
          <div className="min-w-0 flex-1 space-y-3 pb-1">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-9 w-2/3" />
            <div className="flex gap-1.5">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
          </div>
        </div>

        <div className="mt-6 max-w-2xl space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>

        <div className="mt-5 flex gap-3">
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-9 w-32" />
        </div>

        <div className="mt-10 space-y-3 pb-10">
          <Skeleton className="h-6 w-28" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
