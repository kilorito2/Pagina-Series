import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { TriangleAlert } from "lucide-react";
import { auth } from "@/lib/auth";
import { obtenerPerfilActivo } from "@/lib/perfil-activo";
import {
  obtenerSerieParaReproductor,
  obtenerProgresoEpisodio,
  type EpisodioParaReproductor,
} from "@/lib/queries/reproductor";
import { ReproductorCliente } from "./reproductor-cliente";
import type { FuenteVideoOpcion } from "./selector-fuente";

const DURACION_POR_DEFECTO_SEG = 24 * 60;

type ParamsVer = { slug: string; temporada: string; episodio: string };

async function resolverEpisodio(params: ParamsVer) {
  const serie = await obtenerSerieParaReproductor(params.slug);
  if (!serie) return null;

  const numeroTemporada = Number(params.temporada);
  const numeroEpisodio = Number(params.episodio);

  const temporada = serie.temporadas.find((t) => t.numero === numeroTemporada);
  const episodio = temporada?.episodios.find((e) => e.numero === numeroEpisodio);
  if (!temporada || !episodio) return null;

  // Lista plana de todos los episodios (todas las temporadas, en orden) para anterior/siguiente.
  const planos = serie.temporadas.flatMap((t) =>
    t.episodios.map((e) => ({ temporadaNumero: t.numero, episodio: e }))
  );
  const indiceActual = planos.findIndex((p) => p.episodio.id === episodio.id);
  const anterior = indiceActual > 0 ? planos[indiceActual - 1]! : null;
  const siguiente = indiceActual < planos.length - 1 ? planos[indiceActual + 1]! : null;

  return { serie, temporada, episodio, anterior, siguiente };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<ParamsVer>;
}): Promise<Metadata> {
  const resuelto = await resolverEpisodio(await params);
  if (!resuelto) return {};
  const { serie, temporada, episodio } = resuelto;
  return {
    title: `${serie.titulo} — T${temporada.numero} E${episodio.numero}`,
    robots: { index: false }, // no tiene sentido indexar el player en sí
  };
}

export default async function VerPage({ params }: { params: Promise<ParamsVer> }) {
  const resuelto = await resolverEpisodio(await params);
  if (!resuelto) notFound();
  const { serie, temporada, episodio, anterior, siguiente } = resuelto;

  const session = await auth();
  if (!session?.user) redirect(`/login`);

  const perfilActivo = await obtenerPerfilActivo(session.user.id);
  if (!perfilActivo) redirect("/perfiles");

  const progresoExistente = await obtenerProgresoEpisodio(perfilActivo.id, episodio.id);

  const duracionInicial =
    progresoExistente?.duracionTotal ||
    (episodio.duracionMin ? episodio.duracionMin * 60 : DURACION_POR_DEFECTO_SEG);
  const tiempoInicial = progresoExistente?.completado ? 0 : (progresoExistente?.segundoActual ?? 0);

  const fuenteInicial = elegirFuenteInicial(episodio.fuentes, perfilActivo.idiomaPreferido, perfilActivo.calidadPorDefecto);

  if (!fuenteInicial) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 px-4 py-24 text-center">
        <TriangleAlert className="size-10 text-destructive" />
        <h1 className="text-xl font-semibold">Sin fuentes disponibles</h1>
        <p className="text-muted-foreground">
          Este episodio todavía no tiene ningún servidor activo. Probá más tarde.
        </p>
      </div>
    );
  }

  return (
    <ReproductorCliente
      serieSlug={serie.slug}
      serieTitulo={serie.titulo}
      poster={serie.poster}
      episodioId={episodio.id}
      episodioNumero={episodio.numero}
      episodioTitulo={episodio.titulo}
      temporadaNumero={temporada.numero}
      duracionInicial={duracionInicial}
      fuentes={episodio.fuentes}
      fuenteInicial={fuenteInicial}
      tiempoInicial={tiempoInicial}
      autoplayPreferido={perfilActivo.autoplay}
      episodiosTemporada={temporada.episodios.map((e) => ({
        id: e.id,
        numero: e.numero,
        titulo: e.titulo,
        thumbnail: e.thumbnail,
      }))}
      episodioAnterior={anterior ? { temporadaNumero: anterior.temporadaNumero, numero: anterior.episodio.numero } : null}
      episodioSiguiente={
        siguiente
          ? {
              temporadaNumero: siguiente.temporadaNumero,
              numero: siguiente.episodio.numero,
              titulo: siguiente.episodio.titulo,
              thumbnail: siguiente.episodio.thumbnail,
            }
          : null
      }
    />
  );
}

function elegirFuenteInicial(
  fuentes: EpisodioParaReproductor["fuentes"],
  idiomaPreferido: string,
  calidadPreferida: string
): FuenteVideoOpcion | null {
  if (fuentes.length === 0) return null;

  const exacta = fuentes.find((f) => f.idioma === idiomaPreferido && f.calidad === calidadPreferida);
  if (exacta) return exacta;

  const porIdioma = fuentes.find((f) => f.idioma === idiomaPreferido);
  if (porIdioma) return porIdioma;

  return fuentes[0]!;
}
