import "server-only";
import { RateLimiterMemory } from "rate-limiter-flexible";

/**
 * Rate limiting en memoria por proceso. Suficiente para una sola instancia;
 * si el sitio corre en varias instancias/edge, cambiar `RateLimiterMemory`
 * por `RateLimiterRedis` (misma librería, misma API) apuntando a un Redis
 * compartido.
 */
const limitadores = new Map<string, RateLimiterMemory>();

function obtenerLimitador(nombre: string, puntos: number, duracionSeg: number) {
  const clave = `${nombre}:${puntos}:${duracionSeg}`;
  let limitador = limitadores.get(clave);
  if (!limitador) {
    limitador = new RateLimiterMemory({ points: puntos, duration: duracionSeg });
    limitadores.set(clave, limitador);
  }
  return limitador;
}

type OpcionesLimite = {
  /** Intentos permitidos dentro de la ventana. */
  puntos?: number;
  /** Duración de la ventana, en segundos. */
  duracionSeg?: number;
};

/**
 * Consume un "punto" del limitador `nombre` para la clave `identificador`
 * (típicamente IP, o IP+email). Devuelve `permitido: false` si se pasó
 * del límite.
 */
export async function verificarRateLimit(
  nombre: string,
  identificador: string,
  { puntos = 5, duracionSeg = 60 }: OpcionesLimite = {}
): Promise<{ permitido: boolean; segundosParaReintentar?: number }> {
  const limitador = obtenerLimitador(nombre, puntos, duracionSeg);
  try {
    await limitador.consume(identificador);
    return { permitido: true };
  } catch (rechazo) {
    const msBeforeNext =
      typeof rechazo === "object" && rechazo && "msBeforeNext" in rechazo
        ? Number((rechazo as { msBeforeNext: number }).msBeforeNext)
        : duracionSeg * 1000;
    return { permitido: false, segundosParaReintentar: Math.ceil(msBeforeNext / 1000) };
  }
}

/** Extrae la IP del cliente de los headers habituales detrás de un proxy. */
export function obtenerIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return request.headers.get("x-real-ip") ?? "desconocida";
}
