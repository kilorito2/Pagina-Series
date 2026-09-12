import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RecuperarForm } from "./recuperar-form";

export const metadata: Metadata = { title: "Recuperar contraseña" };

export default function RecuperarPage() {
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Recuperar contraseña</CardTitle>
        <CardDescription>Te mandamos un link para elegir una nueva.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <RecuperarForm />
        <p className="text-center text-sm text-muted-foreground">
          <Link href="/login" className="text-primary hover:underline">
            Volver a iniciar sesión
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
