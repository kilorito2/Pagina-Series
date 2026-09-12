# AnimeVerse

Plataforma web de streaming de anime y series (tipo AnimeFLV / Crunchyroll):
catálogo navegable, fichas de serie, reproductor con progreso guardado,
perfiles múltiples y panel de administración propio.

Generado a partir de `prompt-plataforma-streaming.md`, construyéndose por
fases según el **ORDEN DE CONSTRUCCIÓN** del prompt.

## Variables asumidas

El bloque `VARIABLES` del prompt no venía completado. El nombre, dominio y
origen del video quedaron en lo que traía el ejemplo; la paleta de colores
sí se definió a propósito, "Blue Cinema" (todo vive en
[`src/lib/config.ts`](./src/lib/config.ts) y en los tokens de
[`globals.css`](./src/app/globals.css), cambialo ahí o por variables de
entorno):

| Variable            | Valor asumido                    |
| ------------------- | --------------------------------- |
| Nombre del sitio     | `AnimeVerse`                      |
| Dominio              | `animeverse.app` (placeholder, todavía sin dominio real — ver `NEXT_PUBLIC_SITE_URL` en `.env.example`) |
| Color principal      | `#2563EB` — azul                  |
| Color secundario     | `#1D4ED8` — azul más oscuro, hover del principal (`--primary-hover` en `globals.css`) |
| Color de acento      | `#38BDF8` — celeste (ratings, chips SUB/DUB, progreso) |
| Origen del video     | `EMBEDS` (servidores externos, estilo AnimeFLV) |

`origenVideo` es una config, no una decisión de arquitectura irreversible:
`FuenteVideo.url` guarda la URL en ambos casos, y el reproductor (fase 5)
la interpreta como iframe o como fuente HLS según
`NEXT_PUBLIC_ORIGEN_VIDEO`.

**Íconos**: `public/icon-192.png`, `public/icon-512.png`,
`public/apple-touch-icon.png` y `src/app/favicon.ico` son un mark propio
(cuadrado redondeado con gradiente de marca + triángulo de play) generado
para este proyecto — no hay logo real todavía, así que se optó por algo
simple y reconocible antes que por el glyph "あ" que usa el `Logo` en
pantalla (ese sí es texto real vía HTML/CSS, así que renderiza bien; un
glyph CJK incrustado en un ícono estático de 16-32px es ilegible y además
depende de qué fuente tenga instalada quien genera el asset — para el
ícono conviene una marca geométrica). Si en algún momento hay un logo de
verdad, reemplazá estos 4 archivos — el resto del sitio no depende de su
contenido.

## Stack

- **Next.js 15.5** (App Router) + **React 19** + **TypeScript estricto**
- **Tailwind CSS v4** + **shadcn/ui** (sobre `@base-ui/react`, no Radix — es
  el motor que trae la versión actual del CLI de shadcn)
- **PostgreSQL** + **Prisma 6** (`prisma/schema.prisma`)
- **Auth.js v5** (`next-auth`) con credenciales + Google OAuth, adapter de Prisma
- **Zod** para validación de inputs y rutas de API
- **TanStack Query** (datos de servidor en cliente) + **Zustand** (estado global mínimo)
- **HLS.js** / **Vidstack** para el reproductor
- **Framer Motion** para animaciones sutiles
- **react-hook-form** + **@hookform/resolvers** para los formularios del admin
- **bcryptjs** para hashes de contraseña
- **isomorphic-dompurify** para sanitizar comentarios
- **rate-limiter-flexible** para rate limiting (login, registro, comentarios, búsqueda)
- **@aws-sdk/client-s3** contra R2 (S3-compatible) para posters/banners/avatars

## Setup

```bash
npm install
cp .env.example .env        # completá DATABASE_URL como mínimo
npm run db:push             # crea las tablas (o `npm run db:migrate` para migraciones versionadas)
npm run db:seed             # carga géneros, ~15 series de ejemplo y el admin
npm run dev
```

Login de admin sembrado: `admin@animeverse.app` / `Admin123!`

Comandos de base de datos disponibles: `db:generate`, `db:push`, `db:migrate`, `db:seed`, `db:studio`.

## Estructura de carpetas

