# AnimeVerse — estado del MVP

Foto completa de en qué quedó el proyecto: qué hace, con qué está construido,
qué es real y qué es placeholder, qué se probó y qué falta para que sea un
sitio en producción de verdad. El detalle fase por fase (con las decisiones
tomadas en cada una) vive en [`HISTORY.md`](./HISTORY.md); la descripción
general del proyecto está en [`README.md`](./README.md); este documento es
el resumen ejecutivo.

## Qué es

Plataforma de streaming de anime y series tipo AnimeFLV/Crunchyroll:
catálogo navegable, fichas de serie, reproductor con progreso guardado,
perfiles múltiples por cuenta (estilo Netflix), comunidad (comentarios y
valoraciones) y un panel de administración propio donde se carga y gestiona
todo el contenido sin tocar código.

Generado a partir de `prompt-plataforma-streaming.md`, construido por fases,
con una fase extra de pulido + mejoras inspiradas en Netflix/Crunchyroll/
AnimeFLV encima de las 9 fases originales del prompt.

## Stack técnico

| Capa | Tecnología |
| --- | --- |
| Framework | Next.js 15.5 (App Router) + React 19 + TypeScript estricto |
| Estilos | Tailwind CSS v4 + shadcn/ui (sobre `@base-ui/react`) |
| Base de datos | PostgreSQL + Prisma 6 |
| Auth | Auth.js v5 (credenciales + Google OAuth opcional), sesión JWT |
| Validación | Zod en inputs y rutas de API |
| Estado/datos cliente | TanStack Query + Zustand |
| Reproductor | Vidstack + HLS.js (modo `HLS`) / iframe sandboxeado (modo `EMBEDS`) |
| Animaciones | Framer Motion |
| Formularios | react-hook-form + @hookform/resolvers |
| Almacenamiento de imágenes | Cloudflare R2 (S3-compatible), subida por URL prefirmada |
| Import de contenido | API pública de Jikan (MyAnimeList) |
| Rate limiting | rate-limiter-flexible (en memoria — ver Limitaciones) |
| Sanitización | isomorphic-dompurify (comentarios) |

## Modelo de datos

14 modelos en `prisma/schema.prisma`: `User`, `Account`/`Session`/
`VerificationToken` (tablas de Auth.js), `TokenAccion` (verificación de
email / reset de password), `Profile`, `Serie`, `Genero` (N:M vía
`GeneroEnSerie`), `Temporada`, `Episodio`, `FuenteVideo`, `Progreso`,
`ListaItem`, `Valoracion`, `Comentario` (con respuestas anidadas vía
`parentId`), `Reporte`, `Notificacion`.

`Notificacion` está modelada pero **no tiene UI ni se escribe desde
ningún lado todavía** — solo existe el toggle `Profile.notificacionesActivas`
como preferencia guardada, sin nada que la lea. Es la única pieza del
schema que quedó sin implementar del todo.

No hay carpeta `prisma/migrations` — el schema se sincronizó siempre con
`prisma db push`, no con migraciones versionadas.

## Funcionalidades

**Catálogo y descubrimiento** — home con hero autoplay, fila "Continuar
viendo", últimos episodios (con badge "Nuevo"), en emisión, Top 10 con
numeración grande, filas por género; catálogo con filtros combinables
reflejados en la URL + paginación; buscador instantáneo con debounce,
historial reciente y búsquedas populares; calendario semanal de emisión.

**Ficha y reproductor** — sinopsis expandible, mi lista con selector de
estado, valorar (1-10), compartir, episodios por temporada con progreso
visual, series relacionadas. Reproductor en `/ver/[slug]/[temporada]/
[episodio]`: selector de servidor/calidad/idioma, progreso autoguardado,
anterior/siguiente con autoplay y cuenta regresiva, modo teatro, pantalla
completa, reportar enlace caído, atajos de teclado con diálogo de ayuda
(`Shift+N/P`, `T`, `F`, `?`).

