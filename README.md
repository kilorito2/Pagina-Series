# AnimeVerse

Plataforma web de streaming de anime y series (estilo AnimeFLV /
Crunchyroll): catálogo navegable, fichas de serie, reproductor con
progreso guardado, perfiles múltiples por cuenta, comunidad (comentarios
y valoraciones) y un panel de administración propio desde donde se carga
y gestiona todo el contenido sin tocar código.

Generado a partir de [`prompt-plataforma-streaming.md`](./prompt-plataforma-streaming.md)
y construido por fases; las 9 fases del proyecto están completas.

## Funcionalidades

- **Catálogo y descubrimiento** — home con hero destacado, fila "Continuar
  viendo", últimos episodios, en emisión, Top 10, filas por género;
  catálogo con filtros combinables (género, año, estado, tipo,
  clasificación, idioma) reflejados en la URL; buscador instantáneo con
  historial y búsquedas populares; calendario semanal de emisión.
- **Ficha y reproductor** — sinopsis, mi lista, valoraciones (1-10),
  compartir, episodios por temporada con progreso visual, series
  relacionadas. Reproductor con selector de servidor/calidad/idioma,
  progreso autoguardado, siguiente episodio con autoplay, modo teatro,
  pantalla completa, reportar enlace caído y atajos de teclado.
- **Cuentas y perfiles** — login por credenciales o Google OAuth, registro
  con verificación por email, recuperar/restablecer contraseña, hasta 5
  perfiles por cuenta (estilo Netflix, con perfil infantil), mi cuenta
  (lista, historial, configuración, cerrar sesión en todos los
  dispositivos).
- **Comunidad** — comentarios con respuestas anidadas y spoilers
  ocultables, valoraciones, reportes de comentarios y enlaces caídos con
  cola de moderación.
- **Panel de administración** (`/admin`) — dashboard con métricas, CRUD de
  series con subida de imágenes a R2 y preview en vivo, importador de
  contenido desde Jikan (MyAnimeList), temporadas/episodios/fuentes de
  video, gestión de usuarios y moderación.
- **SEO y accesibilidad** — `sitemap.xml`, `robots.txt`,
  `manifest.webmanifest`, JSON-LD en fichas de serie, skip-link, soporte
  de `prefers-reduced-motion`, estados de carga y error con marca propia.

## Stack

- **Next.js 15.5** (App Router) + **React 19** + **TypeScript estricto**
- **Tailwind CSS v4** + **shadcn/ui** (sobre `@base-ui/react`, no Radix)
- **PostgreSQL** + **Prisma 6** (`prisma/schema.prisma`)
- **Auth.js v5** (`next-auth`) con credenciales + Google OAuth, adapter de Prisma
- **Zod** para validación de inputs y rutas de API
- **TanStack Query** (datos de servidor en cliente) + **Zustand** (estado global mínimo)
- **HLS.js** / **Vidstack** para el reproductor
- **Framer Motion** para animaciones
- **react-hook-form** + **@hookform/resolvers** para los formularios del admin
- **bcryptjs** para hashes de contraseña
- **isomorphic-dompurify** para sanitizar comentarios
- **rate-limiter-flexible** para rate limiting
- **@aws-sdk/client-s3** contra Cloudflare R2 (S3-compatible) para posters/banners/avatars

## Puesta en marcha

```bash
npm install
cp .env.example .env        # completá DATABASE_URL como mínimo
npm run db:push             # crea las tablas (o `npm run db:migrate` para migraciones versionadas)
npm run db:seed             # carga géneros, ~15 series de ejemplo y el admin
npm run dev
```

Login de admin sembrado: `admin@animeverse.app` / `Admin123!` (cambiala
antes de un lanzamiento real).

### Variables de entorno

Todas las variables, con su explicación, están documentadas en
[`.env.example`](./.env.example). Resumen de las que hacen falta según el
entorno:

| Variable | Obligatoria | Para qué |
| --- | --- | --- |
| `DATABASE_URL` / `DIRECT_URL` | Sí | Conexión a PostgreSQL (Prisma) |
| `AUTH_SECRET` | Sí | Firma de sesión de Auth.js (`npx auth secret`) |
| `NEXT_PUBLIC_SITE_URL` | Sí | Metadata, sitemap, robots, Open Graph |
| `NEXT_PUBLIC_ORIGEN_VIDEO` | Sí | `EMBEDS` (iframe externo) o `HLS` (archivo `.m3u8` propio) |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | No | Login con Google |
| `RESEND_API_KEY` / `EMAIL_FROM` | No | Envío real de emails (sin esto, se loguean por consola) |
| `R2_ACCOUNT_ID` / `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY` / `R2_BUCKET_NAME` / `R2_PUBLIC_URL` | No | Subida de imágenes (sin esto, cae al campo de URL manual) |

