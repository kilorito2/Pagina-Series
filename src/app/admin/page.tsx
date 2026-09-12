import type { Metadata } from "next";
import Link from "next/link";
import { Clapperboard, Film, Users, Eye, MessageSquare, LinkIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { obtenerResumenDashboard } from "@/lib/queries/admin";

export const metadata: Metadata = { title: "Dashboard" };

export default async function AdminDashboardPage() {
  const resumen = await obtenerResumenDashboard();

  const tarjetas = [
    { label: "Series", valor: resumen.totalSeries, Icon: Clapperboard },
    { label: "Episodios", valor: resumen.totalEpisodios, Icon: Film },
    { label: "Usuarios", valor: resumen.totalUsuarios, Icon: Users },
    { label: "Vistas hoy", valor: resumen.vistasHoy, Icon: Eye },
    { label: "Vistas esta semana", valor: resumen.vistasSemana, Icon: Eye },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold sm:text-2xl">Dashboard</h1>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {tarjetas.map((t) => (
          <Card key={t.label}>
            <CardContent className="flex items-center gap-3 pt-4">
              <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <t.Icon className="size-4" />
              </span>
              <div>
                <p className="text-lg font-semibold leading-none">{t.valor}</p>
                <p className="text-xs text-muted-foreground">{t.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MessageSquare className="size-4" />
              Últimos comentarios
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {resumen.ultimosComentarios.length === 0 ? (
              <p className="text-sm text-muted-foreground">Todavía no hay comentarios.</p>
            ) : (
              resumen.ultimosComentarios.map((c) => (
                <div key={c.id} className="text-sm">
                  <p className="line-clamp-2">{c.contenido}</p>
                  <p className="text-xs text-muted-foreground">
                    {c.profile.nombre} en {c.serie?.titulo ?? "—"}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <LinkIcon className="size-4" />
              Reportes pendientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{resumen.reportesPendientes}</p>
            <Link href="/admin/moderacion" className="text-sm text-primary hover:underline">
              Ir a moderación →
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
