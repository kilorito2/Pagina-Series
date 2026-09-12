import type { Metadata } from "next";
import type { ReactNode } from "react";

// Selector de perfiles: específico de cada cuenta, no debe indexarse.
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function PerfilesLayout({ children }: { children: ReactNode }) {
  return children;
}
