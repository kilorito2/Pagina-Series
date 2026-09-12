import "server-only";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { COOKIE_PERFIL_ACTIVO } from "@/lib/constantes";

/** Id del perfil activo guardado en la cookie, sin validar contra la DB. */
export async function obtenerIdPerfilActivo(): Promise<string | null> {
  const store = await cookies();
  return store.get(COOKIE_PERFIL_ACTIVO)?.value ?? null;
}

/**
 * Perfil activo ya validado: confirma que exista y sea del usuario logueado.
 * Devuelve `null` si no hay cookie, o si el perfil no le pertenece
 * (por ejemplo, cookie vieja de otra cuenta en el mismo navegador).
 */
export async function obtenerPerfilActivo(userId: string) {
  const perfilId = await obtenerIdPerfilActivo();
  if (!perfilId) return null;

  return prisma.profile.findFirst({
    where: { id: perfilId, userId },
  });
}

export async function fijarPerfilActivo(perfilId: string) {
  const store = await cookies();
  store.set(COOKIE_PERFIL_ACTIVO, perfilId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 90, // 90 días
  });
}

export async function limpiarPerfilActivo() {
  const store = await cookies();
  store.delete(COOKIE_PERFIL_ACTIVO);
}
