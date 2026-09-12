"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { UserRound, Users, Shield, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type PerfilResumen = { nombre: string; avatar: string } | null;

export function UserMenu({
  perfilActivo,
  esAdmin,
}: {
  perfilActivo: PerfilResumen;
  esAdmin: boolean;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            aria-label="Menú de cuenta"
            className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <Avatar>
              {perfilActivo && <AvatarImage src={perfilActivo.avatar} alt="" />}
              <AvatarFallback>
                <UserRound className="size-4" />
              </AvatarFallback>
            </Avatar>
          </button>
        }
      />
      <DropdownMenuContent align="end" className="w-56">
        {perfilActivo && <DropdownMenuLabel>{perfilActivo.nombre}</DropdownMenuLabel>}
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link href="/perfiles" />}>
          <Users className="size-4" />
          Cambiar de perfil
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href="/cuenta" />}>
          <UserRound className="size-4" />
          Mi cuenta
        </DropdownMenuItem>
        {esAdmin && (
          <DropdownMenuItem render={<Link href="/admin" />}>
            <Shield className="size-4" />
            Panel de administración
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onClick={() => signOut({ redirectTo: "/login" })}
        >
          <LogOut className="size-4" />
          Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function BotonIniciarSesion() {
  return (
    <Button render={<Link href="/login" />} size="sm">
      Iniciar sesión
    </Button>
  );
}
