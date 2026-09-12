import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "Mínimo 8 caracteres")
  .regex(/[A-Z]/, "Debe tener al menos una mayúscula")
  .regex(/[0-9]/, "Debe tener al menos un número");

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Ingresá tu contraseña"),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const registroSchema = z
  .object({
    email: z.string().email("Email inválido"),
    password: passwordSchema,
    confirmarPassword: z.string(),
  })
  .refine((datos) => datos.password === datos.confirmarPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmarPassword"],
  });
export type RegistroInput = z.infer<typeof registroSchema>;

export const emailSchema = z.object({
  email: z.string().email("Email inválido"),
});
export type EmailInput = z.infer<typeof emailSchema>;

export const recuperarSchema = emailSchema;
export type RecuperarInput = z.infer<typeof recuperarSchema>;

export const restablecerSchema = z
  .object({
    token: z.string().min(1),
    password: passwordSchema,
    confirmarPassword: z.string(),
  })
  .refine((datos) => datos.password === datos.confirmarPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmarPassword"],
  });
export type RestablecerInput = z.infer<typeof restablecerSchema>;
