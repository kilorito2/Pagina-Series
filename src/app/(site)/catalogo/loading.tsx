import { Skeleton } from "@/components/ui/skeleton";

export default function CargandoCatalogo() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <Skeleton className="mb-1 h-6 w-32" />
      <Skeleton className="mb-6 h-4 w-20" />
      <Skeleton className="mb-6 h-10 w-full" />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {Array.from({ length: 18 }).map((_, i) => (
          <Skeleton key={i} className="aspect-[2/3] w-full" />
        ))}
      </div>
    </div>
  );
}
