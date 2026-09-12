/**
 * Seed de datos de ejemplo: géneros, ~15 series con temporadas/episodios/
 * fuentes de video, y un usuario admin con un perfil.
 *
 * Uso: npm run db:seed
 */
import { PrismaClient, type Clasificacion, type EstadoSerie, type TipoSerie } from "@prisma/client";
import bcrypt from "bcryptjs";
import { slugify } from "../src/lib/slug";

const prisma = new PrismaClient();

// URLs de placeholder: picsum.photos genera una imagen distinta y estable
// por cada "seed" de texto. Reemplazar por el importador o subida manual
// desde el panel una vez que haya contenido real.
const poster = (slug: string) => `https://picsum.photos/seed/${slug}-poster/400/600`;
const banner = (slug: string) => `https://picsum.photos/seed/${slug}-banner/1600/500`;
const thumb = (slug: string, n: number) => `https://picsum.photos/seed/${slug}-ep${n}/480/270`;

type SerieSeed = {
  titulo: string;
  tituloAlternativo?: string;
  tituloOriginal?: string;
  anio: number;
  estado: EstadoSerie;
  tipo: TipoSerie;
  clasificacion: Clasificacion;
  estudio: string;
  sinopsis: string;
  generos: string[];
  destacada?: boolean;
  temporadas: { numero: number; episodios: number }[];
};

const GENEROS = [
  "Acción",
  "Aventura",
  "Comedia",
  "Drama",
  "Fantasía",
  "Romance",
  "Ciencia Ficción",
  "Terror",
  "Slice of Life",
  "Deporte",
  "Sobrenatural",
  "Misterio",
];

