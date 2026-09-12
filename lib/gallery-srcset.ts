/**
 * Los `srcSet`/`sizes` de las fotos de galería privada, en un solo sitio.
 *
 * Van aquí y no escritos a mano en cada componente porque son tres cadenas
 * que tienen que decir lo mismo en la vista de la pareja y en la del panel:
 * la casilla de la cuadrícula mide lo mismo en las dos (el CSS de ambas parte
 * de `repeat(auto-fill, minmax(15rem, 1fr))`, 11rem en móvil), y una copia
 * desincronizada no da un error, da una foto borrosa que nadie relaciona con
 * esto.
 */
// Del fichero LIGERO, no de gallery-derivatives: este módulo lo usan dos
// componentes de cliente, y gallery-derivatives arrastra `fs` y sharp.
import { ANCHOS } from '@/lib/gallery-anchos';

function url(slug: string, filename: string, ancho: number): string {
  return `/${slug}/photo/${filename}?w=${ancho}`;
}

/** Miniatura de la cuadrícula. */
export function srcSetMiniatura(slug: string, filename: string): { src: string; srcSet: string; sizes: string } {
  return {
    // 800 como `src` suelto: es el que sirve a la casilla más grande en una
    // pantalla normal, y es lo que recibe un navegador que ignore el srcSet.
    src: url(slug, filename, 800),
    srcSet: [400, 800, 1600].map((a) => `${url(slug, filename, a)} ${a}w`).join(', '),
    // La casilla nunca pasa de ~360 px: `auto-fill` con `minmax(15rem, 1fr)`
    // mete otra columna antes de dejar crecer más las que hay.
    sizes: '(max-width: 700px) 45vw, 360px',
  };
}

/** Visor a pantalla completa. */
export function srcSetVisor(slug: string, filename: string): { src: string; srcSet: string; sizes: string } {
  return {
    src: url(slug, filename, 1600),
    srcSet: [800, 1600, 2400].map((a) => `${url(slug, filename, a)} ${a}w`).join(', '),
    // El visor está topado a 1200px (components/motion/Lightbox.module.css),
    // así que 2400 es el escalón más alto que llega a servir para algo: el de
    // una pantalla retina. Declarar `100vw` a secas pediría el original.
    sizes: '(max-width: 1200px) 100vw, 1200px',
  };
}

export { ANCHOS };
