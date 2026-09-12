import { z } from "zod";

export const cambiarPasswordSchema = z
  .object({
    passwordActual: z.string().optional(),
    passwordNueva: z
      .string()
      .min(8, "Mínimo 8 caracteres")
      .regex(/[A-Z]/, "Debe tener al menos una mayúscula")
      .regex(/[0-9]/, "Debe tener al menos un número"),
    confirmarPassword: z.string(),
  })
  .refine((datos) => datos.passwordNueva === datos.confirmarPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmarPassword"],
  });
export type CambiarPasswordInput = z.infer<typeof cambiarPasswordSchema>;
