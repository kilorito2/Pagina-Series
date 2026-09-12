import { z } from "zod";

export const comentarioSchema = z
  .object({
    contenido: z.string().min(1, "Escribí algo").max(1000, "Máximo 1000 caracteres"),
    spoiler: z.boolean().default(false),
    serieId: z.string().optional(),
    episodioId: z.string().optional(),
    parentId: z.string().optional(),
  })
  .refine((d) => !!d.serieId || !!d.episodioId, {
    message: "Falta serieId o episodioId",
    path: ["serieId"],
  });
export type ComentarioInput = z.infer<typeof comentarioSchema>;

export const reportarComentarioSchema = z.object({
  motivo: z.string().max(300).optional(),
});
