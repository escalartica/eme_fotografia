/**
 * LA FLECHA DE LAS LLAMADAS A LA ACCIÓN, DIBUJADA Y NO ESCRITA.
 *
 * Aquí había caracteres: `↗` (U+2197) en dieciocho sitios, `→` en dos y `↓`
 * en dos más. En un iPhone eso no es una flecha, es un emoji a color: ninguna
 * de las dos tipografías del sitio trae esos glifos, así que iOS recorre la
 * cadena de reserva y termina en Apple Color Emoji. El estudio lo vio en su
 * propio teléfono y lo dijo con todas las letras: «es una flecha de emoji,
 * queda horrible».
 *
 * Un SVG no depende de que ninguna fuente traiga el carácter: se ve igual en
 * todos los teléfonos, hereda el color del texto (`currentColor`) y se mide
 * en `em`, así que sigue al cuerpo de letra del enlace que la lleva sin un
 * solo número a mano.
 *
 * El `<span>` de fuera se conserva con su clase de siempre porque de él
 * dependen dos cosas escritas en otro sitio: la animación de bucle de
 * `.arrowLink .arrow` (styles/layout.css) y los estados propios de algunos
 * módulos, que pasan aquí su propia clase.
 */
const TRAZOS = {
  // Nordeste: la de "esto abre algo".
  ne: (
    <>
      <path d="M7 17 17 7" />
      <path d="M9 7h8v8" />
    </>
  ),
  right: (
    <>
      <path d="M4 12h15" />
      <path d="m13 6 6 6-6 6" />
    </>
  ),
  down: (
    <>
      <path d="M12 4v15" />
      <path d="m6 13 6 6 6-6" />
    </>
  ),
  up: (
    <>
      <path d="M12 20V5" />
      <path d="m6 11 6-6 6 6" />
    </>
  ),
  left: (
    <>
      <path d="M20 12H5" />
      <path d="m11 6-6 6 6 6" />
    </>
  ),
} as const;

export function ArrowGlyph({
  dir = 'ne',
  className = 'arrow',
}: {
  dir?: keyof typeof TRAZOS;
  /** La clase del envoltorio. Por defecto la global `arrow`, de la que
   *  cuelga la animación de bucle; los módulos con estados propios pasan
   *  la suya (`styles.rowArrow`, `styles.arrow`...). */
  className?: string;
}) {
  return (
    <span className={className} aria-hidden="true">
      <svg
        className="arrowGlyph"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        focusable="false"
      >
        {TRAZOS[dir]}
      </svg>
    </span>
  );
}
