import Link from 'next/link';
import styles from './VolverA.module.css';
import { ArrowGlyph } from '@/components/ui/ArrowGlyph';

/**
 * La vuelta al índice del que cuelga una página.
 *
 * POR QUÉ EXISTE. Este sitio decidió en su día no poner migas de pan («con dos
 * niveles serían mobiliario»), y la consecuencia fue que desde la ficha de una
 * boda no había NINGUNA forma de volver al listado sin usar el botón atrás del
 * navegador o subir a buscar el menú. En una web que invita a recorrer
 * veintiocho reportajes, eso convierte cada ficha en un callejón: quien entra
 * desde Google a una boda concreta no tiene por dónde seguir.
 *
 * No es una miga de pan. Una miga enseña la ruta entera («Inicio / Trabajos /
 * Virginia y Jorge»), y en dos niveles eso sigue siendo mobiliario. Esto es una
 * sola cosa: el sitio del que se viene, con la flecha apuntando hacia atrás. El
 * marcado de `BreadcrumbList` para Google se sigue emitiendo por separado, que
 * es donde sí sirve.
 *
 * EL NOMBRE ACCESIBLE SE ESCRIBE, NO SE COMPONE. La primera versión montaba
 * «Volver a » en un `.sr-only` y dejaba que el nombre saliera de concatenar ese
 * trozo con el texto visible. Funcionaba en el navegador y no en las pruebas, y
 * ésa es razón suficiente para no hacerlo: un nombre accesible que depende de
 * cómo se peguen tres nodos de texto es frágil en los dos sitios. Con
 * `aria-label` el nombre es exactamente el que se declara, y sigue conteniendo
 * el texto visible -- que es lo que pide el criterio «etiqueta en el nombre»
 * para quien maneja el sitio por voz.
 */
export function VolverA({ href, nombre }: { href: string; nombre: string }) {
  return (
    <Link href={href} className={styles.volver} aria-label={`Volver a ${nombre}`}>
      <ArrowGlyph dir="left" className={styles.flecha} />
      {nombre}
    </Link>
  );
}
