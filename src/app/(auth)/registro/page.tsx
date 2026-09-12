import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RegistroForm } from "./registro-form";

export const metadata: Metadata = { title: "Creá tu cuenta" };

export default async function RegistroPage() {
  const session = await auth();
  if (session?.user) redirect("/perfiles");

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Creá tu cuenta</CardTitle>
        <CardDescription>Después vas a poder armar hasta 5 perfiles.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <RegistroForm />
        <p className="text-center text-sm text-muted-foreground">
          ¿Ya tenés cuenta?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Iniciá sesión
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
