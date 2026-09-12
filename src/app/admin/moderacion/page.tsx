import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";
import { obtenerReportesModeracion } from "@/lib/queries/admin";
import { ColaModeracion } from "./cola-moderacion";

export const metadata: Metadata = { title: "Moderación" };

export default async function ModeracionPage() {
  const reportes = await obtenerReportesModeracion();

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold sm:text-2xl">Moderación</h1>

      {reportes.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center text-muted-foreground">
          <ShieldCheck className="size-10" />
          <p>No hay reportes pendientes.</p>
        </div>
      ) : (
        <ColaModeracion reportes={reportes} />
      )}
    </div>
  );
}
