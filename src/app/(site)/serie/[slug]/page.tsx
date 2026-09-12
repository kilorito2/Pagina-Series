import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Play, Star } from "lucide-react";
import { auth } from "@/lib/auth";
import { obtenerPerfilActivo } from "@/lib/perfil-activo";
import {
  obtenerSeriePorSlug,
  obtenerProgresoEpisodios,
  obtenerProgresoEnCurso,
  obtenerEstadoListaItem,
  obtenerValoracionPerfil,
  obtenerRelacionadas,
} from "@/lib/queries/serie";
import { obtenerComentarios } from "@/lib/queries/comentarios";
import { ETIQUETA_ESTADO, ETIQUETA_TIPO, ETIQUETA_CLASIFICACION } from "@/lib/etiquetas";
import { rutaVer } from "@/lib/rutas";
import { siteConfig } from "@/lib/config";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Carrusel, CarruselItem } from "@/components/shared/carrusel";
import { SerieCard } from "@/components/shared/serie-card";
import { Revelar } from "@/components/shared/revelar";
import { Sinopsis } from "./sinopsis";
import { ListaEpisodios } from "./lista-episodios";
import { SelectorMiLista } from "./selector-mi-lista";
import { BotonCompartir } from "./boton-compartir";
import { SelectorValoracion } from "./selector-valoracion";
import { SeccionComentarios } from "./seccion-comentarios";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const serie = await obtenerSeriePorSlug(slug);
  if (!serie) return {};

  const descripcion = serie.sinopsis.slice(0, 160);
  return {
    title: serie.titulo,
    description: descripcion,
    openGraph: {
      title: serie.titulo,
      description: descripcion,
      images: serie.banner ? [serie.banner] : [serie.poster],
    },
  };
}

