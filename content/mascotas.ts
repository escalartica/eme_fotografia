import type { FaqEntry } from './types';

/**
 * Eme & Compañía: la línea de fotografía de mascotas del estudio.
 *
 * Vive en /mascotas dentro de esta misma web y no en un dominio propio: la
 * web ya está indexada y tiene su ficha de Google, y un dominio nuevo
 * empezaría de cero (ver marketing/marca-mascotas en el proyecto).
 *
 * SIN PRECIOS. Las tarifas las decide Eme y todavía no están cerradas; la
 * página dice que se piden por WhatsApp o correo en vez de publicar una cifra
 * que nadie ha firmado.
 *
 * Las redes de la submarca (@emeycompania) no existen todavía, así que no se
 * enlazan. Cuando existan, van aquí.
 */

export interface MascotaFoto {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export const mascotas = {
  route: '/mascotas',
  marca: 'Eme & Compañía',
  metaTitle: 'Fotógrafa de mascotas en Sevilla',
  metaDescription:
    'Eme & Compañía: sesiones de fotos de mascotas en Sevilla (perros, gatos, conejos, caballos y más) con la mirada de una fotógrafa de bodas.',
  heading: 'Fotógrafa de mascotas en Sevilla',
  tagline: 'Retratos de tu animal de compañía, sea cual sea, con la mirada de una fotógrafa de bodas.',
  intro:
    'Eme lleva quince años fotografiando bodas en Sevilla, y en una boda se aprende lo que importa: estar cerca sin molestar, esperar el gesto que no se repite y encontrar la luz buena. Eme & Compañía es exactamente eso, con hocico, bigotes, plumas o crines. Retratos hechos con calma y con humor, y sobre todo la relación entre tu animal y la gente que lo quiere.',
  idealFor:
    'Para quien tiene en casa un perro, un gato, un conejo, un caballo o un loro que es uno más de la familia, y quiere fotos para colgar en la pared, no solo para el móvil.',
  /** Los animales que se nombran en la franja bajo la apertura. */
  animales: ['Perros', 'Gatos', 'Conejos', 'Caballos', 'Aves', 'Hurones', 'Tortugas', 'y el que tengas en casa'],
  frase: 'No hacemos fotos de mascotas. Hacemos retratos de alguien de la familia.',
  banda: {
    src: '/images/mascotas/premio-banda.webp',
    alt: 'Un perro blanco con pañuelo recibe un premio de la mano de su dueño en plena calle',
    pie: 'Un premio, una mano conocida y un segundo de atención: así se consigue la foto.',
  },
  hero: {
    src: '/images/mascotas/retrato-weimaraner.webp',
    alt: 'Retrato de un weimaraner gris mirando a cámara con sus ojos claros',
  },
  sesiones: [
    {
      titulo: 'Retrato',
      texto: 'Tu animal como protagonista absoluto, en un sitio que conozca: su parque, su calle, su sofá o su cuadra.',
    },
    {
      titulo: 'Con su familia',
      texto: 'El animal y la gente que lo quiere. Paseos, juegos y abrazos, sin posados rígidos. Niños incluidos.',
    },
    {
      titulo: 'Exóticos y de granja',
      texto: 'Conejos, hurones, aves, reptiles, caballos o la gallina que manda en el patio. Nos adaptamos a su espacio y a sus manías, y si hace falta venimos con quien mejor lo conoce.',
    },
    {
      titulo: 'Primeros meses y últimos años',
      texto: 'El cachorro que lo destroza todo y el compañero mayor que ya va más despacio. Las dos etapas que más se echan de menos después.',
    },
  ],
  extras: [
    'Vales regalo',
    'Minisesiones de Navidad',
    'Copias impresas y álbum',
  ],
  proceso: [
    {
      titulo: 'Nos lo presentas',
      texto: 'Nos cuentas quién es y cómo es: si es tranquilo o un torbellino, qué le encanta y qué le asusta. Con eso elegimos el sitio y la hora.',
    },
    {
      titulo: 'Sin prisas',
      texto: 'Dejamos que se acostumbre a la cámara y a nosotros. Premios, juguetes, pausas y toda la paciencia del mundo. Sin flashes que lo asusten, y si ese día no está para fotos, se cambia la fecha.',
    },
    {
      titulo: 'La luz justa',
      texto: 'En Sevilla buscamos la primera hora de la mañana o el atardecer: la luz es más bonita y el calor no agobia a nadie, ni a ellos ni a nosotros.',
    },
    {
      titulo: 'Tus fotos',
      texto: 'Recibes las fotos editadas en una galería online privada, para descargar y compartir. Y si las quieres en la pared, te preparamos copias impresas o un álbum.',
    },
  ],
  galeria: [
    { src: '/images/mascotas/labrador-con-capa-navidena.webp', alt: 'Labrador negro con una capa roja de Navidad mirando hacia arriba', width: 1333, height: 2000 },
    { src: '/images/mascotas/salchicha-con-su-duena.webp', alt: 'Perro salchicha con abrigo paseando junto a su dueña por la calle', width: 1334, height: 2000 },
    { src: '/images/mascotas/retrato-con-panuelo.webp', alt: 'Retrato en blanco y negro de un perro blanco con pañuelo de lunares', width: 1333, height: 2000 },
    { src: '/images/mascotas/weimaraner-en-la-cafeteria.webp', alt: 'Weimaraner sentado junto a su dueño en una cafetería', width: 1333, height: 2000 },
    { src: '/images/mascotas/retrato-salchicha-con-abrigo.webp', alt: 'Retrato de un perro salchicha de pelo largo con abrigo de capucha', width: 1334, height: 2000 },
    { src: '/images/mascotas/paseo-por-la-ciudad.webp', alt: 'Un hombre pasea con su perro por una calle, en blanco y negro', width: 1333, height: 2000 },
    { src: '/images/mascotas/salchicha-a-sus-pies.webp', alt: 'Perro salchicha sentado a los pies de su dueño, en blanco y negro', width: 1333, height: 2000 },
    { src: '/images/mascotas/sentado-junto-a-su-dueno.webp', alt: 'Perro con pañuelo sentado junto a su dueño en unos escalones, con una noria al fondo', width: 1333, height: 2000 },
  ] satisfies MascotaFoto[],
};

export const faqsMascotas: FaqEntry[] = [
  {
    id: 'no-se-esta-quieto',
    question: '¿Y si no se está quieto ni un segundo?',
    answer:
      'Mejor. No buscamos un animal de estatua, buscamos al tuyo. Llevamos años fotografiando a gente que corre, baila y se emociona cuando menos te lo esperas, así que estamos acostumbrados a ir detrás de la foto.',
  },
  {
    id: 'que-animales',
    question: '¿Qué animales fotografiáis?',
    answer:
      'Cualquiera con el que vivas: perros, gatos, conejos, hurones, aves, tortugas, caballos... Cada uno tiene su manera de trabajar. A los gatos y a los animales pequeños los fotografiamos en casa, que es donde están tranquilos, y a los caballos en su cuadra o en el campo.',
  },
  {
    id: 'varios',
    question: '¿Pueden salir varios animales juntos?',
    answer:
      'Sí, y suele ser de lo más divertido. Dinos cuántos son y quiénes son para calcular bien el tiempo de la sesión.',
  },
  {
    id: 'donde',
    question: '¿Dónde se hace la sesión?',
    answer:
      'Donde tu animal esté a gusto: en tu casa, en tu barrio, en el campo o en algún rincón de Sevilla y alrededores que os guste, como el Parque de María Luisa, la orilla del río o el Aljarafe.',
  },
  {
    id: 'familia',
    question: '¿Puede salir toda la familia?',
    answer:
      'Claro. Muchas de las mejores fotos son las del animal con los suyos, niños y abuelos incluidos.',
  },
  {
    id: 'precio',
    question: '¿Cuánto cuesta una sesión?',
    answer:
      'Depende del tipo de sesión y de si quieres copias impresas. Escríbenos por WhatsApp o por correo y te mandamos las tarifas sin compromiso.',
  },
  {
    id: 'regalo',
    question: '¿Se puede regalar una sesión?',
    answer:
      'Sí. Preparamos vales regalo para Navidad, cumpleaños o cualquier excusa, y la persona que lo recibe elige la fecha.',
  },
];
