"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import type { Profile } from "@prisma/client";
import { Plus, Pencil, Baby, Check, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function SelectorPerfiles({
  perfiles,
  maxPerfiles,
}: {
  perfiles: Profile[];
  maxPerfiles: number;
}) {
  const router = useRouter();
  const [modoEdicion, setModoEdicion] = useState(false);
  const [activando, startTransition] = useTransition();
  const [perfilEnCurso, setPerfilEnCurso] = useState<string | null>(null);

  function elegirPerfil(perfil: Profile) {
    if (modoEdicion) return;
    setPerfilEnCurso(perfil.id);
    startTransition(async () => {
      const respuesta = await fetch(`/api/perfiles/${perfil.id}/activar`, { method: "POST" });
      if (respuesta.ok) {
        router.push("/");
        router.refresh();
      } else {
        setPerfilEnCurso(null);
      }
    });
  }

  return (
    <div className="flex flex-col items-center gap-10">
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4">
        {perfiles.map((perfil) => (
          <div key={perfil.id} className="group flex flex-col items-center gap-2">
            {modoEdicion ? (
              <Link
                href={`/perfiles/${perfil.id}/editar`}
                className="relative size-24 overflow-hidden rounded-xl ring-2 ring-transparent transition group-hover:ring-primary sm:size-32"
              >
                <Image src={perfil.avatar} alt="" fill sizes="128px" className="object-cover" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition group-hover:opacity-100">
                  <Pencil className="size-6 text-white" />
                </div>
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => elegirPerfil(perfil)}
                disabled={activando}
                className={cn(
                  "relative size-24 overflow-hidden rounded-xl ring-2 ring-transparent transition group-hover:ring-primary disabled:opacity-50 sm:size-32",
                  perfilEnCurso === perfil.id && "ring-primary"
                )}
              >
                <Image src={perfil.avatar} alt="" fill sizes="128px" className="object-cover" />
                {perfilEnCurso === perfil.id && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                    <Check className="size-6 text-brand-accent" />
                  </div>
                )}
              </button>
            )}
            <span className="flex items-center gap-1 text-sm text-muted-foreground transition group-hover:text-foreground">
              {perfil.nombre}
              {perfil.esInfantil && <Baby className="size-3.5" />}
            </span>
          </div>
        ))}

        {!modoEdicion && perfiles.length < maxPerfiles && (
          <Link
            href="/perfiles/nuevo"
            className="flex flex-col items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <span className="flex size-24 items-center justify-center rounded-xl border-2 border-dashed border-border transition hover:border-primary sm:size-32">
              <Plus className="size-8" />
            </span>
            <span className="text-sm">Agregar perfil</span>
          </Link>
        )}
      </div>

      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => setModoEdicion((v) => !v)}>
          {modoEdicion ? "Listo" : "Administrar perfiles"}
        </Button>
        <Button variant="ghost" onClick={() => signOut({ redirectTo: "/login" })}>
          <LogOut className="size-4" />
          Cerrar sesión
        </Button>
      </div>
    </div>
  );
}
