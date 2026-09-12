import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/lib/config";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormularioPerfil } from "../formulario-perfil";

export const metadata: Metadata = { title: "Nuevo perfil" };

export default async function NuevoPerfilPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/perfiles/nuevo");

  const cantidad = await prisma.profile.count({ where: { userId: session.user.id } });
  if (cantidad >= siteConfig.maxPerfilesPorCuenta) redirect("/perfiles");

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-16">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-xl">Nuevo perfil</CardTitle>
        </CardHeader>
        <CardContent>
          <FormularioPerfil />
        </CardContent>
      </Card>
    </div>
  );
}
