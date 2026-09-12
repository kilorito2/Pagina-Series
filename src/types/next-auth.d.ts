import type { RolUsuario } from "@prisma/client";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: RolUsuario;
    } & DefaultSession["user"];
  }

  interface User {
    role: RolUsuario;
  }
}

// "next-auth/jwt" solo reexporta `JWT` con `export *`, así que la
// declaración original (la que hay que aumentar) vive en @auth/core/jwt.
declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: RolUsuario;
    /** Timestamp (ms) de la última vez que se revalidó contra la base
     * (baneo / "cerrar sesión en todos los dispositivos"). Ver lib/auth.ts. */
    chequeadoEn?: number;
  }
}
