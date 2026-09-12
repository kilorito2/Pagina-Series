import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/lib/auth.config";
import { loginSchema } from "@/lib/validaciones/auth";
import { verificarRateLimit, obtenerIp } from "@/lib/rate-limit";

class CredencialesInvalidas extends CredentialsSignin {
  code = "credenciales_invalidas";
}
class CuentaBaneada extends CredentialsSignin {
  code = "cuenta_baneada";
}
class DemasiadosIntentos extends CredentialsSignin {
  code = "demasiados_intentos";
}
class EmailNoVerificado extends CredentialsSignin {
  code = "email_no_verificado";
}

const googleConfigurado = Boolean(
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
);

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials, request) {
        const parseado = loginSchema.safeParse(credentials);
        if (!parseado.success) throw new CredencialesInvalidas();
        const { email, password } = parseado.data;

        const ip = obtenerIp(request);
        const { permitido } = await verificarRateLimit("login", `${ip}:${email}`, {
          puntos: 5,
          duracionSeg: 60,
        });
        if (!permitido) throw new DemasiadosIntentos();

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.passwordHash) throw new CredencialesInvalidas();
        if (user.baneado) throw new CuentaBaneada();

        const passwordOk = await bcrypt.compare(password, user.passwordHash);
        if (!passwordOk) throw new CredencialesInvalidas();
        if (!user.emailVerified) throw new EmailNoVerificado();

        return { id: user.id, email: user.email, role: user.role };
      },
    }),
    ...(googleConfigurado
      ? [
          Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = user.role;
        token.chequeadoEn = Date.now();
        return token;
      }

      // "Cerrar sesión en todos los dispositivos" con estrategia JWT: no hay
      // sesión en la base para borrar, así que revalidamos contra
      // `sesionesInvalidadasEn` cada 5 minutos (no en cada request, para no
      // pegarle a la base todo el tiempo). El costo es que un dispositivo
      // desconectado puede tardar hasta 5 minutos en enterarse.
      const REVALIDAR_CADA_MS = 5 * 60 * 1000;
      const chequeadoEn = typeof token.chequeadoEn === "number" ? token.chequeadoEn : 0;
      if (Date.now() - chequeadoEn < REVALIDAR_CADA_MS) {
        return token;
      }

      const usuario = await prisma.user.findUnique({
        where: { id: token.id as string },
        select: { baneado: true, sesionesInvalidadasEn: true },
      });

      const emitidoEn = typeof token.iat === "number" ? token.iat : 0;
      const invalidado =
        !usuario ||
        usuario.baneado ||
        (usuario.sesionesInvalidadasEn && usuario.sesionesInvalidadasEn.getTime() / 1000 > emitidoEn);

      if (invalidado) return null;

      token.chequeadoEn = Date.now();
      return token;
    },
    async signIn({ user, account }) {
      // Login con Google: si ya existe una cuenta de credenciales con ese
      // email, el PrismaAdapter la vincula solo. Solo bloqueamos baneados.
      if (account?.provider === "google") {
        const existente = await prisma.user.findUnique({
          where: { email: user.email! },
          select: { baneado: true },
        });
        if (existente?.baneado) return false;
      }
      return true;
    },
  },
});
