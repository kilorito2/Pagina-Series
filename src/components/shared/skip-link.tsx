/**
 * Link "Saltar al contenido": invisible hasta que recibe foco por teclado
 * (Tab desde el body), para no obligar a pasar por header/nav en cada
 * página. Apunta a `id="main-content"` en el `<main>` de cada layout.
 */
export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only z-50 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
    >
      Saltar al contenido
    </a>
  );
}
