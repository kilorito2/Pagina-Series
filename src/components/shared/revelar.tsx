"use client";

import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Aparición al entrar en viewport (fade + subida corta). El estilo vive en
 * `globals.css` (`[data-revelar]`), acá sólo va el disparador.
 *
 * Se revela una única vez: repetir la animación al volver a scrollear hacia
 * arriba es ruido, no información.
 */
export function Revelar({
  children,
  className,
  /** Retraso en ms. Para escalonar una grilla; mantenerlo por debajo de ~300ms. */
  retraso = 0,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  retraso?: number;
  as?: ElementType;
}) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const nodo = ref.current;
    // Sin soporte de IntersectionObserver (o si el nodo no existe) mostramos
    // el contenido igual: nunca se puede quedar en opacity 0.
    if (!nodo || typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entrada]) => {
        if (entrada?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      // rootMargin negativo abajo: la fila arranca cuando ya entró de verdad,
      // no cuando asoma 1px. El margen superior positivo evita que el
      // contenido que ya está en pantalla al cargar quede esperando.
      { rootMargin: "120px 0px -10% 0px", threshold: 0 }
    );
    observer.observe(nodo);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      data-revelar=""
      data-visible={visible ? "true" : "false"}
      style={retraso ? ({ "--revelar-delay": `${retraso}ms` } as React.CSSProperties) : undefined}
      className={cn(className)}
    >
      {children}
    </Tag>
  );
}