```
prisma/
  schema.prisma        # modelo de datos completo (fase 1)
  seed.ts               # géneros + ~15 series + admin

src/
  app/
    layout.tsx           # layout raíz: fuentes, metadata, tema oscuro, providers
    globals.css           # tokens de diseño (colores de marca, dark-first)
    (site)/               # rutas públicas — home, catálogo, ficha, buscador... (fase 4+)
    ver/[slug]/[temporada]/[episodio]/  # reproductor (fase 5)
    admin/                # panel de administración (fase 7)
    api/                  # route handlers (auth, mutaciones, importador...)

  components/
    ui/                   # componentes base de shadcn/ui (ya instalados)
    layout/                # header, footer, nav (fase 3)
    home/ catalogo/ serie/ player/ admin/ shared/   # por sección, a medida que se construyen

  lib/
    config.ts              # branding y flags del sitio (única fuente de verdad)
    prisma.ts               # cliente Prisma singleton
    env.ts                  # validación de variables de entorno con Zod
    slug.ts                  # slugify()
    auth.ts                  # config de Auth.js (fase 2)
    validaciones/             # schemas Zod por entidad (fase 2+)
    api-externas/              # clientes Jikan / AniList (fase 7)
    storage/                    # cliente S3/R2 (fase 7)

  hooks/                    # hooks reutilizables (fase 3+)
  store/                     # stores de Zustand (fase 3+)
  types/                      # tipos compartidos que no vienen de Prisma
```

Server Components por defecto; `"use client"` solo donde haga falta
(formularios, reproductor, cosas con estado/eventos).

## Estado por fases

- [x] **Fase 1** — Setup, estructura de carpetas, Tailwind, shadcn, schema de Prisma completo y seed
- [x] **Fase 2** — Auth + sistema de perfiles + middleware de protección de rutas
- [x] **Fase 3** — Layout general: header, buscador, footer, nav móvil, sistema de temas
- [x] **Fase 4** — Home + catálogo con filtros + ficha de serie
- [x] **Fase 5** — Reproductor con progreso, selector de fuentes y autoplay
- [x] **Fase 6** — Mi lista, historial, configuración, calendario
- [x] **Fase 7** — Panel de administración completo con el importador
- [x] **Fase 8** — Comentarios, valoraciones, reportes y moderación
- [x] **Fase 9** — Pulido: SEO, performance, accesibilidad, estados de error y vacío + mejoras extra

## Auth y perfiles (fase 2)

- **Login**: credenciales (email + contraseña) y Google OAuth (opcional, se
  activa solo si completás `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET`).
- **Registro**: crea el usuario y manda un email de verificación (con
  `RESEND_API_KEY` sin configurar, el link se imprime en la consola del
  servidor en vez de enviarse — útil para probar en local).
- **Login bloqueado hasta verificar el email** (excepto el admin del seed,
  que ya nace verificado).
- **Recuperar contraseña**: `/recuperar` → email con link a
  `/restablecer/[token]` (vence en 1 hora, un solo uso).
- **Perfiles**: `/perfiles` (selector estilo Netflix, con modo
  "Administrar" para editar/borrar), `/perfiles/nuevo`,
  `/perfiles/[id]/editar`. Hasta 5 por cuenta, avatar de una galería
  predefinida (DiceBear), flag de perfil infantil.
- **Middleware** (`src/middleware.ts`): `/admin/**` exige rol `ADMIN`/`MOD`;
  `/perfiles`, `/ver/**`, `/cuenta/**` exigen sesión; `/ver/**` y
  `/cuenta/**` además exigen un perfil activo (si no hay, redirige a
  `/perfiles`). La config de Auth.js está partida en `auth.config.ts`
  (edge-safe, la usa el middleware) y `auth.ts` (con Prisma, la usan las
  rutas y server components) — es el patrón oficial de Auth.js v5.
- **Rate limiting** ya activo en login, registro, recuperar/restablecer y
  reenvío de verificación (`src/lib/rate-limit.ts`).

Advertencia esperada en el build: Next avisa que `jose` (dependencia de
Auth.js) usa `CompressionStream`, no soportado por el Edge Runtime. Es un
warning conocido del propio Auth.js en middleware, no rompe nada (esa rama
de código no se ejecuta con nuestra config).

## Layout y buscador (fase 3)

- **`src/app/(site)/`**: route group con el header/footer/nav públicos
  (home, `/buscar`). `(auth)` y `/perfiles` quedan afuera a propósito, con
  su propia pantalla completa sin header.
