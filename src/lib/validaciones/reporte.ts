import { z } from "zod";

export const reporteEnlaceSchema = z.object({
  fuenteVideoId: z.string().min(1),
  motivo: z.string().max(300).optional(),
});
export type ReporteEnlaceInput = z.infer<typeof reporteEnlaceSchema>;
