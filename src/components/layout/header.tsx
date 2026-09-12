import { auth } from "@/lib/auth";
import { obtenerPerfilActivo } from "@/lib/perfil-activo";
import { obtenerTendencias } from "@/lib/queries/home";
import { Logo } from "@/components/shared/logo";
import { Buscador } from "@/components/layout/buscador";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { HeaderShell } from "@/components/layout/header-shell";
import { NavLinks } from "@/components/layout/nav-links";
import { UserMenu, BotonIniciarSesion } from "@/components/layout/user-menu";

export async function Header() {
  const session = await auth();
  const perfilActivo = session?.user ? await obtenerPerfilActivo(session.user.id) : null;
  const esAdmin = session?.user?.role === "ADMIN" || session?.user?.role === "MOD";
  // Ya cacheada por unstable_cache (lib/queries/home.ts); reusarla acá evita
  // otra query solo para las "Populares" del buscador vacío.
  const populares = (await obtenerTendencias()).slice(0, 5);

  return (
    <HeaderShell>
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4 sm:gap-4 sm:px-6">
        <Logo className="shrink-0 text-base sm:text-xl" />

        <NavLinks />

        <Buscador className="ml-auto max-w-[10rem] sm:max-w-xs md:max-w-sm" populares={populares} />

        <div className="flex shrink-0 items-center gap-1">
          <ThemeToggle />
          {session?.user ? (
            <UserMenu
              perfilActivo={
                perfilActivo ? { nombre: perfilActivo.nombre, avatar: perfilActivo.avatar } : null
              }
              esAdmin={esAdmin}
            />
          ) : (
            <BotonIniciarSesion />
          )}
        </div>
      </div>
    </HeaderShell>
  );
}