- **Buscador** (`components/layout/buscador.tsx`): debounce de 300ms,
  dropdown con poster+título+año, historial reciente en `localStorage`,
  página completa en `/buscar?q=`. Ambos comparten `lib/buscar-series.ts`
  y `/api/buscar` tiene su propio rate limit.
- **Tema**: `next-themes` (claro/oscuro/sistema), dark por defecto, toggle
  en el header. Falta conectarlo a `Profile.tema` — eso es de la fase 6
  (Configuración).
- **Nav móvil**: barra fija inferior (Inicio/Catálogo/Buscar/Calendario/
  Cuenta), oculta en desktop (`md:hidden`); el header muestra los links de
  texto ahí en vez de la barra.
- Algunos links ya apuntan a rutas que todavía no existen (`/calendario`,
  `/cuenta`, `/admin`) — quedan en blanco (404) hasta sus fases.

Probado en caliente contra la Supabase real: home, `/buscar?q=death` (trae
"Death Note" desde la base) y el redirect de middleware en `/perfiles` sin
sesión, los tres funcionando.

## Home, catálogo y ficha (fase 4)

- **Home**: hero con auto-rotate (Framer Motion) de las series `destacada:true`,
  y filas horizontales con scroll-snap (`components/shared/carrusel.tsx`):
  Continuar viendo (si hay perfil activo y progreso), Últimos episodios,
  En emisión, Tendencias (aproximado por `vistas` total — no llevamos
  contador semanal) y una fila por cada uno de los 6 géneros con más series.
- **Catálogo** (`/catalogo`): filtros combinables (género multi, año, estado,
  tipo, clasificación, idioma) + orden, todo en la URL como query params
  (`catalogoFiltrosSchema` usa `.catch()` por campo así una URL pisada a
  mano nunca rompe la página) y paginación de 24 en 24 con links reales
  (sin JS) en `paginacion-catalogo.tsx`.
- **Ficha de serie** (`/serie/[slug]`): banner + poster + chips + sinopsis
  expandible, botón "Ver primer episodio" / "Continuar viendo" (según haya
  progreso), selector de Mi Lista (funcional: crea/actualiza/borra
  `ListaItem` vía `/api/mi-lista`), compartir (Web Share API con fallback a
  copiar el link), episodios por temporada con check de visto, y series
  relacionadas por género compartido. `generateMetadata` con Open Graph.
- Quedaron **afuera a propósito** (van en su fase): comentarios y el botón
  de valorar (fase 8), y la página completa "Mi lista" con tabs (fase 6) —
  el selector de la ficha ya deja el dato bien guardado para cuando esa
  página exista.
- Probado contra la Supabase real (no solo build): home, `/catalogo`,
  `/catalogo?genero=accion` (9 resultados, chip activo) y
  `/serie/death-note` (200) + una serie inexistente (404 correcto).

## Reproductor (fase 5)

- **`@vidstack/react` estaba mal fijado** desde la fase 1: el dist-tag
  `latest` de npm apunta a la serie vieja `0.6.x` (pre-1.0, API distinta);
  la real activamente mantenida es `1.x` bajo el dist-tag `next`. Lo
  corregí a `1.15.6` antes de escribir el reproductor — con la API vieja
  hubiese sido código roto.
- **Dos reproductores según `NEXT_PUBLIC_ORIGEN_VIDEO`:**
  - `HLS`: Vidstack (`MediaPlayer` + `DefaultVideoLayout`) — progreso real
    por eventos, atajos de teclado (espacio/flechas/F/M) y controles
    nativos vienen gratis con el layout por defecto de Vidstack.
  - `EMBEDS` (el default): un `<iframe>` sandboxeado. Como es contenido de
    otro origen no hay forma de leer su reproducción real, así que el
    progreso es una aproximación por tiempo transcurrido con la pestaña
    visible — está comentado en el código, es una limitación real de
    cualquier agregador de embeds externos, no un bug.
- Guardado de progreso cada 10s + al ocultar la pestaña/salir
  (`navigator.sendBeacon` si la pestaña ya se está cerrando), selector de
  servidor/calidad/idioma con fallback a la mejor coincidencia disponible,
  anterior/siguiente (cruza temporadas), autoplay con cuenta regresiva de
  8s cancelable (según `Profile.autoplay`), modo teatro, pantalla completa,
  y reportar enlace caído (crea `Reporte` + suma `FuenteVideo.reportesCaido`).
