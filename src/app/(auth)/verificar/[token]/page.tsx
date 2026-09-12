import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Verificar cuenta" };

export default async function VerificarPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const tokenAccion = await prisma.tokenAccion.findUnique({ where: { token } });
  const valido =
    !!tokenAccion &&
    tokenAccion.tipo === "VERIFICACION_EMAIL" &&
    !tokenAccion.usado &&
    tokenAccion.expira > new Date();

  if (valido && tokenAccion) {
    await prisma.$transaction([
      prisma.user.update({
        where: { id: tokenAccion.userId },
        data: { emailVerified: new Date() },
      }),
      prisma.tokenAccion.update({ where: { id: tokenAccion.id }, data: { usado: true } }),
    ]);
  }

  return (
    <Card>
      <CardHeader className="items-center text-center">
        {valido ? (
          <CheckCircle2 className="size-10 text-brand-accent" />
        ) : (
          <XCircle className="size-10 text-destructive" />
        )}
        <CardTitle className="text-xl">
          {valido ? "Cuenta confirmada" : "Este link no es válido"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-center">
        <p className="text-sm text-muted-foreground">
          {valido
            ? "Ya podés iniciar sesión con tu email y contraseña."
            : "El link venció o ya se usó. Iniciá sesión y pedí que te reenvíen la verificación."}
        </p>
        <Button render={<Link href="/login" />} className="w-full">
          Ir a iniciar sesión
        </Button>
      </CardContent>
    </Card>
  );
}
