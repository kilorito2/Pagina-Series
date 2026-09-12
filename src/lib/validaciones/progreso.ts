import { z } from "zod";

export const progresoSchema = z.object({
  episodioId: z.string().min(1),
  segundoActual: z.number().int().min(0),
  duracionTotal: z.number().int().min(0),
  completado: z.boolean().optional(),
});
export type ProgresoInput = z.infer<typeof progresoSchema>;