- Probado de punta a punta con sesión real (login por credenciales +
  activar perfil vía API, no solo build): `/ver/one-piece/1/1` → 200 con
  el embed real de Supabase; temporada inexistente → 404; `/api/progreso`
  y `/api/reportes` con IDs reales → 200 y confirmé en la base que
  `FuenteVideo.reportesCaido` y el `Reporte` quedaron guardados.

## Mi cuenta y calendario (fase 6)

- **`/cuenta`** (dentro de `(site)`, con header/footer): sub-nav a Mi lista /
  Historial / Configuración. El layout revalida sesión + perfil activo como
  segunda capa además del middleware.
- **Mi lista** (`/cuenta/lista`): tabs por estado con contador, cada tarjeta
  tiene un menú para mover de estado o quitar — mismo endpoint
  `/api/mi-lista` que ya usaba la ficha de serie.
- **Historial** (`/cuenta/historial`): episodios vistos con barra de
  progreso, borrar uno o "Borrar todo" (con confirmación). Nuevo `DELETE`
  en `/api/progreso`.
- **Configuración**: reutiliza `FormularioPerfil` para el perfil activo (y
  ahora también aplica el tema al guardar, conectando `Profile.tema` con
  `next-themes` — quedó pendiente desde la fase 3), + cambio de contraseña
  (`/api/auth/cambiar-password`, soporta cuentas sin contraseña por ser
  100% Google) + cerrar sesión en todos los dispositivos.
- **"Cerrar sesión en todos los dispositivos" con JWT** (sin sesiones en la
  base para borrar): agregué `User.sesionesInvalidadasEn` y el callback
  `jwt()` en `lib/auth.ts` la revalida cada 5 minutos como máximo, no en
  cada request — si lo hiciera en cada request, cada página autenticada
  sumaría una consulta extra a la base. Es un trade-off consciente:
  desconectar en otro dispositivo puede tardar hasta 5 minutos en notarse.
- **Calendario** (`/calendario`, público): como no hay un campo de "día de
  emisión fijo" en el modelo, agrupa las series `EMISION` por el día de la
  semana de su episodio más reciente — mismo criterio que usan los sitios
  de streaming de anime reales.
- Agregué `Profile.notificacionesActivas` (el toggle de "notificaciones"
  que pedía Configuración) — guarda la preferencia; el envío real de
  notificaciones no está en el alcance de esta fase.
- Probado con sesión real de punta a punta: agregar una serie a Mi Lista y
  verla aparecer con el contador correcto, historial mostrando y borrando
  progreso real, `/calendario` público con series reales agrupadas, y
  `cerrar-sesiones` confirmado en la base (`sesionesInvalidadasEn` quedó
  seteado). Dejé afuera del testing en caliente el cambio de contraseña
  del admin real, para no arriesgar dejarlo en un estado roto.

## Panel de administración (fase 7)

- **`/admin`**, solo ADMIN/MOD (middleware + segunda capa en el layout):
  sidebar propio, sin el header/footer del sitio.
- **Dashboard**: series/episodios/usuarios totales, "vistas hoy/semana"
  aproximadas contando guardados de `Progreso` (no llevamos un log de
  eventos de vista), últimos comentarios, reportes pendientes.
- **Series**: tabla con búsqueda, orden por columna (título/año/vistas) y
  paginación; selección múltiple + borrado en lote. Formulario de alta/
  edición con **subida real a R2** (URL prefirmada) + campo de URL manual
  como respaldo si no hay credenciales de R2, selector múltiple de
  géneros y **preview en vivo** con el mismo `SerieCard` del sitio.
- **Importador**: busca en Jikan (MyAnimeList) y precarga sinopsis, poster,
  géneros (mapeados a nuestra taxonomía en español), año y estudio en el
  mismo formulario de arriba. La cantidad de episodios de Jikan queda como
  sugerencia para generarlos en lote una vez creada la serie.
- **Temporadas y episodios**: alta individual y alta masiva (rango
  numerado, saltea los que ya existen).
- **Fuentes de video**: varios servidores por episodio, activar/desactivar,
  y un verificador que hace un `HEAD`/`GET` real a la URL y suma a
  `reportesCaido` si no responde.
