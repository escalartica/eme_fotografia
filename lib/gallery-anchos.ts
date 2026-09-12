/**
 * LOS ANCHOS A LOS QUE SE SIRVE UNA FOTO DE GALERÍA PRIVADA.
 *
 * Cuatro números y una función de una línea, en su propio fichero, y el
 * motivo es de arquitectura, no de orden: esta lista la necesitan LOS DOS
 * LADOS. El servidor, para decidir qué copia generar (lib/gallery-derivatives)
 * y para validar el `?w=` de la URL (app/[slug]/photo/[filename]); y el
 * navegador, para escribir el `srcSet` de cada miniatura
 * (lib/gallery-srcset, que usan dos componentes de cliente).
 *
 * Vivían dentro de gallery-derivatives, y eso reventaba la compilación de
 * producción: al importarlos, un componente de cliente se traía por detrás
 * `node:fs`, `node:path`, el almacén de galerías y sharp --un binario
 * nativo-- al paquete del NAVEGADOR. Turbopack lo corta con un
 * «Can't resolve 'child_process'», que es un mensaje que no se parece en
 * nada a la causa.
 *
 * La regla que esto fija: un módulo que toca el sistema de ficheros no puede
 * ser la fuente de una constante que necesita el cliente. La constante se
 * saca; el módulo pesado se queda donde está.
 *
 * ANCHOS CERRADOS, no un número libre de la URL. Un `?w=` abierto es una
 * invitación a pedir diez mil redimensionados distintos de la misma foto y
 * llenar el disco (y la CPU) de un servidor pequeño. Esta lista cubre lo que
 * la interfaz pide de verdad: la casilla a 1x y a 2x, y el visor a pantalla
 * completa en una pantalla normal y en una retina.
 */
export const ANCHOS = [400, 800, 1600, 2400] as const;
export type Ancho = (typeof ANCHOS)[number];

export function esAnchoValido(valor: string | null): valor is `${Ancho}` {
  return valor !== null && (ANCHOS as readonly number[]).includes(Number(valor));
}