const SERIES: SerieSeed[] = [
  {
    titulo: "Ataque a los Titanes",
    tituloAlternativo: "Attack on Titan",
    tituloOriginal: "Shingeki no Kyojin",
    anio: 2013,
    estado: "FINALIZADO",
    tipo: "TV",
    clasificacion: "PG13",
    estudio: "MAPPA",
    sinopsis:
      "La humanidad sobrevive encerrada tras murallas gigantes que la protegen de titanes devoradores de hombres, hasta que un titán colosal derriba la primera defensa.",
    generos: ["Acción", "Drama", "Fantasía"],
    destacada: true,
    temporadas: [{ numero: 1, episodios: 12 }],
  },
  {
    titulo: "Cazador de Demonios",
    tituloAlternativo: "Demon Slayer",
    tituloOriginal: "Kimetsu no Yaiba",
    anio: 2019,
    estado: "EMISION",
    tipo: "TV",
    clasificacion: "PG13",
    estudio: "Ufotable",
    sinopsis:
      "Tras la masacre de su familia a manos de un demonio, un joven se convierte en cazador de demonios para vengarlos y curar a su hermana convertida en uno.",
    generos: ["Acción", "Sobrenatural", "Fantasía"],
    destacada: true,
    temporadas: [{ numero: 1, episodios: 10 }],
  },
  {
    titulo: "Jujutsu Kaisen",
    tituloOriginal: "Jujutsu Kaisen",
    anio: 2020,
    estado: "EMISION",
    tipo: "TV",
    clasificacion: "PG13",
    estudio: "MAPPA",
    sinopsis:
      "Un estudiante se traga un dedo maldito para salvar a sus amigos y termina compartiendo cuerpo con una entidad maligna, uniéndose a una escuela secreta de hechiceros.",
    generos: ["Acción", "Sobrenatural"],
    destacada: true,
    temporadas: [{ numero: 1, episodios: 12 }],
  },
  {
    titulo: "Mi Héroe Académico",
    tituloAlternativo: "My Hero Academia",
    tituloOriginal: "Boku no Hero Academia",
    anio: 2016,
    estado: "EMISION",
    tipo: "TV",
    clasificacion: "PG",
    estudio: "Bones",
    sinopsis:
      "En un mundo donde casi todos nacen con un superpoder, un chico sin ninguno sueña con ser el héroe número uno.",
    generos: ["Acción", "Aventura", "Comedia"],
    temporadas: [{ numero: 1, episodios: 13 }],
  },
  {
    titulo: "One Piece",
    tituloOriginal: "One Piece",
    anio: 1999,
    estado: "EMISION",
    tipo: "TV",
    clasificacion: "PG",
    estudio: "Toei Animation",
    sinopsis:
      "Un joven pirata de goma zarpa en busca del tesoro legendario One Piece para convertirse en el próximo Rey de los Piratas.",
    generos: ["Aventura", "Comedia", "Acción"],
    temporadas: [{ numero: 1, episodios: 8 }],
  },
  {
    titulo: "Naruto",
    tituloOriginal: "Naruto",
    anio: 2002,
    estado: "FINALIZADO",
    tipo: "TV",
    clasificacion: "PG13",
    estudio: "Studio Pierrot",
    sinopsis:
      "Un ninja adolescente con un zorro de nueve colas sellado en su interior sueña con convertirse en el líder de su aldea.",
    generos: ["Acción", "Aventura"],
    temporadas: [{ numero: 1, episodios: 10 }],
  },
  {
    titulo: "Death Note",
    tituloOriginal: "Death Note",
    anio: 2006,
    estado: "FINALIZADO",
    tipo: "TV",
    clasificacion: "PG13",
    estudio: "Madhouse",
    sinopsis:
      "Un estudiante brillante encuentra un cuaderno capaz de matar a cualquiera cuyo nombre se escriba en él, y decide usarlo para purgar el crimen del mundo.",
    generos: ["Misterio", "Sobrenatural", "Drama"],
    destacada: true,
    temporadas: [{ numero: 1, episodios: 12 }],
  },
  {
    titulo: "Fullmetal Alchemist: Brotherhood",
    tituloOriginal: "Hagane no Renkinjutsushi",
    anio: 2009,
    estado: "FINALIZADO",
    tipo: "TV",
    clasificacion: "PG13",
    estudio: "Bones",
    sinopsis:
      "Dos hermanos alquimistas buscan la Piedra Filosofal para recuperar lo que perdieron en un ritual prohibido que salió mal.",
    generos: ["Acción", "Fantasía", "Drama"],
    temporadas: [{ numero: 1, episodios: 12 }],
  },
  {
    titulo: "Steins;Gate",
    tituloOriginal: "Steins;Gate",
    anio: 2011,
    estado: "FINALIZADO",
    tipo: "TV",
    clasificacion: "PG13",
    estudio: "White Fox",
    sinopsis:
      "Un grupo de amigos descubre accidentalmente cómo enviar mensajes al pasado, desatando consecuencias que amenazan con destruir la línea temporal.",
    generos: ["Ciencia Ficción", "Drama", "Misterio"],
    temporadas: [{ numero: 1, episodios: 10 }],
  },
  {
    titulo: "Violet Evergarden",
    tituloOriginal: "Violet Evergarden",
    anio: 2018,
    estado: "FINALIZADO",
    tipo: "TV",
    clasificacion: "PG",
    estudio: "Kyoto Animation",
    sinopsis:
      "Una ex soldado se convierte en escribiente de cartas para entender el significado de las últimas palabras que le dijo la persona que amaba.",
    generos: ["Drama", "Romance", "Slice of Life"],
    temporadas: [{ numero: 1, episodios: 8 }],
  },
  {
    titulo: "Spy x Family",
    tituloOriginal: "Spy x Family",
    anio: 2022,
    estado: "EMISION",
    tipo: "TV",
    clasificacion: "PG",
    estudio: "Wit Studio / CloverWorks",
    sinopsis:
      "Un espía de élite arma una familia falsa para una misión, sin saber que su nueva hija es telépata y su esposa, una asesina.",
    generos: ["Comedia", "Acción"],
    destacada: true,
    temporadas: [{ numero: 1, episodios: 12 }],
  },
  {
    titulo: "Chainsaw Man",
    tituloOriginal: "Chainsaw Man",
    anio: 2022,
    estado: "FINALIZADO",
    tipo: "TV",
    clasificacion: "R",
    estudio: "MAPPA",
    sinopsis:
      "Un joven que fusiona su cuerpo con un demonio motosierra se convierte en cazador de demonios para pagar las deudas de su difunto padre.",
    generos: ["Acción", "Terror"],
    temporadas: [{ numero: 1, episodios: 12 }],
  },
  {
    titulo: "Tu Mentira en Abril",
    tituloAlternativo: "Your Lie in April",
    tituloOriginal: "Shigatsu wa Kimi no Uso",
    anio: 2014,
    estado: "FINALIZADO",
    tipo: "TV",
    clasificacion: "PG",
    estudio: "A-1 Pictures",
    sinopsis:
      "Un pianista que dejó de escuchar su propia música conoce a una violinista excéntrica que le devuelve el color a su vida.",
    generos: ["Drama", "Romance", "Slice of Life"],
    temporadas: [{ numero: 1, episodios: 11 }],
  },
  {
    titulo: "Re:Zero",
    tituloOriginal: "Re:Zero kara Hajimeru Isekai Seikatsu",
    anio: 2016,
    estado: "EMISION",
    tipo: "TV",
    clasificacion: "PG13",
    estudio: "White Fox",
    sinopsis:
      "Un joven es transportado a otro mundo y descubre que puede regresar en el tiempo cada vez que muere, condenado a repetir su propia muerte.",
    generos: ["Fantasía", "Drama", "Misterio"],
    temporadas: [{ numero: 1, episodios: 12 }],
  },
  {
    titulo: "Frieren: El Adiós del Viaje",
    tituloAlternativo: "Frieren: Beyond Journey's End",
    tituloOriginal: "Sousou no Frieren",
    anio: 2023,
    estado: "EMISION",
    tipo: "TV",
    clasificacion: "PG",
    estudio: "Madhouse",
    sinopsis:
      "Una elfa maga que vivió siglos junto a un grupo de héroes emprende un nuevo viaje tras la muerte de sus compañeros, aprendiendo a entender el tiempo humano.",
    generos: ["Aventura", "Fantasía", "Drama"],
    destacada: true,
    temporadas: [{ numero: 1, episodios: 9 }],
  },
];

