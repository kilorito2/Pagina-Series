# Prompt: Plataforma web de streaming de anime y series

> Copiá todo lo que está debajo de la línea y pegalo en el asistente que vayas a usar.
> Completá primero el bloque **VARIABLES** con tus datos.

---

## VARIABLES DEL PROYECTO

- **Nombre del sitio:** `[NOMBRE]`
- **Dominio:** `[dominio.com]`
- **Color principal:** `[#7C3AED]`
- **Color de acento:** `[#22D3EE]`
- **Idioma de la interfaz:** Español (Latinoamérica)
- **Origen del video:** `[embeds de servidores externos | archivos HLS propios]`

---

## ROL

Actuás como arquitecto de software y desarrollador full-stack senior. Vas a diseñar y construir una plataforma web de streaming de anime y series, completa y lista para producción, con panel de administración propio.

## OBJETIVO

Construir un sitio tipo AnimeFLV / Crunchyroll: catálogo navegable, fichas de series, reproductor con progreso guardado, buscador rápido, perfiles múltiples por cuenta y un panel de admin donde se pueda cargar y gestionar todo el contenido sin tocar código.

Prioridades, en orden:
1. Que sea fácil de administrar (todo el contenido se carga desde el panel).
2. Que se vea moderno y pulido, no un template genérico.
3. Que sea rápido en móvil y desktop.
4. Que el código quede ordenado y escalable.

## STACK TÉCNICO

- **Framework:** Next.js 15 (App Router) + TypeScript en modo estricto
- **Estilos:** Tailwind CSS + shadcn/ui
- **Base de datos:** PostgreSQL con Prisma ORM
- **Auth:** Auth.js (NextAuth) con credenciales + Google OAuth, sesiones en JWT
- **Validación:** Zod en todos los inputs y en las rutas de API
- **Reproductor:** Vidstack o HLS.js según el origen del video
- **Estado cliente:** TanStack Query para data fetching, Zustand para estado global mínimo
- **Almacenamiento de imágenes:** S3 compatible (Cloudflare R2 / UploadThing)
- **Animaciones:** Framer Motion, sutiles

No agregues librerías que no aporten algo concreto.

## MODELO DE DATOS

Definí el schema de Prisma con estas entidades y sus relaciones:

**User** — id, email, passwordHash, role (`USER` | `MOD` | `ADMIN`), emailVerified, createdAt

**Profile** — id, userId, nombre, avatar, idiomaPreferido (`SUB` | `DUB`), calidadPorDefecto, autoplay (bool), esInfantil (bool), tema. Máximo 5 perfiles por cuenta.

**Serie** — id, titulo, tituloAlternativo, tituloOriginal, slug único, sinopsis, poster, banner, anio, estado (`EMISION` | `FINALIZADO` | `PROXIMAMENTE`), tipo (`TV` | `OVA` | `PELICULA` | `ESPECIAL` | `ONA`), clasificacion (`G` | `PG` | `PG13` | `R`), estudio, ratingPromedio, vistas, destacada (bool), createdAt

**Genero** — id, nombre, slug. Relación N:M con Serie.

**Temporada** — id, serieId, numero, titulo, anio

**Episodio** — id, temporadaId, numero, titulo, sinopsis, duracionMin, thumbnail, fechaEmision, vistas

**FuenteVideo** — id, episodioId, servidor (nombre), url, calidad (`480p` | `720p` | `1080p`), idioma (`SUB` | `DUB`), esActiva. Un episodio puede tener varias fuentes.

**Progreso** — id, profileId, episodioId, segundoActual, duracionTotal, completado, updatedAt

**ListaItem** — id, profileId, serieId, estado (`VIENDO` | `COMPLETADO` | `PENDIENTE` | `ABANDONADO` | `FAVORITO`)

**Valoracion** — id, profileId, serieId, puntaje (1-10)

