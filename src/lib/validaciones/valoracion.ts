import { z } from "zod";

export const valoracionSchema = z.object({
  serieId: z.string().min(1),
  puntaje: z.number().int().min(1).max(10),
});
export type ValoracionInput = z.infer<typeof valoracionSchema>;