async function main() {
  console.log("🌱 Sembrando base de datos...");

  // --- Géneros --------------------------------------------------------
  const generosPorNombre = new Map<string, string>();
  for (const nombre of GENEROS) {
    const genero = await prisma.genero.upsert({
      where: { nombre },
      update: {},
      create: { nombre, slug: slugify(nombre) },
    });
    generosPorNombre.set(nombre, genero.id);
  }
  console.log(`  ✔ ${GENEROS.length} géneros`);

  // --- Series, temporadas, episodios, fuentes -------------------------
  for (const s of SERIES) {
    const slug = slugify(s.titulo);

    const serie = await prisma.serie.upsert({
      where: { slug },
      update: {},
      create: {
        titulo: s.titulo,
        tituloAlternativo: s.tituloAlternativo,
        tituloOriginal: s.tituloOriginal,
        slug,
        sinopsis: s.sinopsis,
        poster: poster(slug),
        banner: banner(slug),
        anio: s.anio,
        estado: s.estado,
        tipo: s.tipo,
        clasificacion: s.clasificacion,
        estudio: s.estudio,
        ratingPromedio: Math.round((7 + Math.random() * 2.5) * 10) / 10,
        vistas: Math.floor(Math.random() * 50_000),
        destacada: s.destacada ?? false,
        generos: {
          create: s.generos.map((nombre) => ({
            genero: { connect: { id: generosPorNombre.get(nombre)! } },
          })),
        },
      },
    });

    for (const t of s.temporadas) {
      const temporada = await prisma.temporada.upsert({
        where: { serieId_numero: { serieId: serie.id, numero: t.numero } },
        update: {},
        create: {
          serieId: serie.id,
          numero: t.numero,
          titulo: `Temporada ${t.numero}`,
          anio: s.anio,
        },
      });

      for (let n = 1; n <= t.episodios; n++) {
        const episodio = await prisma.episodio.upsert({
          where: { temporadaId_numero: { temporadaId: temporada.id, numero: n } },
          update: {},
          create: {
            temporadaId: temporada.id,
            numero: n,
            titulo: `Episodio ${n}`,
            sinopsis: `Sinopsis de ejemplo del episodio ${n} de ${s.titulo}.`,
            duracionMin: 24,
            thumbnail: thumb(slug, n),
            fechaEmision: new Date(s.anio, 0, n * 7),
            vistas: Math.floor(Math.random() * 5_000),
            fuentes: {
              create: [
                {
                  servidor: "ServidorUno",
                  url: `https://embed.example.com/${slug}/${t.numero}/${n}?lang=sub`,
                  calidad: "P1080",
                  idioma: "SUB",
                },
                {
                  servidor: "ServidorDos",
                  url: `https://embed.example.com/${slug}/${t.numero}/${n}?lang=dub&q=720`,
                  calidad: "P720",
                  idioma: "DUB",
                },
              ],
            },
          },
        });
        void episodio;
      }
    }

    console.log(`  ✔ ${s.titulo} (${s.temporadas.reduce((a, t) => a + t.episodios, 0)} episodios)`);
  }

  // --- Usuario admin + perfil ------------------------------------------
  const passwordHash = await bcrypt.hash("Admin123!", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@animeverse.app" },
    update: {},
    create: {
      email: "admin@animeverse.app",
      passwordHash,
      role: "ADMIN",
      emailVerified: new Date(),
      perfiles: {
        create: {
          nombre: "Admin",
          avatar: "https://picsum.photos/seed/avatar-admin/200/200",
          idiomaPreferido: "SUB",
          calidadPorDefecto: "P1080",
        },
      },
    },
  });
  console.log(`  ✔ Usuario admin: ${admin.email} / contraseña: Admin123!`);

  console.log("✅ Seed completo.");
}

main()
  .catch((error) => {
    console.error("❌ Error al sembrar:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
