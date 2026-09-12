import type { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RestablecerForm } from "./restablecer-form";

export const metadata: Metadata = { title: "Elegir nueva contraseña" };

export default async function RestablecerPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Elegí una nueva contraseña</CardTitle>
        <CardDescription>Mínimo 8 caracteres, con una mayúscula y un número.</CardDescription>
      </CardHeader>
      <CardContent>
        <RestablecerForm token={token} />
      </CardContent>
    </Card>
  );
}
