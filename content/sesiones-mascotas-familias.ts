import type { FaqEntry } from './types';

/**
 * Sesiones solidarias de mascotas y de familias con mascotas, de Eme &
 * Compañía (/mascotas/sesiones-mascotas-y-familias).
 *
 * Es la primera página de un embudo de venta: la oferta de entrada de la
 * línea de mascotas. Se reserva por WhatsApp porque es por donde llegan hoy
 * las consultas y todavía no hay CRM que conteste correos automáticos.
 *
 * NOMBRE: Eme no quiere que se presenten como «sesiones de Navidad» sino
 * como sesiones de mascotas y de familias con mascotas (16-11-2026). La
 * página vivió unas horas en /mascotas/navidad; next.config.mjs redirige
 * esa dirección aquí.
 *
 * SEO: /mascotas compite por «fotógrafa de mascotas Sevilla»; esta página
 * va a por las búsquedas de familia («fotos de familia con perro Sevilla»,
 * «sesión de fotos con mi mascota») y por lo que la distingue, que es la
 * parte solidaria. No repetir aquí el título de /mascotas.
 *
 * SIN CIFRAS NI FECHAS INVENTADAS. Fechas, sitio, duración y precio los
 * decide Eme; mientras sean `null`, la página no los pinta y la llamada es a
 * escribir. Rellenar un campo aquí lo publica.
 *
 * Lo solidario se cuenta sin cantidades, por decisión de charo (16-11-2026):
 * con estas sesiones se colabora con Pelos y Señales, en beneficio de los
 * perros de protectora. Si un día se fija una cantidad, va en `donativo`.
 */
export const sesionesMascotasFamilias = {
  route: '/mascotas/sesiones-mascotas-y-familias',
  marca: 'Eme & Compañía · Sesiones solidarias',
  // 39 + 17 de plantilla = 56 caracteres servidos.
  metaTitle: 'Fotos de mascotas y familias en Sevilla',
  metaDescription:
    'Sesiones de fotos de tu mascota, sola o con su familia, en Sevilla. Con la mirada de una fotógrafa de bodas, y cada sesión colabora con Pelos y Señales.',
  heading: 'Sesiones de mascotas y familias con mascotas',
  tagline: 'Tu animal, solo o con los suyos, retratado con calma. Y con cada sesión, una ayuda para los perros que todavía esperan casa.',
  intro:
    'Eme lleva quince años fotografiando bodas en Sevilla y sabe esperar el gesto que no se repite: la mirada del perro a quien le da de comer, el gato que por fin se deja coger, los niños tirados en el suelo con él. Fotos para la pared, no solo para el móvil.',
  hero: {
    src: '/images/mascotas/salchicha-con-su-duena.webp',
    alt: 'Perro salchicha con abrigo paseando junto a su dueña por la calle',
  },
  /** Las dos sesiones que se ofrecen en esta página. */
  modalidades: [
    {
      titulo: 'Sesión de mascotas',
      texto: 'Tu animal como protagonista: perro, gato, conejo o el que viva contigo. En su parque, en su calle, en casa o en un rincón de Sevilla que os guste.',
    },
    {
      titulo: 'Familias con mascotas',
      texto: 'El animal y la gente que lo quiere, niños y abuelos incluidos. Paseos, juegos y abrazos, sin posados rígidos. La sesión que más se enmarca.',
    },
  ],
  solidario: {
    titulo: 'Tu sesión ayuda a otro perro',
    texto:
      'Con estas sesiones colaboras con Pelos y Señales, un proyecto de Sevilla que fotografía a perros de protectora para que una familia los vea tal como son. Lo que se recauda llega en beneficio de los perros que lo tienen más difícil.',
    enlace: { href: 'https://pelosysenales.es', texto: 'Conoce Pelos y Señales' },
  },
  /** Datos de la convocatoria. `null` = todavía sin decidir: no se pinta. */
  detalles: {
    fechas: null as string | null,
    lugar: null as string | null,
    duracion: null as string | null,
    precio: null as string | null,
    incluye: null as string | null,
    donativo: null as string | null,
  },
  proceso: [
    {
      titulo: 'Nos lo presentas',
      texto: 'Nos escribes por WhatsApp y nos cuentas cómo se llama, cómo es y quién quiere salir en las fotos. Con eso elegimos sitio y hora.',
    },
    {
      titulo: 'Llegáis con calma',
      texto: 'Mejor después de un paseo y con sus premios favoritos. Dejamos que nos huela y se acostumbre antes de la primera foto.',
    },
    {
      titulo: 'Sin prisas y sin flashes',
      texto: 'Pausas cuando las necesite y nada que lo asuste. Si ese día no está para fotos, se cambia la fecha.',
    },
    {
      titulo: 'Tus fotos',
      texto: 'Recibes las fotos editadas en una galería online privada, para descargar, compartir o enmarcar.',
    },
  ],
  regalo: {
    titulo: 'Regala una sesión',
    texto:
      'Para quien habla de su perro más que de sí mismo. Te preparamos un vale regalo y la persona que lo recibe elige la fecha. También colabora con Pelos y Señales.',
  },
  whatsapp: {
    reserva:
      'Hola, Eme. Quiero reservar una sesión solidaria de Eme & Compañía. Mi animal se llama ___ y es un/a ___. Queremos salir: solo él / con la familia.',
    regalo: 'Hola, Eme. Quiero regalar una sesión de Eme & Compañía. ¿Cómo funciona el vale?',
  },
};

export const faqsSesionesMascotasFamilias: FaqEntry[] = [
  {
    id: 'sesiones-a-quien-ayuda',
    question: '¿A quién ayuda mi sesión?',
    answer:
      'A Pelos y Señales, un proyecto de Sevilla que fotografía a perros de protectora y publica sus fichas para que las familias los conozcan. Lo que se recauda con estas sesiones llega en beneficio de los perros que más lo necesitan.',
  },
  {
    id: 'sesiones-familia',
    question: '¿Puede salir toda la familia con el perro?',
    answer:
      'Sí, para eso está la sesión de familias con mascotas: tú, tu pareja, los niños o los abuelos, junto a él. Y siempre hacemos también fotos de tu animal solo.',
  },
  {
    id: 'sesiones-que-animales',
    question: '¿Solo para perros?',
    answer:
      'No. Gatos, conejos, hurones o el animal que viva contigo. Si es muy tímido o no le gusta salir de casa, cuéntanoslo y hacemos la sesión donde esté tranquilo.',
  },
  {
    id: 'sesiones-varios',
    question: '¿Pueden salir varios animales?',
    answer: 'Sí. Dinos cuántos son al reservar para calcular bien el tiempo.',
  },
  {
    id: 'sesiones-precio',
    question: '¿Cuánto cuesta y cuándo puede ser?',
    answer:
      'Escríbenos por WhatsApp y te pasamos fechas libres y tarifas. Las publicaremos también en esta página.',
  },
  {
    id: 'sesiones-regalo',
    question: '¿Se puede regalar?',
    answer: 'Sí, con un vale regalo. Quien lo recibe elige la fecha, y también colabora con Pelos y Señales.',
  },
];
