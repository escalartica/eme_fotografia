import type { FaqEntry } from './types';

/**
 * Minisesiones solidarias de Navidad de Eme & Compañía (/mascotas/navidad).
 *
 * Es la primera página de un embudo de venta: la oferta de entrada de la
 * línea de mascotas. Se reserva por WhatsApp porque es por donde llegan hoy
 * las consultas y todavía no hay CRM que conteste correos automáticos.
 *
 * SIN CIFRAS NI FECHAS INVENTADAS. Fechas, sitio, duración y precio los
 * decide Eme; mientras sean `null`, la página dice que se anuncian pronto y
 * la llamada es a apuntarse. Rellenar un campo aquí lo publica.
 *
 * Lo solidario se cuenta sin cantidades, por decisión de charo (16-11-2026):
 * con estas minisesiones se colabora con Pelos y Señales, en beneficio de los
 * perros de protectora. Si un día se fija una cantidad, va en `donativo`.
 */
export const navidadMascotas = {
  route: '/mascotas/navidad',
  marca: 'Eme & Compañía · Navidad',
  metaTitle: 'Minisesiones de Navidad para mascotas en Sevilla',
  metaDescription:
    'Minisesiones solidarias de fotos de Navidad para tu perro, tu gato o el animal que viva contigo, en Sevilla. Cada sesión colabora con Pelos y Señales.',
  heading: 'Minisesiones solidarias de Navidad',
  tagline: 'Un retrato navideño de tu animal y, con él, una ayuda para los perros que todavía esperan casa.',
  intro:
    'Un día, un decorado sencillo y turnos cortos para que tu animal no se canse. Las hace Eme, con la misma paciencia y la misma luz que pone en una boda. Plazas limitadas.',
  hero: {
    src: '/images/mascotas/labrador-con-capa-navidena.webp',
    alt: 'Labrador negro con una capa roja de Navidad mirando hacia arriba',
  },
  solidario: {
    titulo: 'Tu sesión ayuda a otro perro',
    texto:
      'Con las minisesiones de Navidad colaboras con Pelos y Señales, un proyecto de Sevilla que fotografía a perros de protectora para que una familia los vea tal como son. Lo que se recauda llega en beneficio de los perros que lo tienen más difícil.',
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
      titulo: 'Reservas tu turno',
      texto: 'Nos escribes por WhatsApp, nos dices cómo se llama tu animal y te guardamos un turno. Si vienen dos o tres, avísanos para darte más tiempo.',
    },
    {
      titulo: 'Llegáis con calma',
      texto: 'Mejor después de un paseo y con sus premios favoritos. Dejamos que huela el decorado y se acostumbre antes de la primera foto.',
    },
    {
      titulo: 'Un rato corto y bien aprovechado',
      texto: 'Un turno breve, sin flashes que asusten y con pausas si las necesita. Puedes salir con él en alguna foto.',
    },
    {
      titulo: 'Tus fotos',
      texto: 'Recibes las fotos editadas en una galería online privada, listas para la felicitación o para enmarcar.',
    },
  ],
  regalo: {
    titulo: 'Regala una minisesión',
    texto:
      'Para quien habla de su perro más que de sí mismo. Te preparamos un vale regalo y la persona que lo recibe elige su turno. También colabora con Pelos y Señales.',
  },
  whatsapp: {
    reserva:
      'Hola, Eme. Quiero apuntarme a las minisesiones solidarias de Navidad de Eme & Compañía. Mi animal se llama ___ y es un/a ___.',
    regalo: 'Hola, Eme. Quiero regalar una minisesión de Navidad de Eme & Compañía. ¿Cómo funciona el vale?',
  },
};

export const faqsNavidadMascotas: FaqEntry[] = [
  {
    id: 'navidad-a-quien-ayuda',
    question: '¿A quién ayuda mi minisesión?',
    answer:
      'A Pelos y Señales, un proyecto de Sevilla que fotografía a perros de protectora y publica sus fichas para que las familias los conozcan. Lo que se recauda con las minisesiones llega en beneficio de los perros que más lo necesitan.',
  },
  {
    id: 'navidad-que-animales',
    question: '¿Solo para perros?',
    answer:
      'No. Gatos, conejos, hurones o el animal que viva contigo. Si es muy tímido o no le gusta salir de casa, cuéntanoslo y buscamos la mejor forma de hacerlo.',
  },
  {
    id: 'navidad-familia',
    question: '¿Puedo salir con él en las fotos?',
    answer: 'Sí. Puedes salir tú, tu pareja o los niños, además de las fotos de tu animal solo.',
  },
  {
    id: 'navidad-fechas',
    question: '¿Cuándo son y cuánto cuestan?',
    answer:
      'Las fechas, el sitio y el precio los anunciamos en esta página y en Instagram. Escríbenos por WhatsApp y te avisamos en cuanto se abran los turnos.',
  },
  {
    id: 'navidad-regalo',
    question: '¿Se puede regalar?',
    answer: 'Sí, con un vale regalo. Quien lo recibe elige el turno, y también colabora con Pelos y Señales.',
  },
];
