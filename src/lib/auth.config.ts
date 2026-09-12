import type { NextAuthConfig } from "next-auth";

/**
 * Config "edge-safe": sin Prisma, sin bcrypt, sin nada Node-only. Es lo
 * único que puede importar el middleware (corre en el Edge runtime).
 * `auth.ts` extiende esto agregando los providers y el adapter.
 */
export const authConfig = {
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: { strategy: "jwt" },
  // Necesario fuera de Vercel (Docker, VPS, etc.) para que Auth.js confíe
  // en el header Host en vez de exigir AUTH_URL exacto.
  trustHost: true,
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