**Comentario** — id, profileId, serieId o episodioId, contenido, parentId (para respuestas), spoiler (bool), createdAt

**Reporte** — id, tipo (`COMENTARIO` | `ENLACE_CAIDO`), referenciaId, motivo, estado, createdAt

**Notificacion** — id, profileId, tipo, mensaje, leida, link

Agregá índices en slug, en búsquedas por título y en las FK más consultadas.

## SECCIONES DEL SITIO

### 1. Home
- Hero carousel con las series destacadas (banner, sinopsis corta, botón "Ver ahora" y "+ Mi lista")
- Fila "Continuar viendo" con barra de progreso sobre el thumbnail (solo si hay sesión)
- Fila "Últimos episodios agregados" (lo más importante de la home, tipo AnimeFLV)
- Fila "En emisión"
- Fila "Tendencias esta semana"
- Filas por género: Acción, Romance, Comedia, etc.
- Carruseles con scroll horizontal, snap y flechas en desktop

### 2. Catálogo
- Grilla de tarjetas con paginación o scroll infinito
- Filtros combinables: género (multi), año, estado, tipo, clasificación, idioma
- Orden: más recientes, más vistos, mejor puntuados, A-Z
- Los filtros se reflejan en la URL como query params (compartibles y navegables con back)
- Estado vacío bien diseñado cuando no hay resultados

### 3. Ficha de serie
- Banner de fondo con degradado, poster, título, año, estado, géneros como chips, puntaje
- Sinopsis expandible
- Botones: Ver primer episodio / Continuar, agregar a Mi Lista con selector de estado, valorar, compartir
- Selector de temporada + lista de episodios con thumbnail, número, título, duración y check de visto
- Sección de series relacionadas / recomendadas
- Comentarios con respuestas anidadas y ocultamiento de spoilers

### 4. Reproductor
- Ruta `/ver/[slug]/[temporada]/[episodio]`
- Selector de servidor, calidad e idioma (SUB/DUB) visible arriba del player
- Guardado automático del progreso cada 10 segundos y al salir
- Botones anterior / siguiente episodio + autoplay del siguiente con cuenta regresiva
- Lista lateral de episodios de la temporada, colapsable en móvil
- Botón "reportar enlace caído"
- Modo teatro y pantalla completa
- Atajos de teclado: espacio, flechas, F, M

### 5. Buscador
- Barra fija en el header
- Búsqueda instantánea con debounce de 300ms y dropdown de resultados con poster + título + año
- Busca por título, título alternativo y título original
- Página completa de resultados en `/buscar?q=`
- Historial de búsquedas recientes en localStorage

### 6. Perfiles
- Pantalla selector de perfil al iniciar sesión, estilo Netflix
- Crear, editar, eliminar perfil (nombre + avatar de una galería predefinida)
- Perfil infantil que filtra por clasificación
- Cada perfil tiene su propio historial, lista y progreso

### 7. Mi cuenta
- **Mi lista:** pestañas por estado (Viendo, Pendiente, Completado, Favoritos, Abandonado)
- **Historial:** episodios vistos ordenados por fecha, con opción de borrar
- **Configuración:** tema claro/oscuro/sistema, idioma preferido, calidad por defecto, autoplay on/off, notificaciones, cambio de contraseña, cerrar sesión en todos los dispositivos

### 8. Calendario de emisión
- Vista semanal con los estrenos por día, resaltando el día actual

### 9. Auth
- Login, registro, recuperar contraseña, verificación de email
- Rutas protegidas por middleware según rol

## PANEL DE ADMINISTRACIÓN (`/admin`)

Accesible solo para `ADMIN` y `MOD`. Layout propio con sidebar.

