import { z } from "zod";
import { AVATARES_DISPONIBLES } from "@/lib/avatares";

export const perfilSchema = z.object({
  nombre: z
    .string()
    .min(1, "Ponele un nombre")
    .max(20, "Máximo 20 caracteres"),
  avatar: z.enum(AVATARES_DISPONIBLES as [string, ...string[]], {
    message: "Elegí un avatar de la galería",
  }),
  idiomaPreferido: z.enum(["SUB", "DUB"]).default("SUB"),
  calidadPorDefecto: z.enum(["P480", "P720", "P1080"]).default("P1080"),
  autoplay: z.boolean().default(true),
  esInfantil: z.boolean().default(false),
  tema: z.enum(["CLARO", "OSCURO", "SISTEMA"]).default("SISTEMA"),
  notificacionesActivas: z.boolean().default(true),
});
export type PerfilInput = z.infer<typeof perfilSchema>;
