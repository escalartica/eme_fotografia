import type { Service } from './types';
import { foto } from './seleccion';

export const services: Service[] = [
  {
    slug: 'boda',
    name: 'Fotografía de boda',
    route: '/servicios/fotografia-de-boda',
    heading: 'Fotografía de boda en Sevilla',
    panelCtaLabel: 'Ver reportaje fotográfico',
    // 41 caracteres: la plantilla de app/layout.tsx añade 17 (' · EME
    // Fotografía'), así que el título servido mide 58 y no los 71 de antes,
    // que Google cortaba justo por la marca. En plural ('bodas'), que es
    // como se busca y como lo titula la propia categoría de Bodas.net.
    metaTitle: 'Fotógrafo de bodas en Sevilla y Andalucía',
    // 153 caracteres, por debajo del recorte de clampDescription: la
    // anterior medía 173 y el fragmento se quedaba en la primera frase, o
    // sea sin la parte que nombraba Sevilla.
    metaDescription:
      'Qué incluye el reportaje: la boda entera, de los preparativos al último baile, con galería privada para los invitados y preboda o álbum según el pack.',
    tagline: 'Desde los preparativos a la locura del último baile. Fotografía sin posados.',
    intro:
      'Cerca de vosotros y sin interrumpir nada. Buscamos la mirada que se cruza, la abuela que se emociona, la luz de las siete de la tarde en el patio. Nada de eso se puede encargar: hay que estar delante cuando pasa.',
    // «Incluye» es lo que va en TODOS los reportajes; lo que depende del pack
    // va aparte y dicho con esa palabra. Antes el álbum y la preboda estaban
    // en la misma lista que la cobertura del día, y eso es una promesa: la
    // pareja que contrata el pack sin álbum llega a la entrega esperando uno.
    includes: [
      'Reportaje completo de la boda: preparativos, ceremonia, cóctel, banquete y fiesta',
      'Galería online privada para vosotros y vuestros invitados, con descarga',
      'Todas las fotos del reportaje editadas, no una selección de diez',
    ],
    alsoAvailable: [
      'Sesión de preboda o postboda en Sevilla o donde os apetezca',
      'Álbum editorial impreso, con la selección que hacemos juntos',
    ],
    idealFor: 'Para parejas que quieren fotos de boda naturales, con dirección de arte y sin la sensación de estar posando.',
    // Real client asset. Deliberately NOT one of the weddings in the hero
    // mosaic or the reel above it: this panel is full-bleed on the home, so
    // repeating a photograph here is the most visible repeat of all.
    // Portrait, because the frame that shows it is portrait. The previous
    // pick was a 3:2 landscape in a 4:5 box (and a tall sticky column on
    // desktop), so barely half of it was ever on screen.
    // 1333x2000, la de más resolución del archivo de esa boda. Antes era
    // 08.webp (1067x1600) y en una tarjeta de este tamaño había que ampliarla
    // un 57%: en una web de fotografía, la fotografía que vende el servicio
    // de fotografía no puede ser la que peor se ve de la página.
    previewImage: '/images/trabajos/carmen-y-enrique/cover.webp',
    previewImageAlt: 'Los novios bajo el arco del jardín tras la ceremonia, en blanco y negro',
    panelImage: '/images/trabajos/raquel-y-fran/primer-baile.webp',
    relatedCategory: 'boda',
    // Seis, no tres. Tres fotografías en la página que vende el reportaje
    // fotográfico eran menos de las que lleva cualquier bloque de la home.
    // Las tres nuevas salen de content/seleccion.ts y están elegidas para
    // cubrir el día entero, que es lo que esta página promete: la mañana en
    // la habitación, el detalle de las manos y el final en la carretera.
    gallery: [
      { src: '/images/trabajos/virginia-y-jorge/12.webp', alt: 'Los novios de noche frente a los faros del coche clásico', width: 2560, height: 1706 },
      foto('retrato-junto-a-la-ventana'),
      { src: '/images/trabajos/angelica-y-jesus/12.webp', alt: 'Vista cenital de los novios sobre la línea de la carretera con el velo extendido', width: 2560, height: 1579 },
      foto('las-manos-con-los-anillos'),
      { src: '/images/trabajos/preboda-en-santa-cruz/cover.webp', alt: 'La pareja bajo un arco con la Giralda al fondo', width: 1707, height: 2560 },
      foto('beso-en-la-carretera'),
    ],
    process: [
      { step: 1, title: 'Nos conocemos', description: 'Una videollamada o un café: nos contáis cómo imagináis el día y vemos si encajamos, antes de hablar de números.' },
      { step: 2, title: 'Lo planificamos juntos', description: 'Horarios, luz de cada espacio y coordinación con el resto de proveedores, para que ese día solo tengáis que disfrutar.' },
      { step: 3, title: 'El día de la boda', description: 'Discretos y en el sitio justo. Los posados duran minutos; el resto del día lo pasamos atentos a lo que ocurre.' },
      { step: 4, title: 'Entrega', description: 'Un adelanto en los días siguientes y la galería privada completa entre tres y seis meses después. Si lleváis álbum, lo montamos con la selección que hagáis desde ahí.' },
    ],
    ctaLabel: 'Reservar fecha',
  },
  {
    slug: 'video',
    name: 'Vídeo de boda',
    route: '/servicios/video-de-boda',
    heading: 'Vídeo de boda en Sevilla',
    panelCtaLabel: 'Ver película de boda',
    // Mismo recorte que el servicio de foto: 36 + 17 = 53 caracteres.
    metaTitle: 'Vídeo de boda en Sevilla y Andalucía',
    // 150 caracteres. 'Videógrafos' entra aquí porque es la palabra con la
    // que Bodas.net titula su categoría y con la que buscan las parejas que
    // vienen de ahí; el título se queda con 'vídeo de boda', que es el
    // término principal.
    metaDescription:
      'Película del día completo con planos aéreos, montada sobre hilo musical y con el color de las fotos. Los videógrafos son el mismo equipo que el reportaje.',
    tagline: 'Vuestra boda contada como una película, con su música y su ritmo.',
    intro:
      'Planos aéreos de la hacienda abriéndose al campo, cámara en mano en los momentos que solo pasan una vez y un montaje que respira. La película va sobre hilo musical: la música se elige para vuestra boda y el montaje se escribe encima de ella, plano a plano. No es una grabación de la ceremonia, es una película de ese día.',
    includes: [
      'Película cinematográfica del día completo',
      'Montaje sobre hilo musical, con música con licencia elegida para vuestra boda',
      'Planos aéreos con dron del lugar y del paseo, donde el espacio aéreo lo permite',
      'Entrega en alta resolución, lista para verla en la tele del salón',
    ],
    alsoAvailable: [
      'Tráiler corto, pensado para Instagram y WhatsApp',
      'Cobertura con más cámaras para ceremonias grandes',
    ],
    idealFor: 'Para quienes quieren volver a ver aquel día con el ritmo y la emoción de una película, no un vídeo de la ceremonia de principio a fin.',
    // Poster frame from the Eva y Rafa drone set; the looping clip below is
    // the Carmen y Alberto trailer cut from the studio's delivered film.
    // Also portrait, and from the wedding this site publishes as its
    // video-led project. A 16:9 poster in the same 4:5 frame was showing
    // 45% of its width. The looping trailer below still plays in full.
    previewImage: '/images/trabajos/virginia-y-jorge/09.webp',
    previewImageAlt: 'Beso de los novios bajo la celosía de la carpa',
    // A 16:9 poster in a ~1.9:1 full-screen band loses almost nothing, and
    // a frame from the delivered film is the honest image for this panel.
    // Fotografía, no fotograma. Aquí había un póster de vídeo de 1280x720 a
    // sangre en toda la franja: sobre un monitor de 1440 px a 2x eso es
    // ampliarlo por tres. Ésta es el primer baile de la boda de vídeo del
    // sitio, reexportada del original de cámara a 2560x1707.
    panelImage: '/images/trabajos/andrea-y-jesus/cover.webp',
    // EL TRÁILER AÉREO, NO EL DE LAS ESCALERAS.
    // Los dos están a 720p y a un caudal parecido (4,1 frente a 4,3 Mbps), así
    // que el que se veía pixelado no era peor fichero: era el recorte. Un
    // 16:9 metido en un marco vertical 4:5 enseña el 40% de su ancho ampliado
    // más del doble, y ahí se ve el grano de cualquier vídeo. Corregido el
    // marco (ver .cardFrameFilm en la hoja de /servicios), el clip que manda
    // es éste: catorce segundos de dron abriendo sobre la hacienda y el
    // campo, que es lo más espectacular que hay en todo el archivo y lo que
    // esta tarjeta tiene que prometer.
    previewVideo: {
      // EL CLIP DE 1080p, NO EL MONTAJE DE 720p. Antes iba aquí
      // `andrea-y-jesus-preview.mp4`: 18 MB, 1280x720 y con el etalonado
      // viejo encima (viñeta fuerte y bruma cálida). En esta columna la caja
      // mide unos 700 px de ancho, así que su póster de 1280x720 se ampliaba
      // casi al doble -- justo lo que el cliente señaló dos veces como
      // "pixelado". Éste sale del máster 4K del dron: 1920x1080 limpio, un
      // plano general completo de la hacienda, y 10 MB en vez de 18.
      src: '/videos/previews/andrea-y-jesus-hacienda-aerea.mp4',
      poster: '/videos/posters/andrea-y-jesus-hacienda-aerea.webp',
      alt: 'Vista aérea completa de la hacienda y los campos que la rodean, desde el dron',
    },
    // LA BANDA DEL MEDIO ES VÍDEO, NO UN FOTOGRAMA.
    // Era la caja más grande de la página --a sangre, hasta 44rem de alto en
    // escritorio-- y la ocupaba una imagen quieta sacada de una película, en
    // la página que vende películas. Doce segundos de dron bajando sobre el
    // muro de la hacienda a la hora dorada, 1920x1080 del máster, tal cual
    // salió: no se recorta ni se reexporta, sólo se coloca.
    // Se reproduce sola, en silencio y en bucle, y --esto importa para lo que
    // pesa la página-- no se descarga hasta que entra en pantalla ni sigue
    // corriendo cuando sale: lo hace ShowreelClip con `preload="none"` y un
    // IntersectionObserver.
    interludioVideo: {
      src: '/videos/previews/andrea-y-jesus-golden-hour.mp4',
      poster: '/videos/posters/andrea-y-jesus-golden-hour.webp',
      alt: 'Plano de dron bajando sobre el muro de la hacienda a la hora dorada, con los novios paseando',
    },
    relatedCategory: 'video',
    // El póster de la hora dorada SALE de esta lista: es el primer fotograma
    // del clip de arriba, y tenerlo aquí abajo sería enseñar quieta la misma
    // imagen que se está moviendo a dos pantallas de distancia.
    //
    // Y se queda en DOS, no se rellena a tres. Los dos candidatos que había
    // para el hueco no valían: el de la llegada lleva al equipo de rodaje
    // dentro del encuadre, y el de la recepción es otra aérea de la misma
    // hacienda que la primera de esta lista. Dos piezas distintas dicen más
    // que tres con una repetida.
    gallery: [
      { src: '/videos/posters/andrea-y-jesus-aerial.webp', alt: 'La hacienda y la pareja vistas desde el aire', width: 1920, height: 1080 },
      { src: '/videos/posters/virginia-y-jorge-nocturna.webp', alt: 'Los novios de noche bajo la luz de las farolas', width: 1280, height: 720 },
    ],
    process: [
      { step: 1, title: 'Guion emocional', description: 'Decidimos juntos qué momentos y qué personas tienen que protagonizar la película.' },
      { step: 2, title: 'Rodaje', description: 'Cámara en mano, cámara fija y dron, buscando los planos que sostienen una película: las manos, las caras que reaccionan, el sitio entero desde arriba.' },
      { step: 3, title: 'Montaje', description: 'Elegimos la música con licencia que va con vuestra boda y montamos encima: la película lleva hilo musical, no las voces ni el sonido directo del día.' },
      { step: 4, title: 'Entrega', description: 'La película completa en alta resolución, entre seis meses y un año. Si lleváis tráiler, ése llega antes.' },
    ],
    ctaLabel: 'Consultar disponibilidad',
  },
];