- **Dashboard:** total de series, episodios, usuarios, vistas del día/semana, últimos comentarios, enlaces reportados
- **Series:** tabla con búsqueda, filtros y paginación. Formulario de alta/edición con subida de poster y banner, selector múltiple de géneros, preview en vivo de cómo se verá la tarjeta
- **Importador:** buscar una serie por título en la API pública de Jikan (MyAnimeList) o AniList y autocompletar sinopsis, poster, géneros, año y episodios con un click. Esto es clave para que cargar contenido sea rápido
- **Temporadas y episodios:** alta individual y alta masiva (generar N episodios numerados de una)
- **Fuentes de video:** agregar varios servidores por episodio, activar/desactivar, verificador de enlaces caídos
- **Usuarios:** listado, cambio de rol, baneo
- **Moderación:** cola de comentarios reportados y enlaces reportados, aprobar/eliminar
- **Géneros:** CRUD simple

Todas las tablas del admin con búsqueda, orden por columna y acciones en lote.

## DISEÑO

- **Dark mode primero**, con soporte de tema claro. Fondo casi negro (#0A0A0F), superficies elevadas apenas más claras
- Acentos del color principal usados con criterio: CTAs, estados activos, barras de progreso. No saturar
- Tarjetas de serie con poster 2:3, hover que escala levemente y revela título + año + botón de play
- Tipografía con jerarquía marcada: títulos grandes y con peso, metadatos chicos y en gris
- Skeleton loaders en todas las cargas, nunca spinners a pantalla completa
- Responsive real: mobile-first, nav inferior en móvil, header con sidebar en desktop
- Accesibilidad: contraste AA, foco visible, navegación por teclado, `alt` en todas las imágenes, roles ARIA en el player

Evitá que parezca un template de Bootstrap. Buscá una identidad visual propia y consistente.

## REQUISITOS NO FUNCIONALES

- SSR/ISR en home, catálogo y fichas para SEO. Metadatos dinámicos y Open Graph por serie
- `next/image` con lazy loading y placeholders blur
- Caché de queries pesadas, revalidación por tags
- Rate limiting en login, registro, comentarios y búsqueda
- Sanitización del contenido de los comentarios
- Manejo de errores con `error.tsx` y `not-found.tsx` por segmento
- Sitemap y robots.txt generados dinámicamente
- Variables sensibles solo en `.env`, con un `.env.example` documentado
- Seed script con ~15 series de ejemplo, géneros y un usuario admin

## ORDEN DE CONSTRUCCIÓN

Construí por fases y esperá mi confirmación al terminar cada una:

1. Setup del proyecto, estructura de carpetas, Tailwind, shadcn, schema de Prisma completo y seed
2. Auth + sistema de perfiles + middleware de protección de rutas
3. Layout general: header, buscador, footer, nav móvil, sistema de temas
4. Home + catálogo con filtros + ficha de serie
5. Reproductor con progreso, selector de fuentes y autoplay
6. Mi lista, historial, configuración, calendario
7. Panel de administración completo con el importador
8. Comentarios, valoraciones, reportes y moderación
9. Pulido: SEO, performance, accesibilidad, estados de error y vacío

## FORMATO DE RESPUESTA

- Antes de escribir código en cada fase, mostrame en 5 líneas qué vas a hacer
- Entregá archivos completos, no fragmentos con `...`
- Indicá siempre la ruta exacta de cada archivo
- Al final de cada fase: comandos a ejecutar y qué debería ver funcionando
- Si algo del pedido es ambiguo, elegí la opción más estándar y avisame qué asumiste. No frenes a preguntar

## RESTRICCIONES

- TypeScript estricto, sin `any`
- Componentes chicos y reutilizables, nada de archivos de 800 líneas
- Server Components por defecto, `"use client"` solo donde haga falta
- Nombres de variables y comentarios en español
- No inventes librerías ni APIs que no existan

---

**Nota sobre el contenido:** el sistema debe funcionar tanto con archivos de video propios como con embeds de servidores externos, según cómo se configure `VARIABLES`. La responsabilidad sobre los derechos del material que se cargue en la plataforma es de quien la administra.