**Cuentas y perfiles** — login por credenciales + Google OAuth opcional,
registro con verificación de email, recuperar/restablecer contraseña, hasta
5 perfiles por cuenta (selector estilo Netflix, perfil infantil que filtra
por clasificación), mi cuenta (lista, historial, configuración con cambio
de tema/idioma/calidad/autoplay/contraseña, cerrar sesión en todos los
dispositivos).

**Comunidad** — comentarios con respuestas anidadas y spoilers ocultables,
reportar comentario o enlace caído, moderación desde el panel.

**Panel de administración** (`/admin`, solo ADMIN/MOD) — dashboard con
métricas, CRUD de series con preview en vivo y subida de imágenes a R2,
importador desde Jikan, temporadas/episodios (alta individual y masiva),
fuentes de video con verificador de enlaces caídos, usuarios (rol/baneo),
moderación, géneros.

**SEO, errores y accesibilidad** (fase 9) — `sitemap.xml`/`robots.txt`/
`manifest.webmanifest` reales, JSON-LD en fichas de serie, páginas de
error/404 con marca propia en vez del error genérico de Next, skeletons de
carga en toda la navegación pública, skip-link, `prefers-reduced-motion`
respetado, `next/dynamic` para no cargar Vidstack/HLS.js cuando no hace
falta.

## Diseño — paleta "Blue Cinema"

Definida en esta sesión (el prompt original no la traía completa):
`#2563EB` principal, `#1D4ED8` hover del principal, `#38BDF8` de acento
(ratings, chips SUB/DUB, progreso). Dark-first (`#080D18` de fondo),
tema claro también implementado. Tokens en `src/app/globals.css`, valores
espejados en `src/lib/config.ts`.

Ícono de marca propio (cuadrado con gradiente + triángulo de play, no el
glyph "あ" del logo en pantalla — un carácter CJK a 16-32px es ilegible y
depende de qué fuente tenga instalada quien lo genera): `favicon.ico`,
`icon-32/192/512.png`, `apple-touch-icon.png` en `/public`.

## Decisiones técnicas notables

- **`unstable_cache` en las queries de home** (revalida cada 5 min o al
  publicar contenido, vía `revalidateTag`) para no pegarle a la base en
  cada request de una página que no depende del visitante.
- **`origenVideo` es una config, no arquitectura**: `FuenteVideo.url`
  guarda la URL en ambos casos (`EMBEDS`/`HLS`); cambiar
  `NEXT_PUBLIC_ORIGEN_VIDEO` cambia cómo el reproductor la interpreta, sin
  tocar el schema.
- **"Cerrar sesión en todos los dispositivos" con JWT puro** (sin sesiones
  en la base): `User.sesionesInvalidadasEn` + revalidación cada 5 min en el
  callback `jwt()`, no en cada request — trade-off consciente entre carga
  a la base y velocidad de propagación.
- **`notFound()` en rutas con `loading.tsx` responde HTTP 200, no 404**:
  límite conocido del App Router (el status ya se envió cuando empieza el
  streaming). Next.js lo compensa inyectando `<meta name="robots"
  content="noindex">`, que es lo que de verdad importa para SEO — confirmado
  a mano en build de producción.

## Placeholder / falta completar con datos reales

- **Nombre y dominio**: `AnimeVerse` / `animeverse.app` — dominio ficticio,
  todavía no hay uno real.
- **Contenido**: seed de ~15 series con posters de Picsum y URLs de video
  falsas (`embed.example.com`). Para producción real hace falta cargar
  contenido de verdad desde `/admin`.
- **Credenciales de servicios externos** (`.env`, todas opcionales pero sin
  ellas el sitio funciona en modo degradado): `RESEND_API_KEY` (sin esto,
  los emails de verificación/recuperación solo se loguean por consola),
  `GOOGLE_CLIENT_ID`/`SECRET` (sin esto, no hay login con Google), `R2_*`
  (sin esto, la subida de imágenes cae al campo de URL manual).
