import { z } from "zod";

export const busquedaSchema = z.object({
  q: z.string().trim().min(1).max(100),
});
export type BusquedaInput = z.infer<typeof busquedaSchema>;
