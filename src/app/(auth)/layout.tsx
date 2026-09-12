import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Logo } from "@/components/shared/logo";

// Login/registro/recuperar no aportan nada indexados.
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4 py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,color-mix(in_oklch,var(--primary),transparent_82%),transparent)]"
      />
      <Logo className="relative z-10 mb-8" />
      <div className="relative z-10 w-full max-w-sm">{children}</div>
    </div>
  );
}