export default async function FichaSeriePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const serie = await obtenerSeriePorSlug(slug);
  if (!serie) notFound();

  const session = await auth();
  const perfilActivo = session?.user ? await obtenerPerfilActivo(session.user.id) : null;

  const episodioIds = serie.temporadas.flatMap((t) => t.episodios.map((e) => e.id));
  const generoIds = serie.generos.map((g) => g.genero.id);

  const [progresoMap, progresoEnCurso, estadoLista, valoracionInicial, relacionadas, comentarios] =
    await Promise.all([
      perfilActivo
        ? obtenerProgresoEpisodios(perfilActivo.id, episodioIds)
        : Promise.resolve(new Map<string, { completado: boolean }>()),
      perfilActivo ? obtenerProgresoEnCurso(perfilActivo.id, episodioIds) : Promise.resolve(null),
      perfilActivo ? obtenerEstadoListaItem(perfilActivo.id, serie.id) : Promise.resolve(null),
      perfilActivo ? obtenerValoracionPerfil(perfilActivo.id, serie.id) : Promise.resolve(null),
      obtenerRelacionadas(serie.id, generoIds),
      obtenerComentarios(serie.id),
    ]);

  const vistoIds = [...progresoMap.entries()].filter(([, p]) => p.completado).map(([id]) => id);

  // Ruta de "Ver ahora" (primer episodio) o "Continuar viendo" (último en curso).
  let hrefVer: string | null = null;
  let labelVer = "Ver primer episodio";
  if (progresoEnCurso) {
    for (const temporada of serie.temporadas) {
      const episodio = temporada.episodios.find((e) => e.id === progresoEnCurso.episodioId);
      if (episodio) {
        hrefVer = rutaVer(serie.slug, temporada.numero, episodio.numero);
        labelVer = "Continuar viendo";
        break;
      }
    }
  }
  if (!hrefVer) {
    const primeraTemporada = serie.temporadas[0];
    const primerEpisodio = primeraTemporada?.episodios[0];
    if (primeraTemporada && primerEpisodio) {
      hrefVer = rutaVer(serie.slug, primeraTemporada.numero, primerEpisodio.numero);
    }
  }

  // Datos estructurados (schema.org) para resultados enriquecidos en
  // buscadores: ficha, géneros y puntaje si ya hay valoraciones.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TVSeries",
    name: serie.titulo,
    alternateName: serie.tituloAlternativo ?? undefined,
    description: serie.sinopsis,
    image: serie.banner ?? serie.poster,
    genre: serie.generos.map(({ genero }) => genero.nombre),
    datePublished: String(serie.anio),
    numberOfSeasons: serie.temporadas.length,
    url: `${siteConfig.dominio}/serie/${serie.slug}`,
    ...(serie.ratingPromedio > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: serie.ratingPromedio,
        bestRating: 10,
        worstRating: 1,
      },
    }),
  };

  return (
    <div>
      {/* JSON-LD estático armado con datos propios de la base, no HTML de usuario. */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="relative -mt-14 h-[46vh] min-h-[320px] w-full overflow-hidden sm:h-[56vh]">
        <div className="absolute inset-0 kenburns">
          <Image
            src={serie.banner ?? serie.poster}
            alt=""
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/65 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/70 via-transparent to-transparent" />
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-background/60 to-transparent" />
      </div>

      <div className="mx-auto -mt-20 max-w-7xl px-4 sm:-mt-28 sm:px-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end">
          <div className="relative aspect-[2/3] w-28 shrink-0 overflow-hidden rounded-xl shadow-[var(--sombra-card)] ring-4 ring-background sm:w-48">
            <Image src={serie.poster} alt={serie.titulo} fill sizes="192px" className="object-cover" />
          </div>

          <div className="min-w-0 flex-1 space-y-3 pb-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
              <span>{serie.anio}</span>
              <span aria-hidden>·</span>
              <span>{ETIQUETA_TIPO[serie.tipo]}</span>
              <span aria-hidden>·</span>
              <span>{ETIQUETA_ESTADO[serie.estado]}</span>
              <span aria-hidden>·</span>
              <span>{ETIQUETA_CLASIFICACION[serie.clasificacion]}</span>
              {serie.ratingPromedio > 0 && (
                <>
                  <span aria-hidden>·</span>
                  <span className="flex items-center gap-1 text-foreground">
                    <Star className="size-3.5 fill-brand-accent text-brand-accent" />
                    {serie.ratingPromedio.toFixed(1)}
                  </span>
                </>
              )}
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-balance sm:text-5xl">
              {serie.titulo}
            </h1>
            {serie.tituloAlternativo && (
              <p className="text-sm text-muted-foreground">{serie.tituloAlternativo}</p>
            )}

            <div className="flex flex-wrap gap-1.5">
              {serie.generos.map(({ genero }) => (
                <Badge
                  key={genero.id}
                  variant="secondary"
                  render={<Link href={`/catalogo?genero=${genero.slug}`} />}
                  className="transition-transform duration-200 ease-out-fuerte puntero-fino:hover:-translate-y-0.5"
                >
                  {genero.nombre}
                </Badge>
              ))}
            </div>

            <SelectorValoracion
              serieId={serie.id}
              puntajeInicial={valoracionInicial}
              haySesion={!!session?.user}
            />
          </div>
        </div>

        <div className="mt-6 max-w-2xl">
          <Sinopsis texto={serie.sinopsis} />
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          {hrefVer && (
            <Button render={<Link href={hrefVer} />} size="lg">
              <Play className="size-4 fill-current" />
              {labelVer}
            </Button>
          )}
          <SelectorMiLista serieId={serie.id} estadoInicial={estadoLista} haySesion={!!session?.user} />
          <BotonCompartir titulo={serie.titulo} />
        </div>

        <Revelar className="mt-12 pb-4">
          <h2 className="mb-4 flex items-center gap-2.5 text-lg font-semibold tracking-tight sm:text-xl">
            <span aria-hidden className="h-5 w-1 rounded-full bg-primary" />
            Episodios
          </h2>
          <ListaEpisodios slugSerie={serie.slug} temporadas={serie.temporadas} vistoIds={vistoIds} />
        </Revelar>

        <Revelar className="mt-10 pb-10">
          <h2 className="mb-4 flex items-center gap-2.5 text-lg font-semibold tracking-tight sm:text-xl">
            <span aria-hidden className="h-5 w-1 rounded-full bg-primary" />
            Comentarios
          </h2>
          <SeccionComentarios
            serieId={serie.id}
            comentariosIniciales={comentarios}
            perfilActivoId={perfilActivo?.id ?? null}
            esAdmin={session?.user?.role === "ADMIN" || session?.user?.role === "MOD"}
          />
        </Revelar>
      </div>

      {relacionadas.length > 0 && (
        <div className="mt-4 pb-10">
          <Carrusel titulo="Series relacionadas">
            {relacionadas.map((relacionada) => (
              <CarruselItem key={relacionada.id}>
                <SerieCard serie={relacionada} />
              </CarruselItem>
            ))}
          </Carrusel>
        </div>
      )}
    </div>
  );
}
