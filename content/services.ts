import type { Service } from './types';

export const services: Service[] = [
  {
    slug: 'boda',
    name: 'Fotografía de boda',
    route: '/servicios/fotografia-de-boda',
    heading: 'Fotografía de boda en Sevilla',
    // 41 caracteres: la plantilla de app/layout.tsx añade 17 (' · EME
    // Fotografía'), así que el título servido mide 58 y no los 71 de antes,
    // que Google cortaba justo por la marca. En plural ('bodas'), que es
    // como se busca y como lo titula la propia categoría de Bodas.net.
    metaTitle: 'Fotógrafo de bodas en Sevilla y Andalucía',
    // 153 caracteres, por debajo del recorte de clampDescription: la
    // anterior medía 173 y el fragmento se quedaba en la primera frase, o
    // sea sin la parte que nombraba Sevilla.
    metaDescription:
      'Qué incluye el reportaje: la boda entera, de los preparativos al último baile, con sesión de preboda, álbum impreso y galería privada para los invitados.',
    tagline: 'De los nervios de la mañana al último baile.',
    intro:
      'Cerca de vosotros y sin interrumpir nada. Buscamos la mirada que se cruza, la abuela que se emociona, la luz de las siete de la tarde en el patio. Nada de eso se puede encargar: hay que estar delante cuando pasa.',
    includes: [
      'Reportaje completo de la boda: preparativos, ceremonia, cóctel, banquete y fiesta',
      'Sesión de preboda o postboda en Sevilla o donde os apetezca',
      'Álbum editorial impreso, con la selección que hacemos juntos',
      'Galería online privada para vosotros y vuestros invitados',
    ],
    idealFor: 'Para parejas que quieren fotos de boda naturales, con dirección de arte y sin la sensación de estar posando.',
    // Real client asset. Deliberately NOT one of the weddings in the hero
    // mosaic or the reel above it: this panel is full-bleed on the home, so
    // repeating a photograph here is the most visible repeat of all.
    // Portrait, because the frame that shows it is portrait. The previous
    // pick was a 3:2 landscape in a 4:5 box (and a tall sticky column on
    // desktop), so barely half of it was ever on screen.
    previewImage: '/images/trabajos/carmen-y-enrique/08.webp',
    previewImageAlt: 'Los novios caminando por el pasillo del jardín tras la ceremonia, en blanco y negro',
    panelImage: '/images/trabajos/raquel-y-fran/primer-baile.webp',
    relatedCategory: 'boda',
    gallery: [
      { src: '/images/trabajos/virginia-y-jorge/12.webp', alt: 'Los novios de noche frente a los faros del coche clásico', width: 1600, height: 1067 },
      { src: '/images/trabajos/angelica-y-jesus/12.webp', alt: 'Vista cenital de los novios sobre la línea de la carretera con el velo extendido', width: 1600, height: 987 },
      { src: '/images/trabajos/preboda-en-santa-cruz/cover.webp', alt: 'La pareja bajo un arco con la Giralda al fondo', width: 1333, height: 2000 },
    ],
    process: [
      { step: 1, title: 'Nos conocemos', description: 'Una videollamada o un café: nos contáis cómo imagináis el día y vemos si encajamos, antes de hablar de números.' },
      { step: 2, title: 'Lo planificamos juntos', description: 'Horarios, luz de cada espacio y coordinación con el resto de proveedores, para que ese día solo tengáis que disfrutar.' },
      { step: 3, title: 'El día de la boda', description: 'Discretos y en el sitio justo. Los posados duran minutos; el resto del día lo pasamos atentos a lo que ocurre.' },
      { step: 4, title: 'Entrega', description: 'Galería privada, selección editada y álbum impreso en el plazo que acordemos.' },
    ],
    ctaLabel: 'Reservar fecha',
  },
  {
    slug: 'video',
    name: 'Vídeo de boda',
    route: '/servicios/video-de-boda',
    heading: 'Vídeo de boda en Sevilla',
    // Mismo recorte que el servicio de foto: 36 + 17 = 53 caracteres.
    metaTitle: 'Vídeo de boda en Sevilla y Andalucía',
    // 150 caracteres. 'Videógrafos' entra aquí porque es la palabra con la
    // que Bodas.net titula su categoría y con la que buscan las parejas que
    // vienen de ahí; el título se queda con 'vídeo de boda', que es el
    // término principal.
    metaDescription:
      'Película del día completo y tráiler corto para compartir, con planos aéreos y el sonido real de los votos. Los videógrafos son el equipo de las fotos.',
    tagline: 'Los votos y las risas, tal y como sonaron.',
    intro:
      'Planos aéreos de la hacienda abriéndose al campo, cámara en mano en los momentos que solo pasan una vez y un montaje con ritmo. Os entregamos un tráiler corto para compartir la misma semana que os apetezca presumir, y una película completa para volver a vivirlo dentro de diez años.',
    includes: [
      'Película cinematográfica del día completo',
      'Tráiler corto, pensado para Instagram y WhatsApp',
      'Planos aéreos con dron del lugar y del paseo',
      'Sonido real: votos, discursos y ambiente',
      'Entrega en 4K, lista para verla en la tele del salón',
    ],
    idealFor: 'Para quienes quieren volver a oír aquel día, no solo mirarlo.',
    // Poster frame from the Eva y Rafa drone set; the looping clip below is
    // the Carmen y Alberto trailer cut from the studio's delivered film.
    // Also portrait, and from the wedding this site publishes as its
    // video-led project. A 16:9 poster in the same 4:5 frame was showing
    // 45% of its width. The looping trailer below still plays in full.
    previewImage: '/images/trabajos/virginia-y-jorge/09.webp',
    previewImageAlt: 'Beso de los novios bajo la celosía de la carpa',
    // A 16:9 poster in a ~1.9:1 full-screen band loses almost nothing, and
    // a frame from the delivered film is the honest image for this panel.
    panelImage: '/videos/posters/carmen-y-alberto-trailer.webp',
    previewVideo: {
      src: '/videos/previews/carmen-y-alberto-trailer.mp4',
      poster: '/videos/posters/carmen-y-alberto-trailer.webp',
      alt: 'Tráiler de la boda de Carmen y Alberto: escaleras, coche clásico, pasillo de sables y baile',
    },
    relatedCategory: 'video',
    gallery: [
      { src: '/videos/posters/real-boda-01-aerial.webp', alt: 'La hacienda y la pareja vistas desde el aire', width: 1280, height: 720 },
      { src: '/videos/posters/virginia-y-jorge-nocturna.webp', alt: 'Los novios de noche bajo la luz de las farolas', width: 1280, height: 720 },
      { src: '/videos/posters/real-boda-01-golden-hour.webp', alt: 'Paseo de los novios entre olivos a la hora dorada', width: 1280, height: 720 },
    ],
    process: [
      { step: 1, title: 'Guion emocional', description: 'Decidimos juntos qué momentos y qué personas tienen que protagonizar la película.' },
      { step: 2, title: 'Rodaje', description: 'Cámara en mano, cámara fija y dron; el sonido se graba en directo, incluidos los votos.' },
      { step: 3, title: 'Montaje', description: 'Edición narrativa, música con licencia y el sonido del día por debajo: los votos, los discursos, el ruido de la fiesta.' },
      { step: 4, title: 'Entrega', description: 'Tráiler primero, película completa después, en 4K.' },
    ],
    ctaLabel: 'Consultar disponibilidad',
  },
];
