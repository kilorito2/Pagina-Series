"use client";

import { useState } from "react";

export function Sinopsis({ texto }: { texto: string }) {
  const [expandida, setExpandida] = useState(false);
  const esLarga = texto.length > 260;

  return (
    <div>
      <p className={expandida || !esLarga ? "text-sm text-muted-foreground" : "line-clamp-3 text-sm text-muted-foreground"}>
        {texto}
      </p>
      {esLarga && (
        <button
          type="button"
          onClick={() => setExpandida((v) => !v)}
          className="mt-1 text-sm font-medium text-primary hover:underline"
        >
          {expandida ? "Leer menos" : "Leer más"}
        </button>
      )}
    </div>
  );
}