- **Usuarios**: listado con búsqueda, cambio de rol y baneo (con motivo);
  un ADMIN no puede tocarse a sí mismo desde ahí.
- **Moderación**: cola de reportes pendientes (comentarios + enlaces
  caídos) con acciones de eliminar/desactivar o descartar.
- **Géneros**: CRUD simple con edición inline.
- Probado de punta a punta contra Supabase (login real + cookies armadas a
  mano porque `Invoke-WebRequest` se puso errático en esta sesión —
  terminé armando las pruebas con `fetch` desde un script de Node, que
  anduvo sin problemas): creé género → serie → temporada → episodio →
  fuente, verifiqué que el chequeador de enlaces detecta una URL rota real
  y suma el contador, confirmé que `subir-imagen` falla prolijo sin R2
  configurado, resolví el reporte pendiente que había quedado de la fase 5,
  y limpié todo lo de prueba al final.
- **Jikan estaba caído durante las pruebas** (el propio servicio devolvía
  504 al intentar conectar con MyAnimeList) — el código de la búsqueda
  está confirmado por revisión y porque el resto de las llamadas HTTP del
  mismo módulo (`fetch` + manejo de errores) son idénticas a las que sí
  probé con éxito en otros lados; no pude ver un import exitoso en vivo.

## Comentarios, valoraciones y moderación (fase 8)

- **Comentarios** en la ficha de serie: respuestas anidadas (un nivel de
  árbol recursivo, no hay límite de profundidad real), ocultamiento de
  spoilers con click-para-revelar, reportar, y borrar el propio (o
  cualquiera si sos ADMIN/MOD). Contenido sanitizado con
  `isomorphic-dompurify` (sin HTML, es texto plano) y con su propio rate
  limit.
- **Valorar**: 1 a 10, recalcula `Serie.ratingPromedio` como el promedio
  real de todas las valoraciones cada vez que alguien vota.
- **Reportar comentario** alimenta la misma cola de moderación que ya
  armamos en la fase 7 (`Reporte` con `tipo: COMENTARIO`) — quedó
  verificado el circuito completo: reportear desde la ficha → aparece en
  `/admin/moderacion` → resolver desde ahí.
- Probado de punta a punta contra Supabase: comentario + respuesta con
  spoiler → aparecen bien en la ficha (spoiler oculto por defecto) →
  reportar → aparece en el dashboard admin y en moderación → valorar
  recalcula el promedio real → borré todo lo de prueba y reseteé el
  rating al terminar.

## Pulido + mejoras (fase 9)

- **SEO**: `sitemap.ts` (estáticas + todas las series con `lastModified`),
  `robots.ts` (bloquea `/admin`, `/api`, `/cuenta`, `/perfiles`, `/ver`,
  `/restablecer`, `/verificar`) y `manifest.ts` (PWA-lite; sin ícono PNG
  dedicado en `/public` todavía, usa `favicon.ico` — mismo criterio que las
  demás asunciones sin completar). JSON-LD `TVSeries` en la ficha de serie
  (nombre, sinopsis, imagen, géneros, `aggregateRating` si hay valoraciones).
  `robots: noindex` en auth, `/perfiles`, `/cuenta`, `/admin` y `/buscar`.
- **Errores y 404**: `global-error.tsx` (con su propio `<html>/<body>`, es
  el único que lo necesita), `not-found.tsx` genérico, `error.tsx` en
  `(site)` y `admin` (mantienen header/footer y sidebar respectivamente), y
  `not-found.tsx` con copy propio en la ficha de serie y en el reproductor.
- **Nota sobre notFound() + streaming**: las rutas con `loading.tsx` quedan
  detrás de un boundary de Suspense, y Next.js ya emitió el `200` antes de
  que `notFound()` se resuelva — el HTML final muestra el `not-found.tsx`
  igual, pero el status HTTP queda en 200 en vez de 404. Es un límite
  conocido y documentado del App Router (no hay forma de cambiar el status
  code una vez que empezó el streaming); Next.js lo compensa solo,
  inyectando `<meta name="robots" content="noindex">` en esas respuestas,
  que es lo que de verdad le importa a un buscador. Confirmado a mano en
  build de producción, con y sin los `loading.tsx`.
