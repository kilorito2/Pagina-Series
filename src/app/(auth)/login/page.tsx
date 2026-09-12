import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Iniciar sesión" };

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) redirect("/perfiles");

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Iniciá sesión</CardTitle>
        <CardDescription>Entrá para seguir viendo donde quedaste.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <LoginForm />
        <p className="text-center text-sm text-muted-foreground">
          ¿No tenés cuenta?{" "}
          <Link href="/registro" className="text-primary hover:underline">
            Registrate
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
