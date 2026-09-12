import { auth } from "@/lib/auth";
import { obtenerPerfilActivo } from "@/lib/perfil-activo";
import {
  obtenerDestacadas,
  obtenerUltimosEpisodios,
  obtenerEnEmision,
  obtenerTendencias,
  obtenerGenerosConSeries,
  obtenerContinuarViendo,
} from "@/lib/queries/home";
import { Hero } from "@/components/home/hero";
import { TopDiezCard } from "@/components/home/top-diez-card";
import { BotonQuitarProgreso } from "@/components/home/boton-quitar-progreso";
import { Carrusel, CarruselItem } from "@/components/shared/carrusel";
import { SerieCard } from "@/components/shared/serie-card";
import { EpisodioCard } from "@/components/shared/episodio-card";

const SIETE_DIAS_MS = 7 * 24 * 60 * 60 * 1000;

export default async function HomePage() {
  const session = await auth();
  const perfilActivo = session?.user ? await obtenerPerfilActivo(session.user.id) : null;

  const [destacadas, ultimosEpisodios, enEmision, tendencias, filasGenero, continuarViendo] =
    await Promise.all([
      obtenerDestacadas(),
      obtenerUltimosEpisodios(),
      obtenerEnEmision(),
      obtenerTendencias(),
      obtenerGenerosConSeries(6, 12),
      perfilActivo ? obtenerContinuarViendo(perfilActivo.id) : Promise.resolve([]),
    ]);

  return (
    <div className="space-y-12 pb-14">
      {/* -mt-14: el banner sube por detras del header, que arriba del todo es
          transparente (ver HeaderShell). Sin esto el hero arranca con una
          franja solida encima y se pierde el efecto de portada. */}
      <div className="-mt-14">
        <Hero series={destacadas} />
      </div>

      <div className="space-y-10">
        {continuarViendo.length > 0 && (
          <Carrusel titulo="Continuar viendo">
            {continuarViendo.map((p) => (
              <CarruselItem key={p.id} ancho="w-56 sm:w-64">
                <div className="group relative">
                  <EpisodioCard
                    episodio={{
                      ...p.episodio,
                      progresoPorcentaje:
                        p.duracionTotal > 0 ? (p.segundoActual / p.duracionTotal) * 100 : 0,
                    }}
                  />
                  <BotonQuitarProgreso episodioId={p.episodioId} />
                </div>
              </CarruselItem>
            ))}
          </Carrusel>
        )}

        {ultimosEpisodios.length > 0 && (
          <Carrusel titulo="Últimos episodios agregados">
            {ultimosEpisodios.map((episodio) => (
              <CarruselItem key={episodio.id} ancho="w-56 sm:w-64">
                <EpisodioCard
                  episodio={{
                    ...episodio,
                    // `createdAt` pasa por unstable_cache: en un cache hit llega
                    // serializado como string ISO, no como Date. new Date(...)
                    // funciona en ambos casos.
                    esNuevo: Date.now() - new Date(episodio.createdAt).getTime() < SIETE_DIAS_MS,
                  }}
                />
              </CarruselItem>
            ))}
          </Carrusel>
        )}

        {enEmision.length > 0 && (
          <Carrusel titulo="En emisión" verMasHref="/catalogo?estado=EMISION">
            {enEmision.map((serie) => (
              <CarruselItem key={serie.id}>
                <SerieCard serie={serie} />
              </CarruselItem>
            ))}
          </Carrusel>
        )}

        {tendencias.length > 0 && (
          <Carrusel titulo="Top 10 esta semana" verMasHref="/catalogo?orden=vistos">
            {tendencias.slice(0, 10).map((serie, i) => (
              <CarruselItem key={serie.id} ancho="w-36 sm:w-48">
                <TopDiezCard serie={serie} puesto={i + 1} />
              </CarruselItem>
            ))}
          </Carrusel>
        )}

        {filasGenero.map(({ genero, series }) => (
          <Carrusel
            key={genero.id}
            titulo={genero.nombre}
            verMasHref={`/catalogo?genero=${genero.slug}`}
          >
            {series.map((serie) => (
              <CarruselItem key={serie.id}>
                <SerieCard serie={serie} />
              </CarruselItem>
            ))}
          </Carrusel>
        ))}
      </div>
    </div>
  );
}
