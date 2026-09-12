import { z } from "zod";

export const serieSchema = z.object({
  titulo: z.string().min(1, "Requerido").max(200),
  tituloAlternativo: z.string().max(200).optional().or(z.literal("")),
  tituloOriginal: z.string().max(200).optional().or(z.literal("")),
  slug: z
    .string()
    .min(1, "Requerido")
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Solo minúsculas, números y guiones"),
  sinopsis: z.string().min(1, "Requerido").max(3000),
  poster: z.string().min(1, "Requerido"),
  banner: z.string().optional().or(z.literal("")),
  anio: z.coerce.number().int().min(1900).max(2100),
  estado: z.enum(["EMISION", "FINALIZADO", "PROXIMAMENTE"]),
  tipo: z.enum(["TV", "OVA", "PELICULA", "ESPECIAL", "ONA"]),
  clasificacion: z.enum(["G", "PG", "PG13", "R"]),
  estudio: z.string().max(120).optional().or(z.literal("")),
  destacada: z.boolean().default(false),
  generoIds: z.array(z.string()).min(1, "Elegí al menos un género"),
});
export type SerieInput = z.infer<typeof serieSchema>;

export const temporadaSchema = z.object({
  numero: z.coerce.number().int().min(1),
  titulo: z.string().max(120).optional().or(z.literal("")),
  anio: z.coerce.number().int().min(1900).max(2100).optional(),
});
export type TemporadaInput = z.infer<typeof temporadaSchema>;

export const episodioSchema = z.object({
  numero: z.coerce.number().int().min(1),
  titulo: z.string().max(200).optional().or(z.literal("")),
  sinopsis: z.string().max(2000).optional().or(z.literal("")),
  duracionMin: z.coerce.number().int().min(0).optional(),
  thumbnail: z.string().optional().or(z.literal("")),
});
export type EpisodioInput = z.infer<typeof episodioSchema>;

export const episodiosMasivoSchema = z.object({
  desde: z.coerce.number().int().min(1),
  hasta: z.coerce.number().int().min(1),
  duracionMin: z.coerce.number().int().min(0).default(24),
});
export type EpisodiosMasivoInput = z.infer<typeof episodiosMasivoSchema>;

export const fuenteSchema = z.object({
  servidor: z.string().min(1, "Requerido").max(60),
  url: z.string().min(1, "Requerido"),
  calidad: z.enum(["P480", "P720", "P1080"]),
  idioma: z.enum(["SUB", "DUB"]),
  esActiva: z.boolean().default(true),
});
export type FuenteInput = z.infer<typeof fuenteSchema>;

export const generoSchema = z.object({
  nombre: z.string().min(1, "Requerido").max(60),
});
export type GeneroInput = z.infer<typeof generoSchema>;

export const usuarioAdminSchema = z.object({
  role: z.enum(["USER", "MOD", "ADMIN"]).optional(),
  baneado: z.boolean().optional(),
  motivoBaneo: z.string().max(300).optional().or(z.literal("")),
});
export type UsuarioAdminInput = z.infer<typeof usuarioAdminSchema>;
