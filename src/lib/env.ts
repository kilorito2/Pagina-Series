import { z } from "zod";

/**
 * Valida las variables de entorno al arrancar la app. Si falta algo,
 * la app no debe levantar en silencio con `undefined` sueltos por el código.
 */
const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  // Conexión directa (sin pooler) para Prisma Migrate. En Supabase/Neon con
  // pgbouncer es distinta de DATABASE_URL; en un Postgres simple, la misma.
  DIRECT_URL: z.string().url(),

  AUTH_SECRET: z.string().min(32, "AUTH_SECRET debe tener al menos 32 caracteres"),
  NEXTAUTH_URL: z.string().url().optional(),

  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),

  // Envío de emails (verificación / recuperación de contraseña). Si no está
  // seteada, lib/email.ts loguea el contenido en consola en vez de enviar.
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().optional(),

  // Almacenamiento de imágenes (S3 compatible / Cloudflare R2)
  R2_ACCOUNT_ID: z.string().optional(),
  R2_ACCESS_KEY_ID: z.string().optional(),
  R2_SECRET_ACCESS_KEY: z.string().optional(),
  R2_BUCKET_NAME: z.string().optional(),
  R2_PUBLIC_URL: z.string().url().optional(),

  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
  NEXT_PUBLIC_ORIGEN_VIDEO: z.enum(["EMBEDS", "HLS"]).optional(),
});

export type Env = z.infer<typeof envSchema>;

function validarEnv(): Env {
  const resultado = envSchema.safeParse(process.env);

  if (!resultado.success) {
    console.error(
      "❌ Variables de entorno inválidas o faltantes:",
      resultado.error.flatten().fieldErrors
    );
    throw new Error("Configuración de entorno inválida. Revisá tu archivo .env");
  }

  return resultado.data;
}

// Solo se valida en el servidor: en el cliente `process.env` no trae las
// variables privadas y no queremos que esto explote en el bundle del browser.
export const env = typeof window === "undefined" ? validarEnv() : (process.env as unknown as Env);
