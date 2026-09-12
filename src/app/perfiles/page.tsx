import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/lib/config";
import { SelectorPerfiles } from "./selector-perfiles";

export const metadata: Metadata = { title: "¿Quién está mirando?" };

export default async function PerfilesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/perfiles");

  const perfiles = await prisma.profile.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-10 px-4 py-16">
      <h1 className="text-center text-2xl font-semibold sm:text-3xl">¿Quién está mirando?</h1>
      <SelectorPerfiles
        perfiles={perfiles}
        maxPerfiles={siteConfig.maxPerfilesPorCuenta}
      />
    </div>
  );
}
