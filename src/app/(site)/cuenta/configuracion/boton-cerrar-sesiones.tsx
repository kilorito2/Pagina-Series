"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { toast } from "sonner";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BotonCerrarSesiones() {
  const [enviando, setEnviando] = useState(false);

  async function cerrarTodas() {
    setEnviando(true);
    const respuesta = await fetch("/api/auth/cerrar-sesiones", { method: "POST" });
    if (!respuesta.ok) {
      setEnviando(false);
      toast.error("No pudimos cerrar las sesiones.");
      return;
    }
    // Cierra también esta sesión: si no, este dispositivo sigue con acceso
    // hasta que se revalide (hasta 5 minutos).
    await signOut({ redirectTo: "/login" });
  }

  return (
    <Button type="button" variant="destructive" onClick={cerrarTodas} disabled={enviando}>
      <LogOut className="size-4" />
      Cerrar sesión en todos los dispositivos
    </Button>
  );
}
