import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormularioPerfil } from "../../formulario-perfil";

export const metadata: Metadata = { title: "Editar perfil" };

export default async function EditarPerfilPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/perfiles");

  const { id } = await params;
  const perfil = await prisma.profile.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!perfil) notFound();

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-16">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-xl">Editar perfil</CardTitle>
        </CardHeader>
        <CardContent>
          <FormularioPerfil perfil={perfil} />
        </CardContent>
      </Card>
    </div>
  );
}