- **Loading states**: `loading.tsx` con skeletons (mismo componente
  `Skeleton` que ya usaba el resto del sitio) en home, catálogo, ficha,
  buscador, calendario y `cuenta/lista`+`cuenta/historial`.
- **Accesibilidad**: link "Saltar al contenido" (nuevo
  `components/shared/skip-link.tsx`) hacia `id="main-content"` en el
  `<main>` de `(site)` y `admin`; el Hero respeta
  `prefers-reduced-motion` (sin auto-rotate ni cross-fade) — con cuidado de
  no leer `useReducedMotion()` antes de montar, porque devuelve un valor
  distinto en server y en el primer render del cliente y tira un
  hydration mismatch si se usa directo (mismo patrón que ya usaba
  `theme-toggle.tsx` para el ícono de tema).
- **Performance**: `next.config.ts` con `images.formats` (AVIF/WebP), y el
  reproductor Vidstack/HLS.js (`reproductor-hls.tsx`) pasado a
  `next/dynamic({ ssr: false })` — con `NEXT_PUBLIC_ORIGEN_VIDEO=EMBEDS`
  (el default) ese bundle pesado ya no se descarga ni se ejecuta en el
  server para nada.
- **Mejoras "lo mejor de otras plataformas"**:
  - Tarjetas con ⭐ puntaje + tipo al hover (Netflix) en toda tarjeta de
    serie del sitio (home, catálogo, relacionadas, búsqueda) — un solo
    cambio de `SerieCard` + los `select` de Prisma que la alimentan.
  - Fila **Top 10** en home con numeración grande (Netflix), reemplaza la
    fila de "Tendencias".
  - Badge **"Nuevo"** en episodios agregados en los últimos 7 días
    (AnimeFLV/Crunchyroll).
  - Botón **"×" para quitar de "Continuar viendo"** al hover
    (Netflix/Crunchyroll), reusa el mismo `DELETE /api/progreso` de
    Historial.
  - **Atajos de teclado** en el reproductor: `Shift+N`/`Shift+P` (episodio
    sig./ant., mismo patrón que YouTube — nada de `Alt+flechas`, esa
    combinación ya es "atrás/adelante" del navegador y nunca llegaría a la
    página), `T` (teatro), `F` (pantalla completa) y `?` abre un diálogo de
    ayuda con la lista completa.
  - **Búsquedas populares** en el dropdown del buscador cuando está vacío
    (Crunchyroll), además del historial reciente.
  - CTA ("Limpiar filtros" / "Ver catálogo") en los estados vacíos de
    catálogo y buscador.
- Dos bugs reales encontrados probando en caliente (no por build/lint) y
  corregidos: `episodio.createdAt.getTime()` rompía en un cache-hit de
  `unstable_cache` porque ahí el dato llega serializado a string ISO, no
  como `Date` — pasa la validación de tipos porque `unstable_cache` no
  refleja la serialización en su tipo de retorno; y el hydration mismatch
  de `useReducedMotion()` de arriba.
- Probado de punta a punta contra Supabase real (login admin + activar
  perfil): recorrido completo de home (Top 10, badges "Nuevo", quitar de
  Continuar viendo confirmado con el request `DELETE` real), hover de
  tarjetas, ficha de serie (JSON-LD verificado en el HTML), reproductor
  (atajos de teclado, incluido el diálogo de ayuda), buscador (populares +
  sin resultados), catálogo sin resultados, `/sitemap.xml`, `/robots.txt`,
  `/manifest.webmanifest`, `noindex` confirmado en `/admin` y
  `/cuenta/lista`, y una ruta y una serie inexistentes.

## Deploy (Vercel)

1. **Base de datos**: un Postgres accesible desde internet (Supabase,
   Neon, Railway...). Guardá `DATABASE_URL` (pooler) y `DIRECT_URL`
   (conexión directa) — ver los comentarios de `.env.example`.
2. **Importar el repo en Vercel** (vercel.com → Add New → Project). Next.js
   se detecta solo, no hace falta tocar build command ni output.
