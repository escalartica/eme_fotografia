/**
 * LA SELECCIÓN: fotografías de bodas que no tienen ficha propia en /trabajos.
 * ---------------------------------------------------------------------
 * Salen de la carpeta que el propio equipo tenía seleccionada para su perfil
 * de Bodas.net, y son de parejas cuyo reportaje no está publicado entero en
 * esta web. Por eso NO viven en `content/projects.ts` ni bajo
 * `/images/trabajos/<slug>/`: colgarlas de una ficha ajena diría que son de
 * una boda que no son, y una ficha de /trabajos publica el reportaje
 * completo de UNA sola boda, que es justo lo que distingue a esta web de sus
 * competidoras.
 *
 * Su sitio son las superficies de muestra -- la tira de «Nuestra mirada» y
 * las galerías de servicio --, donde lo que se enseña es la mirada del
 * equipo y no un reportaje concreto.
 *
 * Todas están medidas igual que el resto del archivo: 1600 px de lado largo,
 * WebP, calidad 82. `width` y `height` son los reales del fichero, para que
 * no haya salto de maquetación al cargar.
 *
 * Consentimiento: el cliente confirmó que todas las personas que aparecen en
 * las fotografías de esta web firmaron el suyo.
 */
export type FotoSeleccion = {
  slug: string;
  src: string;
  alt: string;
  width: number;
  height: number;
};

export const seleccion: FotoSeleccion[] = [
  {
    slug: 'perro-bajo-las-sillas',
    src: '/images/seleccion/perro-bajo-las-sillas.webp',
    alt: 'Un perro tumbado bajo las sillas de la ceremonia, entre los pies de los invitados, en blanco y negro',
    width: 2560,
    height: 1707,
  },
  {
    slug: 'nino-en-el-suelo',
    src: '/images/seleccion/nino-en-el-suelo.webp',
    alt: 'Un niño tirado en el suelo de la calle mientras los novios y los invitados salen de la iglesia detrás',
    width: 1707,
    height: 2560,
  },
  {
    slug: 'paraguas-bajo-la-lluvia',
    src: '/images/seleccion/paraguas-bajo-la-lluvia.webp',
    alt: 'Un invitado sujetando el paraguas sobre la novia bajo la lluvia, junto al coche, en blanco y negro',
    width: 1707,
    height: 2560,
  },
  {
    slug: 'velo-ante-los-faros',
    src: '/images/seleccion/velo-ante-los-faros.webp',
    alt: 'Los novios besándose bajo el velo, iluminados por los faros de un coche clásico de noche',
    width: 1707,
    height: 2560,
  },
  {
    slug: 'velo-al-viento-bajo-el-arbol',
    src: '/images/seleccion/velo-al-viento-bajo-el-arbol.webp',
    alt: 'Los novios abrazados bajo un árbol desnudo con el velo extendido por el viento sobre la hierba',
    width: 2560,
    height: 1707,
  },
  {
    slug: 'beso-en-la-carretera',
    src: '/images/seleccion/beso-en-la-carretera.webp',
    alt: 'Los novios besándose sentados en mitad de una carretera vacía al atardecer, con la cola del vestido extendida',
    width: 1707,
    height: 2560,
  },
  {
    slug: 'las-manos-con-los-anillos',
    src: '/images/seleccion/las-manos-con-los-anillos.webp',
    alt: 'Las manos de los novios abiertas una junto a otra, con las alianzas y los tatuajes de las muñecas, en blanco y negro',
    width: 2560,
    height: 1707,
  },
  {
    slug: 'la-novia-en-el-espejo',
    src: '/images/seleccion/la-novia-en-el-espejo.webp',
    alt: 'Reflejo de la novia y su padre en un espejo ovalado de la habitación, en blanco y negro',
    width: 1707,
    height: 2560,
  },
  {
    slug: 'retrato-junto-a-la-ventana',
    src: '/images/seleccion/retrato-junto-a-la-ventana.webp',
    alt: 'La novia en bata, mirando a cámara junto a la ventana de la habitación mientras se prepara',
    width: 1707,
    height: 2560,
  },
  {
    slug: 'la-pareja-ante-la-ermita',
    src: '/images/seleccion/la-pareja-ante-la-ermita.webp',
    alt: 'Los novios caminando hacia la ermita blanca entre los árboles, vistos a través de las hojas',
    width: 2560,
    height: 1707,
  },
];

/** Busca por slug y falla pronto si alguien renombra un fichero. */
export function foto(slug: string): FotoSeleccion {
  const found = seleccion.find((f) => f.slug === slug);
  if (!found) throw new Error(`No existe la foto de selección "${slug}" (content/seleccion.ts)`);
  return found;
}
