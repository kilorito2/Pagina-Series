/** Arma la ruta del reproductor (fase 5) para un episodio puntual. */
export function rutaVer(slugSerie: string, numeroTemporada: number, numeroEpisodio: number) {
  return `/ver/${slugSerie}/${numeroTemporada}/${numeroEpisodio}`;
}

/** Ruta del primer episodio de una serie, si tiene temporadas/episodios cargados. */
export function rutaPrimerEpisodio(serie: {
  slug: string;
  temporadas: { numero: number; episodios: { numero: number }[] }[];
}) {
  const primeraTemporada = serie.temporadas[0];
  const primerEpisodio = primeraTemporada?.episodios[0];
  if (!primeraTemporada || !primerEpisodio) return null;
  return rutaVer(serie.slug, primeraTemporada.numero, primerEpisodio.numero);
}
