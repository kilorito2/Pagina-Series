import type { Clasificacion, EstadoSerie, TipoSerie, IdiomaAudio } from "@prisma/client";

export const ETIQUETA_ESTADO: Record<EstadoSerie, string> = {
  EMISION: "En emisión",
  FINALIZADO: "Finalizado",
  PROXIMAMENTE: "Próximamente",
};

export const ETIQUETA_TIPO: Record<TipoSerie, string> = {
  TV: "TV",
  OVA: "OVA",
  PELICULA: "Película",
  ESPECIAL: "Especial",
  ONA: "ONA",
};

export const ETIQUETA_CLASIFICACION: Record<Clasificacion, string> = {
  G: "G",
  PG: "PG",
  PG13: "PG-13",
  R: "R",
};

export const ETIQUETA_IDIOMA: Record<IdiomaAudio, string> = {
  SUB: "Subtitulado",
  DUB: "Doblado",
};
