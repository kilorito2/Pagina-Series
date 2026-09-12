import { z } from "zod";

export const miListaSchema = z.object({
  serieId: z.string().min(1),
  estado: z.enum(["VIENDO", "COMPLETADO", "PENDIENTE", "ABANDONADO", "FAVORITO"]),
});
export type MiListaInput = z.infer<typeof miListaSchema>;