### Scripts disponibles

| Script | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm run build` / `npm run start` | Build y arranque de producción |
| `npm run lint` | ESLint |
| `npm run db:generate` | Regenera el cliente de Prisma |
| `npm run db:push` | Sincroniza el schema con la base (sin migraciones) |
| `npm run db:migrate` | Crea/aplica una migración versionada |
| `npm run db:seed` | Carga géneros, series de ejemplo y el admin |
| `npm run db:studio` | Abre Prisma Studio |

## Estructura del proyecto

```
prisma/
  schema.prisma        # modelo de datos completo
  seed.ts               # géneros + ~15 series + admin

src/
  app/
    layout.tsx           # layout raíz: fuentes, metadata, tema oscuro, providers
    globals.css           # tokens de diseño (colores de marca, dark-first)
    (site)/               # rutas públicas — home, catálogo, ficha, buscador...
    ver/[slug]/[temporada]/[episodio]/  # reproductor
    admin/                # panel de administración
    api/                  # route handlers (auth, mutaciones, importador...)

  components/
    ui/                   # componentes base de shadcn/ui
    layout/                # header, footer, nav
    home/ catalogo/ serie/ player/ admin/ shared/   # por sección

  lib/
    config.ts              # branding y flags del sitio (única fuente de verdad)
    prisma.ts               # cliente Prisma singleton
    env.ts                  # validación de variables de entorno con Zod
    auth.ts                  # config de Auth.js
    validaciones/             # schemas Zod por entidad
    api-externas/              # clientes Jikan / AniList
    storage/                    # cliente S3/R2

  hooks/                    # hooks reutilizables
  store/                     # stores de Zustand
  types/                      # tipos compartidos que no vienen de Prisma
```

Server Components por defecto; `"use client"` solo donde hace falta
(formularios, reproductor, cosas con estado/eventos).

## Deploy (Vercel)

1. **Base de datos**: un Postgres accesible desde internet (Supabase,
   Neon, Railway...). Guardá `DATABASE_URL` (pooler) y `DIRECT_URL`
   (conexión directa) — ver los comentarios de `.env.example`.
2. **Importar el repo en Vercel** (vercel.com → Add New → Project). Next.js
   se detecta solo, no hace falta tocar build command ni output.
3. **Variables de entorno** (Vercel → Settings → Environment Variables):
   cargar como mínimo `DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET` y
   `NEXT_PUBLIC_SITE_URL`; el resto son opcionales según qué features
   quieras activas (ver la tabla de arriba). Si usás Google OAuth, agregá
   la URL de Vercel a los "Authorized redirect URIs" en Google Cloud
   Console: `https://tu-dominio/api/auth/callback/google`. No hace falta
   `NEXTAUTH_URL` en Vercel (`trustHost: true` ya confía en el header
   `Host` que manda Vercel).
4. **Prisma**: `postinstall: prisma generate` corre solo en cada deploy.
   Lo que no es automático es sincronizar el schema con la base — corré
   `npx prisma db push` apuntando a la base de producción antes del
   primer deploy, y de nuevo cada vez que cambie `prisma/schema.prisma`.
5. **Seed** (opcional): `npm run db:seed` contra la base de producción
   deja géneros + ~15 series de ejemplo + el admin — cambiá esa
   contraseña o borrá ese usuario antes de un lanzamiento real.
6. **Deploy** y, si agregás un dominio propio después, actualizá
   `NEXT_PUBLIC_SITE_URL` y redeployá (afecta metadata, sitemap/robots y
   los redirect URIs de Google OAuth si lo usás).

Antes de un tráfico real: el rate limiting es en memoria
(`src/lib/rate-limit.ts`), lo cual funciona bien en una sola instancia
pero no es estricto en serverless (cada invocación puede caer en una
instancia distinta); la librería soporta un backend Redis con la misma
API si hace falta endurecerlo.

## Documentación adicional

- [`MVP.md`](./MVP.md) — resumen ejecutivo del estado del proyecto: qué es
  real, qué queda como placeholder y limitaciones conocidas.
- [`HISTORY.md`](./HISTORY.md) — bitácora detallada de construcción, fase
  por fase, con las decisiones técnicas tomadas en cada una.
- [`prompt-plataforma-streaming.md`](./prompt-plataforma-streaming.md) —
  prompt original a partir del cual se generó el proyecto.

## Notas

- El pipeline (`npm run build`, `npm run lint`, `tsc --noEmit`) está verificado
  y pasa limpio.
- `next`, `postcss` y `sharp` están fijados/forzados (`overrides`) a versiones
  parcheadas — el scaffold inicial traía CVEs conocidos.
- La responsabilidad sobre los derechos del contenido que se cargue en la
  plataforma es de quien la administra.
