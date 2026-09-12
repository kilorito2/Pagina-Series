import type { Metadata } from "next";
import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { obtenerPerfilActivo } from "@/lib/perfil-activo";
import { SubnavCuenta } from "./subnav-cuenta";

// Datos personales del usuario: no debe indexarse.
export const metadata: Metadata = { robots: { index: false, follow: false } };

// El middleware ya exige sesión + perfil activo para /cuenta/**; esto es
// una segunda capa de defensa (y nos da los datos para redirigir con el
// mensaje justo si algo cambió entre medio, por ejemplo el perfil se borró).
export default async function CuentaLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/cuenta");

  const perfil = await obtenerPerfilActivo(session.user.id);
  if (!perfil) redirect("/perfiles");

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 text-xl font-semibold sm:text-2xl">Mi cuenta</h1>
      <SubnavCuenta />
      <div className="mt-6">{children}</div>
    </div>
  );
}
