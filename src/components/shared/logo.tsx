import Link from "next/link";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/lib/config";

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        "group/logo inline-flex items-center gap-2 rounded-lg text-xl font-bold tracking-tight text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className
      )}
    >
      <span className="relative flex size-8 items-center justify-center overflow-hidden rounded-lg bg-primary text-primary-foreground transition-transform duration-300 ease-out-fuerte puntero-fino:group-hover/logo:-rotate-6 puntero-fino:group-hover/logo:scale-105">
        {/* Barrido de luz al pasar el mouse. Es un elemento único en la página
            y se ve poco, así que acá sí entra algo de deleite. */}
        <span
          aria-hidden
          className="absolute inset-y-0 -left-full w-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-500 ease-out-fuerte puntero-fino:group-hover/logo:translate-x-[200%]"
        />
        <span className="relative">あ</span>
      </span>
      <span>{siteConfig.nombre}</span>
    </Link>
  );
}
