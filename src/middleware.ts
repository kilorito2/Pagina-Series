import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth.config";
import { COOKIE_PERFIL_ACTIVO } from "@/lib/constantes";

// Instancia "edge-safe" de Auth.js: solo lee/firma el JWT de la cookie de
// sesión, no toca Prisma. La instancia completa (con providers y adapter)
// vive en lib/auth.ts y solo se usa en Route Handlers / Server Components.
const { auth } = NextAuth(authConfig);

const RUTAS_ADMIN = ["/admin"];
const RUTAS_CON_SESION = ["/perfiles", "/ver", "/cuenta", "/notificaciones"];
const RUTAS_CON_PERFIL_ACTIVO = ["/ver", "/cuenta"];
const RUTAS_SOLO_INVITADO = ["/login", "/registro"];

function coincideRuta(pathname: string, prefijos: string[]) {
  return prefijos.some((prefijo) => pathname === prefijo || pathname.startsWith(`${prefijo}/`));
}

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const estaLogueado = !!req.auth?.user;
  const rol = req.auth?.user?.role;

  if (coincideRuta(pathname, RUTAS_ADMIN)) {
    if (!estaLogueado) {
      const loginUrl = new URL("/login", req.nextUrl);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (rol !== "ADMIN" && rol !== "MOD") {
      return NextResponse.redirect(new URL("/", req.nextUrl));
    }
    return NextResponse.next();
  }

  if (coincideRuta(pathname, RUTAS_CON_SESION)) {
    if (!estaLogueado) {
      const loginUrl = new URL("/login", req.nextUrl);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (coincideRuta(pathname, RUTAS_CON_PERFIL_ACTIVO)) {
      const perfilActivo = req.cookies.get(COOKIE_PERFIL_ACTIVO)?.value;
      if (!perfilActivo) {
        return NextResponse.redirect(new URL("/perfiles", req.nextUrl));
      }
    }

    return NextResponse.next();
  }

  // Si ya está logueado no tiene sentido mostrarle login/registro de nuevo.
  if (estaLogueado && coincideRuta(pathname, RUTAS_SOLO_INVITADO)) {
    return NextResponse.redirect(new URL("/perfiles", req.nextUrl));
  }

  return NextResponse.next();
});

// Sólo las rutas que este middleware realmente custodia. Antes el matcher
// era un negative lookahead que lo hacía correr en TODAS las páginas, y eso
// rompía la navegación del cliente: en las peticiones RSC (las de `?_rsc=`)
// que atraviesan auth(), el router se queda colgado y nunca commitea. Se veía
// en el catálogo — filtrar por género andaba la primera vez y después no
// pasaba nada, con la respuesta RSC llegando 200 igual. Listar las rutas hace
// lo mismo en menos lugares y encima evita correr auth() en cada request.
export const config = {
  matcher: [
    "/admin/:path*",
    "/perfiles/:path*",
    "/ver/:path*",
    "/cuenta/:path*",
    "/notificaciones/:path*",
    "/login",
    "/registro",
  ],
};
