import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { obtenerPerfilActivo } from "@/lib/perfil-activo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FormularioPerfil } from "@/app/perfiles/formulario-perfil";
import { FormularioCambiarPassword } from "./formulario-cambiar-password";
import { BotonCerrarSesiones } from "./boton-cerrar-sesiones";

export const metadata: Metadata = { title: "Configuración" };

export default async function ConfiguracionPage() {
  const session = await auth();
  if (!session?.user) return null;

  const [perfil, usuario] = await Promise.all([
    obtenerPerfilActivo(session.user.id),
    prisma.user.findUnique({ where: { id: session.user.id }, select: { passwordHash: true } }),
  ]);
  if (!perfil) return null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Preferencias del perfil</CardTitle>
          <CardDescription>Se aplican solo a &ldquo;{perfil.nombre}&rdquo;.</CardDescription>
        </CardHeader>
        <CardContent>
          <FormularioPerfil perfil={perfil} redirigirA="/cuenta/configuracion" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Contraseña</CardTitle>
          <CardDescription>Válido para toda la cuenta, no solo este perfil.</CardDescription>
        </CardHeader>
        <CardContent>
          <FormularioCambiarPassword tieneContraseña={!!usuario?.passwordHash} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Sesiones</CardTitle>
          <CardDescription>
            Cierra la sesión en este y todos los demás dispositivos donde iniciaste sesión.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BotonCerrarSesiones />
        </CardContent>
      </Card>
    </div>
  );
}
