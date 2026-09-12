'use client';

/**
 * EL ÚLTIMO CORTAFUEGOS, y el único que no puede apoyarse en nada.
 *
 * `app/error.tsx` recoge lo que falle DENTRO del layout raíz. Lo que falle
 * en el layout raíz mismo --o en este propio fichero-- no lo recoge nadie
 * más que esto, y por eso Next exige que renderice sus propias etiquetas
 * `<html>` y `<body>`: en ese punto el árbol de arriba no existe.
 *
 * SIN NADA IMPORTADO, A PROPÓSITO. Ni la cabecera, ni el pie, ni la hoja de
 * tokens, ni las tipografías: si el fallo viene de ahí, importarlo aquí es
 * volver a fallar y dejar al visitante con la pantalla en blanco del
 * navegador. Los estilos van en línea y los colores escritos a mano --son
 * los valores reales de --color-paper y --color-ink en los dos temas-- con
 * `prefers-color-scheme` para que la pantalla no deslumbre a quien llegue de
 * noche. Es la única página del sitio que no puede leer `data-theme`, porque
 * el script que lo escribe vive en el layout que acaba de caerse.
 *
 * Hasta aquí no debería llegar nadie. Si llega, lo mínimo es que lo haga en
 * castellano, con el nombre del estudio y con una salida.
 */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="es">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Algo ha fallado — EME Fotografía Sevilla</title>
        <style>{`
          :root { color-scheme: light dark; --papel: #F8F7F2; --tinta: #0B0B0B; --apagado: #6C6C68; }
          @media (prefers-color-scheme: dark) {
            :root { --papel: #141412; --tinta: #F2F1EA; --apagado: #9C9C93; }
          }
          * { box-sizing: border-box; }
          body {
            margin: 0;
            min-height: 100svh;
            display: grid;
            place-items: center;
            padding: 2rem 1.25rem;
            background: var(--papel);
            color: var(--tinta);
            font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
            line-height: 1.6;
          }
          main { max-width: 32rem; text-align: left; }
          h1 { font-family: ui-serif, Georgia, "Times New Roman", serif; font-size: clamp(2rem, 1.4rem + 3vw, 3.25rem); line-height: 1.05; font-weight: 400; margin: 0 0 1rem; }
          p { color: var(--apagado); margin: 0 0 2rem; }
          .acciones { display: flex; flex-wrap: wrap; gap: 1.5rem; align-items: center; }
          button, a {
            font: inherit; font-size: 0.8rem; letter-spacing: 0.12em; text-transform: uppercase;
            color: var(--tinta); background: none; border: 0; padding: 0.5rem 0; cursor: pointer;
            text-decoration: underline; text-underline-offset: 0.4em; text-decoration-thickness: 1px;
          }
          :focus-visible { outline: 2px solid var(--tinta); outline-offset: 4px; }
        `}</style>
      </head>
      <body>
        <main>
          <h1>Algo ha fallado</h1>
          <p>
            No hemos podido cargar la web. Puedes intentarlo otra vez; si sigue sin funcionar,
            escríbenos a info@emefotografiasevilla.com y lo miramos.
          </p>
          <div className="acciones">
            <button type="button" onClick={reset}>Reintentar</button>
            {/* Un <a> de verdad y no <Link>, y la regla se apaga a
                conciencia: <Link> navega por el lado del cliente, o sea que
                reconstruiría el mismo árbol que acaba de caerse y el
                visitante volvería a esta pantalla. Aquí hace falta una
                recarga completa del documento. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/">Volver al inicio</a>
          </div>
        </main>
      </body>
    </html>
  );
}
