import { z } from "zod";

export const ordenCatalogoValores = ["recientes", "vistos", "puntuados", "az"] as const;
export type OrdenCatalogo = (typeof ordenCatalogoValores)[number];

// Cada filtro usa .catch() para degradar solo, sin tirar toda la página,
// si alguien pisa la URL a mano con un valor que no existe.
export const catalogoFiltrosSchema = z.object({
  genero: z.string().optional().catch(undefined), // slugs separados por coma: "accion,comedia"
  anio: z.coerce.number().int().optional().catch(undefined),
  estado: z.enum(["EMISION", "FINALIZADO", "PROXIMAMENTE"]).optional().catch(undefined),
  tipo: z.enum(["TV", "OVA", "PELICULA", "ESPECIAL", "ONA"]).optional().catch(undefined),
  clasificacion: z.enum(["G", "PG", "PG13", "R"]).optional().catch(undefined),
  idioma: z.enum(["SUB", "DUB"]).optional().catch(undefined),
  orden: z.enum(ordenCatalogoValores).catch("recientes"),
  pagina: z.coerce.number().int().min(1).catch(1),
});
export type CatalogoFiltros = z.infer<typeof catalogoFiltrosSchema>;