- **Usuario admin sembrado**: `admin@animeverse.app` / `Admin123!` — hay
  que cambiar la contraseña o borrar el usuario antes de un lanzamiento
  real.

## Limitaciones conocidas

- **Rate limiting en memoria** (`src/lib/rate-limit.ts`, `RateLimiterMemory`):
  funciona bien en una sola instancia; en serverless (Vercel) cada request
  puede caer en una instancia distinta con su propio contador, así que el
  límite de intentos en login/registro/comentarios/búsqueda no es estricto
  en ese entorno. La librería soporta un backend Redis con la misma API
  (`RateLimiterRedis`) si hace falta endurecerlo.
- **Progreso aproximado en modo `EMBEDS`**: al ser un iframe de otro
  origen, no hay forma de leer eventos reales de reproducción — el
  progreso se aproxima contando segundos con la pestaña visible. Es una
  limitación real de cualquier agregador de embeds externos, documentada
  en el código.
- **"Tendencias"/Top 10 sin ventana temporal real**: no hay un contador de
  vistas por semana, así que se aproxima con vistas totales históricas.
- **Notificaciones sin implementar** (ver Modelo de datos).
- **Sin migraciones versionadas de Prisma** — el schema se sincroniza con
  `db push`.
- **Importador depende de que Jikan (MyAnimeList) esté arriba** — durante
  las pruebas de la fase 7 el servicio estuvo caído; el código quedó
  confirmado por revisión, no por una corrida exitosa en vivo.

## Testing realizado

Cada fase se probó de punta a punta contra una base Supabase real (no solo
`build`/`lint`), con sesión real y limpiando los datos de prueba al
terminar — el detalle está en cada sección de [`HISTORY.md`](./HISTORY.md).
En esta última ronda, además:

- Recorrido funcional completo vía scripts de Node con sesión real
  (login, activar perfil, CRUD de género, reproductor, progreso, mi lista,
  valorar, comentar + reportar, reportar enlace caído, resolver desde
  moderación, verificador de enlaces) — sin errores.
- Verificación visual con Playwright (paleta de colores, hover de
  tarjetas, ficha de serie, catálogo) — sin problemas.
- Dos bugs reales encontrados y corregidos: `.getTime()` sobre un `Date`
  que `unstable_cache` devuelve serializado a string en un cache-hit, y un
  hydration mismatch por leer `useReducedMotion()` antes de montar en
  cliente.
- Un warning de consola (Base UI pidiendo `nativeButton=false` en botones
  que en realidad son links) que aparecía en cada página, corregido en
  `components/ui/button.tsx`.

Pipeline (`npm run lint`, `npx tsc --noEmit`, `npm run build`) verificado
limpio al cierre de esta sesión.

## Cómo correrlo

```bash
npm install
cp .env.example .env        # completá DATABASE_URL como mínimo
npm run db:push
npm run db:seed
npm run dev
```

Deploy a Vercel con checklist de variables de entorno y pasos exactos:
ver la sección **"Deploy (Vercel)"** en el README.

## Para ir de MVP a producción real

1. Completar el `.env` de producción (al menos `DATABASE_URL`,
   `DIRECT_URL`, `AUTH_SECRET`; el resto según qué features querés activas).
2. Cargar contenido real desde `/admin` (o vía el importador de Jikan) y
   borrar/reemplazar el seed de ejemplo.
3. Cambiar la contraseña del admin sembrado o borrar ese usuario.
4. Conseguir un dominio y actualizar `NEXT_PUBLIC_SITE_URL`.
5. Decidir si el rate limiting en memoria alcanza o conviene pasar a
   Redis antes de exponerlo a tráfico real.
6. Si te importa medir vistas por semana de verdad (para que "Tendencias"/
   Top 10 sea preciso), agregar un contador con ventana temporal en vez de
   vistas totales.