3. **Variables de entorno** (Vercel → Settings → Environment Variables),
   una por una:
   - `DATABASE_URL`, `DIRECT_URL` — obligatorias.
   - `AUTH_SECRET` — obligatoria, generála con `npx auth secret` (no
     reuses la de local).
   - `NEXT_PUBLIC_SITE_URL` — la URL que te da Vercel
     (`https://tu-proyecto.vercel.app`) o tu dominio propio si ya lo
     conectaste. La usan `sitemap.ts`, `robots.ts` y los `openGraph`.
   - `NEXT_PUBLIC_ORIGEN_VIDEO` — `EMBEDS` o `HLS` según corresponda.
   - `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — opcionales, solo si
     querés login con Google (agregá la URL de Vercel a los "Authorized
     redirect URIs" en Google Cloud Console:
     `https://tu-dominio/api/auth/callback/google`).
   - `RESEND_API_KEY` / `EMAIL_FROM` — opcionales; sin esto, verificación
     de cuenta y recuperar contraseña siguen funcionando pero el link
     queda solo en los logs de Vercel, nadie lo recibe por email.
   - `R2_ACCOUNT_ID` / `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY` /
     `R2_BUCKET_NAME` / `R2_PUBLIC_URL` — opcionales; sin esto, la carga
     de imágenes en `/admin` cae sola al campo de URL manual (ver fase 7).
     Si los configurás, el bucket R2 necesita **CORS habilitado** para tu
     dominio de Vercel (la subida es un `PUT` directo desde el navegador a
     una URL prefirmada) y agregar el host del bucket a
     `images.remotePatterns` en `next.config.ts` si no matchea ya
     `*.r2.dev` / `*.r2.cloudflarestorage.com`.
   - No hace falta `NEXTAUTH_URL` en Vercel — `trustHost: true` en
     `auth.config.ts` ya confía en el header `Host` que manda Vercel (esa
     variable es solo para correrlo fuera de Vercel: Docker, VPS, etc.).
4. **Prisma**: `postinstall: prisma generate` ya corre solo en cada
   deploy. Lo que **no** es automático es sincronizar el schema con la
   base — corré `npx prisma db push` apuntando a `DATABASE_URL`/
   `DIRECT_URL` de producción antes del primer deploy, y de nuevo cada vez
   que cambie `prisma/schema.prisma` (no hay carpeta `prisma/migrations`
   todavía — el proyecto usa `db push`, no migraciones versionadas; si
   preferís historial de migraciones, `npx prisma migrate dev` local para
   generar la primera y pasás a `migrate deploy` en vez de `db push`).
5. **Seed** (opcional): `npm run db:seed` contra la base de producción te
   deja géneros + ~15 series de ejemplo + el admin
   (`admin@animeverse.app` / `Admin123!`) — **cambiá esa contraseña** o
   borrá ese usuario si vas a producción de verdad, no es para dejar tal
   cual.
6. **Deploy** y, si agregás un dominio propio en Vercel después, actualizá
   `NEXT_PUBLIC_SITE_URL` a ese dominio y redeployá (afecta metadata,
   `sitemap.xml`/`robots.txt` y los redirect URIs de Google OAuth si lo
   usás).

**Antes de un tráfico real, revisar:**

- **Rate limiting en memoria** (`src/lib/rate-limit.ts`): funciona bien en
  una sola instancia, pero en serverless (Vercel) cada invocación puede
  caer en una instancia distinta con su propio contador — un atacante
  distribuido podría esquivar el límite de intentos en login/registro/
  comentarios/búsqueda. La librería (`rate-limiter-flexible`) ya soporta
  un backend Redis con la misma API (`RateLimiterRedis` en vez de
  `RateLimiterMemory`); si te importa que el límite sea estricto en
  producción, decime y lo cambio (Vercel tiene Redis administrado vía
  Upstash con un par de clicks).
- Cambiar o borrar el usuario admin sembrado por el seed (punto 5).
- `NEXT_PUBLIC_SITE_URL` bien puesto antes de compartir el link — si queda
  mal, el sitemap y los OG de WhatsApp/Twitter apuntan a la URL vieja.

## Notas

- El pipeline (`npm run build`, `npm run lint`, `tsc --noEmit`) está verificado
  y pasa limpio a partir de este commit.
- `next`, `postcss` y `sharp` están fijados/forzados (`overrides`) a versiones
  parcheadas — el scaffold inicial traía CVEs conocidos.
- La responsabilidad sobre los derechos del contenido que se cargue en la
  plataforma es de quien la administra (ver nota final del prompt original).
