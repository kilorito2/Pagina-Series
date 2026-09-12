import "server-only";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

/** Exige rol ADMIN o MOD para una ruta de API. Devuelve la sesión o una
 * respuesta de error lista para retornar tal cual. */
export async function exigirAdmin() {
  const session = await auth();
  const rol = session?.user?.role;
  if (!session?.user || (rol !== "ADMIN" && rol !== "MOD")) {
    return { error: NextResponse.json({ error: "No autorizado" }, { status: 403 }) };
  }
  return { session };
}

/** Solo ADMIN (no MOD) — para acciones sensibles como cambiar roles. */
export async function exigirAdminEstricto() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: NextResponse.json({ error: "No autorizado" }, { status: 403 }) };
  }
  return { session };
}
