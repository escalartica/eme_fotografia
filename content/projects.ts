import type { Project } from './types';

export const projects: Project[] = [
  {
    // Fotografías reales entregadas por el estudio en la tarjeta EOS_DIGITAL
    // (carpeta «Maite y Nerea», 11 archivos). EXIF: Canon EOS 5D Mark IV con
    // un 70-200 f/4, disparadas el 26 de marzo de 2021 a las 19:31 -- viernes
    // y hora dorada. Reveladas en Lightroom por el estudio y reexportadas aquí
    // a 2560 px con el etalonado de la casa (scripts/grade-photos.py).
    //
    // DOS DATOS ESTÁN PENDIENTES DE QUE EL ESTUDIO LOS CONFIRME, y se dicen
    // aquí en vez de disimularse:
    //   - `location`. Los archivos no llevan GPS y un pinar no se identifica
    //     solo. Se pone Sevilla porque es donde trabaja el estudio, pero es lo
    //     único de esta ficha que no se ha comprobado.
    //   - Qué es la sesión. Once fotogramas, un viernes por la tarde, las dos
    //     solas con su perro: tiene toda la pinta de una sesión de pareja y no
    //     de una jornada de boda. Por eso la descripción NO dice «preboda» ni
    //     «postboda» -- no se sabe cuál, y decir cualquiera de las dos sería
    //     inventarlo.
    slug: 'maite-y-nerea',
    title: 'Maite y Nerea',
    category: 'boda',
    year: 2021,
    client: 'Boda privada',
    location: 'Sevilla',
    description: 'Las dos de blanco, con sombrero, y el perro con pajarita haciendo de testigo en mitad del camino. Un pinar a última hora de la tarde, tierra entre los troncos, el sol bajo colándose entre las ramas y ninguna pose: solo dos personas paseando. Fotografía de pareja en un pinar, en marzo.',
    cover: {
      // LA FOTOGRAFÍA QUE EL ESTUDIO PIDIÓ PONER EN SITIO VISIBLE (JD6A7884).
      // Aquí abre la ficha y es la casilla de esta boda en la pared de
      // /trabajos; en la portada abre el carrete de trabajos seleccionados,
      // que es el primer fotograma que desfila (content/featured.ts).
      //
      // NO va al mosaico del hero, y no por falta de sitio: el mosaico son
      // cinco columnas de una boda cada una, una sexta columna se oculta por
      // debajo de 900 px (HeroMosaic.module.css) y meterla en medio
      // empujaría fuera del móvil la columna del plano de dron. La foto
      // acabaría escondida justo en las pantallas desde las que más se entra.
      type: 'image',
      src: '/images/trabajos/maite-y-nerea/cover.webp',
      alt: 'Las dos novias besándose al final del camino del pinar, con el perro sentado en primer plano con pajarita y una corona de flores',
      isPlaceholderMedia: false,
      width: 1707,
      height: 2560,
    },
    gallery: [
      { type: 'image', src: '/images/trabajos/maite-y-nerea/01.webp', alt: 'Una de las novias sosteniendo en brazos al perro salchicha, apoyadas en un pino', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/maite-y-nerea/02.webp', alt: 'Las dos abrazadas en el sendero con el perro a sus pies, en blanco y negro', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/maite-y-nerea/03.webp', alt: 'Un beso entre los troncos, a contraluz, con el perro olfateando al lado', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/maite-y-nerea/04.webp', alt: 'Las dos de espaldas alejándose por el camino del pinar', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/maite-y-nerea/05.webp', alt: 'Las dos de la mano, riéndose la una de la otra, entre los pinos', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/maite-y-nerea/06.webp', alt: 'Un abrazo frente a frente entre los troncos, en blanco y negro', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/maite-y-nerea/07.webp', alt: 'Las dos de la mano, de espaldas, bajo la luz que se cuela entre los pinos', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/maite-y-nerea/08.webp', alt: 'Las dos señalando algo fuera de cuadro, muertas de risa, en blanco y negro', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/maite-y-nerea/09.webp', alt: 'Abrazadas en mitad del camino, con el pinar entero alrededor, en blanco y negro', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/maite-y-nerea/10.webp', alt: 'Retrato cercano de las dos con el sombrero y el perro asomando abajo', isPlaceholderMedia: false, width: 1707, height: 2560 },
    ],
  },
  {
    // Fotografías reales entregadas por el estudio en la tarjeta EOS_DIGITAL
    // (carpeta «ISA YJOSE», 28 archivos; aquí van 24). EXIF: Canon EOS R6 con
    // un 50 mm f/1.4, el 28 de septiembre de 2024, de las 15:25 a las 00:05
    // del día siguiente -- o sea la jornada entera, de los preparativos del
    // novio al último baile. Reexportadas a 2560 px con el etalonado de la
    // casa (scripts/grade-photos.py).
    //
    // EL LUGAR NO ES UNA SUPOSICIÓN, aunque los archivos no lleven GPS: en la
    // fotografía de portada está la torre de la Plaza de España iluminada
    // detrás de los novios, que no se confunde con ninguna otra.
    //
    // Y EL ORDEN ES EL DEL DÍA, no el del archivo: preparativos del novio,
    // preparativos de la novia, la salida de casa con el padre, el coche, la
    // iglesia, la salida entre el arroz, el paseo de noche y la fiesta. Es lo
    // que esta web promete en «Antes de escribirnos» -- reportajes completos
    // y no las diez fotos más vistosas -- y la única forma de que se note es
    // que la galería se pueda leer de principio a fin.
    slug: 'isa-y-jose',
    title: 'Isa y Jose',
    category: 'boda',
    year: 2024,
    client: 'Boda privada',
    location: 'Sevilla',
    description: 'El traje colgado y los gemelos por la tarde, el padre esperando en el descansillo, la cara del novio cuando la ve entrar, el arroz en la puerta de la iglesia y un beso de noche con la Plaza de España encendida detrás. La jornada entera, de las tres y media a la madrugada. Boda en Sevilla, en septiembre.',
    cover: {
      // El beso de noche en la Plaza de España. Es la única fotografía del
      // archivo que dice «Sevilla» sin tener que escribirlo, y es vertical,
      // que es la forma que pide la casilla de /trabajos.
      type: 'image',
      src: '/images/trabajos/isa-y-jose/cover.webp',
      alt: 'Los novios besándose de noche con la torre iluminada de la Plaza de España detrás',
      isPlaceholderMedia: false,
      width: 1707,
      height: 2560,
    },
    gallery: [
      { type: 'image', src: '/images/trabajos/isa-y-jose/01.webp', alt: 'El chaqué y los zapatos del novio esperando sobre el galán de noche', isPlaceholderMedia: false, width: 1706, height: 2560 },
      { type: 'image', src: '/images/trabajos/isa-y-jose/02.webp', alt: 'El novio vistiéndose mientras su padre lo espera en el descansillo, en blanco y negro', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/isa-y-jose/03.webp', alt: 'Los zapatos y el reloj del novio, listos sobre la cómoda', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/isa-y-jose/preparativos-zapatos.webp', alt: 'El novio atándose los zapatos, visto desde arriba, en blanco y negro', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/isa-y-jose/04.webp', alt: 'Unas manos abrochándole los gemelos al novio', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/isa-y-jose/05.webp', alt: 'El novio con los tirantes y la corbata a medio hacer, en blanco y negro', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/isa-y-jose/06.webp', alt: 'El novio abrochándose el reloj, con el traje azul', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/isa-y-jose/07.webp', alt: 'Dos hombres junto a la ventana durante los preparativos, en blanco y negro', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/isa-y-jose/08.webp', alt: 'Retrato del novio ya vestido, sonriendo', isPlaceholderMedia: false, width: 2560, height: 1706 },
      { type: 'image', src: '/images/trabajos/isa-y-jose/09.webp', alt: 'Los zapatos, la peineta y el perfume de la novia, ordenados sobre la mesa', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/isa-y-jose/10.webp', alt: 'Colocándole el velo a la novia, en blanco y negro', isPlaceholderMedia: false, width: 1706, height: 2560 },
      { type: 'image', src: '/images/trabajos/isa-y-jose/familia-espera.webp', alt: 'La familia esperando al fondo mientras peinan a la novia en primer plano, en blanco y negro', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/isa-y-jose/11.webp', alt: 'La novia riéndose junto al vestido todavía colgado de la percha', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/isa-y-jose/12.webp', alt: 'La novia abrochándose la sandalia', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/isa-y-jose/13.webp', alt: 'La novia sentada, con el velo cayéndole por delante', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/isa-y-jose/14.webp', alt: 'La cara de la novia a través del velo, en blanco y negro', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/isa-y-jose/15.webp', alt: 'La novia bajando la escalera con sus padres, en blanco y negro', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/isa-y-jose/16.webp', alt: 'La novia saliendo de casa del brazo de su padre', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/isa-y-jose/17.webp', alt: 'La novia reflejada en la ventanilla del coche clásico, en blanco y negro', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/isa-y-jose/18.webp', alt: 'Dos niños esperando junto al coche clásico en mitad de la calle', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/isa-y-jose/19.webp', alt: 'El novio emocionado al verla entrar en la iglesia, en blanco y negro', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/isa-y-jose/20.webp', alt: 'La firma de los novios durante la ceremonia, en blanco y negro', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/isa-y-jose/21.webp', alt: 'Los novios saliendo por el portón de la iglesia bajo el arroz, en blanco y negro', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/isa-y-jose/22.webp', alt: 'Los novios entre los invitados a la salida, con los brazos en alto, en blanco y negro', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/isa-y-jose/23.webp', alt: 'El primer baile rodeado de invitados', isPlaceholderMedia: false, width: 2560, height: 1706 },
    ],
  },
  {
    // Real photos from the studio's own final selection on the external drive
    // ("DISCO DURO/BODAS DEFINITIVAS/Agosto 24 Carmen y Alberto", 20 of the delivered frames).
    // Graded with the site look (grade-photos.py), 1600px long edge, cover 2000px.
    slug: 'carmen-y-alberto',
    title: 'Carmen y Alberto',
    category: 'boda',
    year: 2024,
    client: 'Boda privada',
    location: 'Sevilla',
    description: 'Un novio de uniforme, un velo larguísimo y la luz dorada de última hora sobre la piedra: el padre con el traje en las manos, la llegada en descapotable, el arco de sables a la salida, el coche clásico en la plaza y un neón en la fiesta que dice lo que ya sabíamos. Boda militar en Sevilla, en agosto.',
    cover: {
      type: 'image',
      src: '/images/trabajos/carmen-y-alberto/cover.webp',
      alt: 'La novia y el novio bajo el arco de piedra con la cola extendida',
      isPlaceholderMedia: false,
      width: 1707,
      height: 2560,
    },
    gallery: [
      {
        // Cut from the delivered film (944x528 source, upscaled and graded
        // with scripts/grade-video.sh) -- eight beats with crossfades.
        type: 'video',
        src: '/videos/previews/carmen-y-alberto-trailer.mp4',
        poster: '/videos/posters/carmen-y-alberto-trailer.webp',
        alt: 'Tráiler de la boda de Carmen y Alberto: llegada, arco de sables, atardecer y primer baile',
        isPlaceholderMedia: false,
        width: 1280,
        height: 720,
        // Medida con ffprobe sobre el .mp4 (32,88 s). Es la pieza de vídeo de
        // esta boda, no un plano de apoyo, así que va a la extensión de vídeo
        // del sitemap.
        durationSeconds: 32.88,
      },
      { type: 'image', src: '/images/trabajos/carmen-y-alberto/01.webp', alt: 'El novio de uniforme reflejado en el espejo mientras se viste, en blanco y negro', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/carmen-y-alberto/02.webp', alt: 'El padre de la novia con la chaqueta en las manos, en blanco y negro', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/carmen-y-alberto/03.webp', alt: 'La novia con sus amigas antes de salir, en blanco y negro', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/carmen-y-alberto/04.webp', alt: 'La novia llegando en el descapotable con su padre', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/carmen-y-alberto/05.webp', alt: 'Bajando del coche clásico a la puerta de la iglesia, en blanco y negro', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/carmen-y-alberto/06.webp', alt: 'Los novios frente a frente en el altar', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/carmen-y-alberto/07.webp', alt: 'El retablo de la iglesia con los novios diminutos ante el altar', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/carmen-y-alberto/08.webp', alt: 'La novia jugando con el velo ante el novio de uniforme', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/carmen-y-alberto/09.webp', alt: 'Los novios a través del velo, con el ramo', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/carmen-y-alberto/11.webp', alt: 'Los novios junto al coche clásico en la plaza de la hacienda', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/carmen-y-alberto/12.webp', alt: 'Los novios riendo entre amigos, en blanco y negro', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/carmen-y-alberto/13.webp', alt: 'Beso en la fiesta entre los invitados', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/carmen-y-alberto/14.webp', alt: 'Las amigas de la novia riendo en la mesa, en blanco y negro', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/carmen-y-alberto/15.webp', alt: 'Beso bajo el neón «Juntos es mejor» en la fiesta', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/carmen-y-alberto/16.webp', alt: 'El novio con la novia en brazos bajo el neón', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/carmen-y-alberto/17.webp', alt: 'Arco de sables a la salida de la iglesia', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/carmen-y-alberto/18.webp', alt: 'Lluvia de confeti bajo los sables', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/carmen-y-alberto/19.webp', alt: 'La novia con el velo al viento en la calle empedrada al atardecer', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/carmen-y-alberto/20.webp', alt: 'La novia con sus damas sujetando el velo antes de salir', isPlaceholderMedia: false, width: 2560, height: 1707 },
    ],
  },
  {
    // LAS FOTOS SON DE ESTA BODA; LOS VÍDEOS NO.
    // El material de dron que vivía aquí resultó ser de la boda de Andrea y
    // Jesús (lo confirmó el cliente el 2026-09-11) y se ha movido a su ficha,
    // que es a quienes pertenece. Lo que se queda son las siete fotografías,
    // que sí son de esta pareja. Con ellas la ficha deja de ser de la
    // categoría de vídeo y pasa a ser lo que siempre fue: un reportaje de
    // fotografía.
    // El nombre «Eva y Rafa» lo dio el cliente el 2026-08-31 y sigue marcado
    // como PROVISIONAL a la espera de que lo confirme María Leal.
    slug: 'eva-y-rafa',
    title: 'Eva y Rafa',
    category: 'boda',
    year: 2026,
    client: 'Boda privada',
    location: 'Sevilla',
    description: 'Del maquillaje de la mañana a las bengalas del final: los anillos, los sobrinos colgados del cuello de los novios y los pajes con gafas de sol.',
    cover: {
      // SIN ETALONADO, la única del sitio, y ahora en el sentido literal:
      // el fichero es la exportación directa del original que entregó el
      // estudio (3543x5315 -> 1707x2560), sin pasar por scripts/grade-photos.py.
      // Antes era un derivado etalonado al que se le había intentado quitar
      // el etalonaje a posteriori con scripts/desetalonar.py, y el estudio
      // siguió viéndolo mal tres rondas seguidas: deshacer una curva de tono
      // no devuelve los valores que la curva aplastó. Traer el original y no
      // tocarlo es la única forma de que salga como lo revelaron ellos.
      // Es un contraluz sobre pared blanca: ahí no hay color que saturar,
      // sólo una dominante cálida que el filtro del sitio subrayaba hasta
      // volverla anaranjada. Esta bandera apaga además el `--photo-grade`
      // que el navegador le aplicaba encima, que era la otra mitad.
      sinEtalonar: true,
      type: 'image',
      src: '/images/trabajos/eva-y-rafa/novia-ramo.webp',
      alt: 'La novia sonriendo con su ramo y velo antes de la ceremonia',
      isPlaceholderMedia: false,
      width: 1707,
      height: 2560,
    },
    gallery: [
      { type: 'image', src: '/images/trabajos/eva-y-rafa/maquillaje.webp', alt: 'Maquillaje de la novia antes de la ceremonia', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/eva-y-rafa/preparativos-novio.webp', alt: 'El novio riendo junto a un amigo durante los preparativos', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/eva-y-rafa/anillos.webp', alt: 'Intercambio de anillos durante la ceremonia', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/eva-y-rafa/familia.webp', alt: 'Los novios abrazados por sus sobrinos', isPlaceholderMedia: false, width: 1706, height: 2560 },
      { type: 'image', src: '/images/trabajos/eva-y-rafa/pajes.webp', alt: 'Los pajes de la boda con gafas de sol', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/eva-y-rafa/fiesta.webp', alt: 'Invitados bailando con bengalas durante la fiesta', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/eva-y-rafa/01.webp', alt: 'El novio de pie junto al sillón verde, en la sala de los cuadros', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/eva-y-rafa/02.webp', alt: 'La familia llegando por el camino con los niños de las arras', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/eva-y-rafa/03.webp', alt: 'La novia sentada durante la ceremonia, bajo el sauce', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/eva-y-rafa/04.webp', alt: 'El novio leyendo sus votos frente a la novia, entre los invitados', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/eva-y-rafa/05.webp', alt: 'Las manos de los novios con las alianzas, sobre el ramo', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/eva-y-rafa/06.webp', alt: 'El primer baile bajo las luces azules', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/eva-y-rafa/07.webp', alt: 'Los zapatos, los tirantes y la corbata del novio sobre el sillón verde', isPlaceholderMedia: false, width: 1706, height: 2560 },
      { type: 'image', src: '/images/trabajos/eva-y-rafa/08.webp', alt: 'El novio sentado con las invitadas de verde y azul, en la sala de los cuadros', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/eva-y-rafa/09.webp', alt: 'El ramo, los zapatos y las joyas de la novia sobre la cama', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/eva-y-rafa/10.webp', alt: 'La cola del vestido extendida en el porche', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/eva-y-rafa/11.webp', alt: 'El salón montado para el banquete, con los centros de flores de colores', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/eva-y-rafa/12.webp', alt: 'Los novios con gafas de sol y los invitados brindando', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/eva-y-rafa/13.webp', alt: 'Invitados bebiendo de la bota y riéndose en plena fiesta', isPlaceholderMedia: false, width: 2560, height: 1707 },
    ],
  },
  {
    // Real photos from the studio's own final selection on the external drive
    // ("DISCO DURO/BODAS DEFINITIVAS/12 Octubre 2024 Gloria y Andres", 23 of the delivered frames).
    // Graded with the site look (grade-photos.py), 1600px long edge, cover 2000px.
    slug: 'gloria-y-andres',
    title: 'Gloria y Andrés',
    category: 'boda',
    // FOTO Y PELÍCULA, y por eso está en las dos pestañas. El estudio entregó
    // también el vídeo de esta boda; el resumen que abre la ficha está montado
    // de ese máster (ver el comentario de `cover`). `category` sigue siendo la
    // etiqueta -- lo que más hay aquí son fotografías -- y `alsoIn` la mete en
    // la pestaña de vídeo, que también es verdad.
    alsoIn: ['video'],
    year: 2024,
    client: 'Boda privada',
    location: 'Sevilla',
    description: 'Una boda que se pasea por toda Sevilla: el sí ante el retablo dorado, la salida entre confeti, el coche clásico aparcado con la Giralda detrás, la fuente de la plaza y, cuando cae la tarde, un barco por el Guadalquivir con la Torre del Oro al otro lado. Fotografía de boda en el centro de Sevilla, con luz de octubre.',
    cover: {
      // EL RESUMEN DE LA PELÍCULA, montado del máster en 4K que entregó el
      // estudio (14 minutos a 3840x2160 y 20 Mbps). Diecisiete planos que
      // recorren el día entero: la abuela con la mantilla, el reloj, la
      // novia en el vano, una calle de Sevilla, el pasillo de la iglesia, el
      // retablo dorado, la salida entre arroz, el brindis con la Torre del
      // Oro enfrente, el primer baile y el cierre entre humo. Abre con la
      // novia y el ramo sobre el Guadalquivir, que es el plano que mejor
      // dice dónde pasó esto.
      //
      // Sin pista de audio, como todo el vídeo del sitio: la película se
      // entrega con hilo musical con licencia, y esa licencia cubre la
      // entrega a la pareja. Publicarla en abierto es otra cosa.
      type: 'video',
      src: '/videos/previews/gloria-y-andres-resumen.mp4',
      poster: '/videos/posters/gloria-y-andres-resumen.webp',
      alt: 'Resumen del vídeo de boda de Gloria y Andrés: de los preparativos al baile, con Sevilla de fondo',
      isPlaceholderMedia: false,
      width: 1920,
      height: 1080,
      // Medido con ffprobe sobre el .mp4.
      durationSeconds: 34,
    },
    // El retrato de la rejilla. La portada ya no es una fotografía, y la pared
    // de /trabajos es de casillas verticales: sin esto entraría ahí el póster
    // apaisado del vídeo y perdería más de la mitad del encuadre.
    thumb: { type: 'image', src: '/images/trabajos/gloria-y-andres/cover.webp', alt: 'Los novios besándose junto al coche clásico con la Giralda al fondo', isPlaceholderMedia: false, width: 1707, height: 2560 },
    gallery: [
      { type: 'image', src: '/images/trabajos/gloria-y-andres/01.webp', alt: 'La novia riendo durante el maquillaje, con el vestido detrás', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/gloria-y-andres/02.webp', alt: 'Los zapatos de la novia en sus manos', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/gloria-y-andres/03.webp', alt: 'El anillo en la palma de la mano', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/gloria-y-andres/04.webp', alt: 'La cola del vestido saliendo del coche, en blanco y negro', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/gloria-y-andres/05.webp', alt: 'La novia sonriendo desde el coche bajo la lluvia', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/gloria-y-andres/06.webp', alt: 'El novio ajustándose la corbata frente al espejo, en blanco y negro', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/gloria-y-andres/07.webp', alt: 'El novio sirviendo champán antes de salir', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/gloria-y-andres/08.webp', alt: 'Las damas y la novia con el vestido de volantes, en blanco y negro', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/gloria-y-andres/09.webp', alt: 'La novia entrando en la iglesia entre los invitados', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/gloria-y-andres/10.webp', alt: 'Los novios ante el altar, con la chaqueta bordada del novio', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/gloria-y-andres/11.webp', alt: 'Lluvia de confeti a la salida de la iglesia', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/gloria-y-andres/12.webp', alt: 'Los novios saliendo de la iglesia bajo la lluvia, en blanco y negro', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/gloria-y-andres/13.webp', alt: 'Los novios caminando de la mano bajo la muralla, en blanco y negro', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/gloria-y-andres/15.webp', alt: 'La novia sentada en la fuente con la Giralda detrás', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/gloria-y-andres/16.webp', alt: 'Los novios junto a la fuente de la plaza, en blanco y negro', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/gloria-y-andres/17.webp', alt: 'Los novios saludando desde el descapotable con la Giralda al fondo', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/gloria-y-andres/18.webp', alt: 'La novia con el ramo en el puente, con el vestido de cola', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/gloria-y-andres/19.webp', alt: 'La novia asomada al río con la Torre del Oro al fondo', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/gloria-y-andres/20.webp', alt: 'Beso en cubierta del barco al anochecer con el puente iluminado', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/gloria-y-andres/21.webp', alt: 'Los novios sentados en la cubierta del barco, en blanco y negro', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/gloria-y-andres/22.webp', alt: 'Baile de los novios con el vestido de volantes al vuelo', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/gloria-y-andres/23.webp', alt: 'Los invitados celebrando en el barco', isPlaceholderMedia: false, width: 2560, height: 1707 },
    ],
  },
  {
    // Real photos delivered by the studio via WeTransfer (transfer "sel jpg
    // resumen", 6 Sep 2026): a two-groom wedding in a hacienda near Sevilla,
    // shot on 17 Nov 2024 (EXIF). Names NOT in the files. The title used to be two invented
    // first names, which is the one thing a slug must never contain; it is now
    // descriptive and needs no confirmation to be correct.
    // Graded with scripts/grade-photos.py (one look for the whole site).
    slug: 'jesus-y-javier',
    title: 'Jesús y Javier',
    category: 'boda',
    year: 2024,
    client: 'Boda privada',
    location: 'Sevilla',
    description: 'Dos novios que entraron cada uno del brazo de su madre, una ceremonia al aire libre en el patio de una hacienda sevillana y una fiesta con humo azul, letras de LOVE y un neón que lo resume todo: Better Together. Boda civil en hacienda, en noviembre, con luz de tarde.',
    cover: {
      type: 'image',
      src: '/images/trabajos/jesus-y-javier/cover.webp',
      alt: 'Los dos novios saliendo por el arco de la hacienda entre humo azul y blanco',
      isPlaceholderMedia: false,
      width: 1333,
      height: 2000,
    },
    gallery: [
      { type: 'image', src: '/images/trabajos/jesus-y-javier/01.webp', alt: 'La chaqueta azul de brocado colgada del armario', isPlaceholderMedia: false, width: 1706, height: 2560 },
      { type: 'image', src: '/images/trabajos/jesus-y-javier/02.webp', alt: 'Uno de los novios riendo mientras se abrocha la chaqueta', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/jesus-y-javier/03.webp', alt: 'Uno de los novios con su madre, vestida de azul, antes de salir', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/jesus-y-javier/04.webp', alt: 'El otro novio con su madre, con mantilla negra, en los preparativos', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/jesus-y-javier/05.webp', alt: 'Los pajes cruzando el jardín hacia la ceremonia, en blanco y negro', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/jesus-y-javier/06.webp', alt: 'La entrada de uno de los novios del brazo de su madre, en blanco y negro', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/jesus-y-javier/07.webp', alt: 'El beso tras el sí en el patio de la hacienda', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/jesus-y-javier/08.webp', alt: 'Los novios riendo bajo la lluvia de pétalos', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/jesus-y-javier/09.webp', alt: 'Los novios en la capilla de la hacienda, ante el retablo', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/jesus-y-javier/10.webp', alt: 'Frente con frente, a través de un velo de luz dorada', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/jesus-y-javier/11.webp', alt: 'Los novios vistos desde arriba en la gran mesa del comedor', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/jesus-y-javier/12.webp', alt: 'Los novios en la puerta de madera, en blanco y negro', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/jesus-y-javier/13.webp', alt: 'Retrato de los novios en la torre de la hacienda, en blanco y negro', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/jesus-y-javier/14.webp', alt: 'Los novios saliendo por el arco entre humo azul y blanco', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/jesus-y-javier/15.webp', alt: 'Humo azul entre la hiedra del patio', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/jesus-y-javier/16.webp', alt: 'Los novios caminando de la mano y riendo por el patio', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/jesus-y-javier/17.webp', alt: 'El primer baile, en blanco y negro', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/jesus-y-javier/18.webp', alt: 'Beso ante las letras luminosas de LOVE', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/jesus-y-javier/19.webp', alt: 'Los tatuajes a juego en los antebrazos', isPlaceholderMedia: false, width: 2560, height: 1707 },
    ],
  },
  {
    // Real photos from the studio's own final selection on the external drive
    // ("DISCO DURO/BODAS DEFINITIVAS/19 de Octubre 24 Carmen y Enrique", 17 of the delivered frames).
    // Graded with the site look (grade-photos.py), 1600px long edge, cover 2000px.
    slug: 'carmen-y-enrique',
    title: 'Carmen y Enrique',
    category: 'boda',
    year: 2024,
    client: 'Boda privada',
    location: 'Sevilla',
    description: 'Ceremonia en el jardín con su hijo de la mano, los abuelos emocionados, una lluvia de confeti bajo las luces y, de noche, el velo recortado contra los faros de un coche clásico. Boda civil en octubre, en Sevilla.',
    cover: {
      type: 'image',
      src: '/images/trabajos/carmen-y-enrique/cover.webp',
      alt: 'Silueta de los novios bajo el velo frente a los faros del coche clásico',
      isPlaceholderMedia: false,
      width: 1706,
      height: 2560,
    },
    gallery: [
      { type: 'image', src: '/images/trabajos/carmen-y-enrique/01.webp', alt: 'La novia con su hijo sobre la cama antes de vestirse, en blanco y negro', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/carmen-y-enrique/02.webp', alt: 'La novia riendo con su hijo durante los preparativos', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/carmen-y-enrique/03.webp', alt: 'El niño asomándose entre el vestido de la novia', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/carmen-y-enrique/04.webp', alt: 'El novio ajustándose el chaleco con su madre', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/carmen-y-enrique/05.webp', alt: 'Los abuelos emocionados antes de la ceremonia, en blanco y negro', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/carmen-y-enrique/06.webp', alt: 'Los pajes con la pizarra «Aquí llega la novia», en blanco y negro', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/carmen-y-enrique/07.webp', alt: 'La novia llegando en el descapotable con la familia alrededor', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/carmen-y-enrique/08.webp', alt: 'Los novios caminando por el pasillo del jardín tras la ceremonia, en blanco y negro', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/carmen-y-enrique/09.webp', alt: 'Abrazo con la madre de la novia tras la ceremonia', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/carmen-y-enrique/10.webp', alt: 'Los dos bajo el velo a contraluz, en blanco y negro', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/carmen-y-enrique/12.webp', alt: 'Beso junto al coche clásico de noche', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/carmen-y-enrique/13.webp', alt: 'Lluvia de confeti bajo las guirnaldas de luces, en blanco y negro', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/carmen-y-enrique/14.webp', alt: 'Beso entre confeti dorado bajo las luces del jardín', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/carmen-y-enrique/15.webp', alt: 'Primer baile entre los invitados', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/carmen-y-enrique/16.webp', alt: 'El novio manteado por sus amigos, en blanco y negro', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/carmen-y-enrique/17.webp', alt: 'El novio volando sobre sus amigos en la fiesta', isPlaceholderMedia: false, width: 2560, height: 1707 },
    ],
  },
  {
    // Real photos from the studio's own final selection on the external drive
    // ("DISCO DURO/BODAS DEFINITIVAS/28 junio 25 Virginia y Jorge", 19 of the delivered frames).
    // The couple is NOT identified: the files sat in one couple's folder but are
    // dated 24-25 June 2024 and matched an empty folder named for another. The
    // slug and title are therefore descriptive, taken from what is in the
    // photographs (a red Mustang, a June wedding) rather than from a guessed name --
    // a name in the slug is a name in the canonical URL, the <h1>, the JSON-LD and
    // the sitemap, and two of the guesses collided with real couples already
    // published on this same site.
    // `location` was 'Granada' on the strength of that same guessed folder, so it
    // has no more support than the name did; it is now the honest superset. If the
    // studio confirms the town, put it back and the schema and title improve with it.
    // Graded with the site look (grade-photos.py), 1600px long edge, cover 2000px.
    slug: 'maria-angeles-y-borja',
    title: 'Mª Ángeles y Borja',
    category: 'boda',
    year: 2024,
    client: 'Boda privada',
    location: 'Andalucía',
    description: 'Un Mustang rojo, una ermita blanca, motos en la puerta y toda la vega a los pies: una boda de junio con la sierra al fondo y una fiesta que no terminó hasta que salió el sol.',
    cover: {
      type: 'image',
      src: '/images/trabajos/maria-angeles-y-borja/cover.webp',
      alt: 'Los novios frente a frente con el pueblo y la montaña al fondo',
      isPlaceholderMedia: false,
      width: 2560,
      height: 1707,
    },
    thumb: { type: 'image', src: '/images/trabajos/maria-angeles-y-borja/06.webp', alt: 'Los novios ante el altar vistos desde la puerta de la ermita', isPlaceholderMedia: false, width: 1707, height: 2560 },
    gallery: [
      { type: 'image', src: '/images/trabajos/maria-angeles-y-borja/01.webp', alt: 'El reloj del novio en sus manos, en blanco y negro', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/maria-angeles-y-borja/02.webp', alt: 'Los anillos en la mano, en blanco y negro', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/maria-angeles-y-borja/03.webp', alt: 'La novia bajo el velo llegando en el coche clásico, en blanco y negro', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/maria-angeles-y-borja/04.webp', alt: 'La novia saludando desde el coche clásico con el ramo', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/maria-angeles-y-borja/05.webp', alt: 'El novio llegando en el Mustang rojo descapotable', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/maria-angeles-y-borja/06.webp', alt: 'Los novios ante el altar vistos desde la puerta de la ermita', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/maria-angeles-y-borja/07.webp', alt: 'La ceremonia vista desde el coro de la ermita, en blanco y negro', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/maria-angeles-y-borja/08.webp', alt: 'Los novios entre sus padres, en blanco y negro', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/maria-angeles-y-borja/09.webp', alt: 'Salida de la ermita entre confeti, en blanco y negro', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/maria-angeles-y-borja/10.webp', alt: 'Los invitados celebrando con las motos a la puerta, en blanco y negro', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/maria-angeles-y-borja/11.webp', alt: 'La novia con el velo al viento entre las motos', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/maria-angeles-y-borja/12.webp', alt: 'Los novios entre la fila de motos, en blanco y negro', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/maria-angeles-y-borja/13.webp', alt: 'Los novios bajo el arco blanco de la ermita, en blanco y negro', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/maria-angeles-y-borja/14.webp', alt: 'Beso junto al Mustang rojo con la ermita detrás', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/maria-angeles-y-borja/16.webp', alt: 'Foto de grupo con la sierra al fondo', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/maria-angeles-y-borja/17.webp', alt: 'Los invitados riendo en la mesa, en blanco y negro', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/maria-angeles-y-borja/18.webp', alt: 'La fiesta con luces de colores', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/maria-angeles-y-borja/19.webp', alt: 'Los invitados bailando sin camisa, en blanco y negro', isPlaceholderMedia: false, width: 2560, height: 1707 },
    ],
  },
  {
    // Real photos from the studio's own final selection on the external drive
    // ("DISCO DURO/BODAS DEFINITIVAS/9 diciembre 23 angelica y jesus", 15 of the delivered frames).
    // Graded with the site look (grade-photos.py), 1600px long edge, cover 2000px.
    slug: 'angelica-y-jesus',
    title: 'Angélica y Jesús',
    category: 'boda',
    // FOTO Y PELÍCULA, y por eso está en las dos pestañas. El estudio entregó
    // también el vídeo de esta boda; el resumen que abre la ficha está montado
    // de ese máster (ver el comentario de `cover`). `category` sigue siendo la
    // etiqueta -- lo que más hay aquí son fotografías -- y `alsoIn` la mete en
    // la pestaña de vídeo, que también es verdad.
    alsoIn: ['video'],
    year: 2023,
    client: 'Boda privada',
    location: 'Sierra de Sevilla',
    description: 'Cielo de invierno, un vestido con capa y una carretera de montaña vacía para los dos: del retablo dorado de la iglesia a la vista aérea con el velo cruzando el asfalto. Boda de diciembre en la sierra, con dron y con luz de tormenta.',
    cover: {
      // EL RESUMEN DE LA PELÍCULA, montado del máster que entregó el estudio
      // (18 minutos a 1920x1080). Diecisiete planos: el pueblo desde el aire,
      // el vestido colgado con su etiqueta, el collar, la llegada, la iglesia,
      // el pasillo con el padre, la cola del vestido sobre la alfombra roja,
      // la salida entre pétalos, la sierra desde el dron y la carretera vacía
      // con los dos diminutos en medio, que es el plano que define esta boda.
      //
      // Sin pista de audio, como todo el vídeo del sitio.
      type: 'video',
      src: '/videos/previews/angelica-y-jesus-resumen.mp4',
      poster: '/videos/posters/angelica-y-jesus-resumen.webp',
      alt: 'Resumen del vídeo de boda de Angélica y Jesús: del pueblo desde el aire a la carretera de la sierra',
      isPlaceholderMedia: false,
      width: 1920,
      height: 1080,
      // Medido con ffprobe sobre el .mp4.
      durationSeconds: 35.76,
    },
    // El retrato de la rejilla, por el mismo motivo que en Gloria y Andrés.
    thumb: { type: 'image', src: '/images/trabajos/angelica-y-jesus/cover.webp', alt: 'Los novios en mitad de la carretera de montaña con la capa del vestido', isPlaceholderMedia: false, width: 1707, height: 2560 },
    gallery: [
      { type: 'image', src: '/images/trabajos/angelica-y-jesus/01.webp', alt: 'El novio vistiéndose con sus amigos, reflejado en el espejo, en blanco y negro', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/angelica-y-jesus/02.webp', alt: 'El novio entre líneas de luz de la persiana, en blanco y negro', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/angelica-y-jesus/03.webp', alt: 'La novia descolgando el vestido junto a la ventana', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/angelica-y-jesus/04.webp', alt: 'La novia sonriendo desde el coche junto a su padre', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/angelica-y-jesus/05.webp', alt: 'Los novios en el altar con la mantilla de la novia', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/angelica-y-jesus/06.webp', alt: 'Los novios ante el retablo dorado de la iglesia', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/angelica-y-jesus/07.webp', alt: 'Lluvia de pétalos a la salida de la iglesia', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/angelica-y-jesus/09.webp', alt: 'El novio colocando la cola del vestido en la carretera, en blanco y negro', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/angelica-y-jesus/10.webp', alt: 'Vista aérea de la carretera con los novios en el centro de la curva', isPlaceholderMedia: false, width: 2148, height: 1377 },
      { type: 'image', src: '/images/trabajos/angelica-y-jesus/11.webp', alt: 'Los novios sobre la carretera con la sierra al fondo, desde el dron', isPlaceholderMedia: false, width: 2560, height: 1715 },
      { type: 'image', src: '/images/trabajos/angelica-y-jesus/12.webp', alt: 'Vista cenital de los novios sobre la línea de la carretera con el velo extendido', isPlaceholderMedia: false, width: 2560, height: 1579 },
      { type: 'image', src: '/images/trabajos/angelica-y-jesus/13.webp', alt: 'La carretera vacía y los novios diminutos, desde el aire', isPlaceholderMedia: false, width: 2148, height: 1381 },
      { type: 'image', src: '/images/trabajos/angelica-y-jesus/14.webp', alt: 'Los novios en la carretera de montaña, en blanco y negro', isPlaceholderMedia: false, width: 2145, height: 1357 },
      { type: 'image', src: '/images/trabajos/angelica-y-jesus/15.webp', alt: 'Primer baile bajo las luces del escenario', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/angelica-y-jesus/17.webp', alt: 'El novio riéndose junto a la persiana, con la luz rayándole la cara', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/angelica-y-jesus/18.webp', alt: 'La novia en bata junto a la ventana, antes de vestirse', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/angelica-y-jesus/19.webp', alt: 'Los novios junto al coche en mitad del campo, en blanco y negro', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/angelica-y-jesus/20.webp', alt: 'La novia con mantilla durante la ceremonia, en blanco y negro', isPlaceholderMedia: false, width: 2560, height: 1707 },
    ],
  },
  {
    // Real photos from the studio's own final selection on the external drive
    // ("DISCO DURO/BODAS DEFINITIVAS/21 oct 23 Reyes y  Francico", 15 of the delivered frames).
    // Graded with the site look (grade-photos.py), 1600px long edge, cover 2000px.
    slug: 'reyes-y-francisco',
    title: 'Reyes y Francisco',
    category: 'boda',
    year: 2023,
    client: 'Boda privada',
    location: 'Sevilla',
    description: 'Una boda de pueblo con la iglesia dorada, humo azul a la salida y bengalas frías en el primer baile: de las manos con el tocado a la cola del vestido bajo el arco. Boda de octubre en la provincia de Sevilla.',
    cover: {
      type: 'image',
      src: '/images/trabajos/reyes-y-francisco/cover.webp',
      alt: 'Los novios sentados en el muro del jardín',
      isPlaceholderMedia: false,
      width: 1707,
      height: 2560,
    },
    gallery: [
      { type: 'image', src: '/images/trabajos/reyes-y-francisco/01.webp', alt: 'La novia con la bata junto a la ventana, con el vestido colgado detrás', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/reyes-y-francisco/02.webp', alt: 'La novia reflejada en el espejo con el vestido, en blanco y negro', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/reyes-y-francisco/03.webp', alt: 'El tocado dorado en las manos de la novia', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/reyes-y-francisco/04.webp', alt: 'El novio con los tirantes junto al traje colgado', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/reyes-y-francisco/05.webp', alt: 'El novio con sus amigos antes de salir, en blanco y negro', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/reyes-y-francisco/06.webp', alt: 'El novio saludando a la familia, en blanco y negro', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/reyes-y-francisco/07.webp', alt: 'La novia con su madre antes de salir, en blanco y negro', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/reyes-y-francisco/08.webp', alt: 'La novia sonriendo desde el coche, en blanco y negro', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/reyes-y-francisco/09.webp', alt: 'Los novios riendo ante el sacerdote, en blanco y negro', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/reyes-y-francisco/10.webp', alt: 'Los novios saliendo por el pasillo de la iglesia dorada', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/reyes-y-francisco/11.webp', alt: 'Humo azul y pétalos a la salida', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/reyes-y-francisco/12.webp', alt: 'La novia con la bengala de humo azul', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/reyes-y-francisco/14.webp', alt: 'La novia manteada por sus amigos, en blanco y negro', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/reyes-y-francisco/15.webp', alt: 'Primer baile entre bengalas frías', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/reyes-y-francisco/16.webp', alt: 'El primer baile al aire libre, con la novia inclinada hacia atrás', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/reyes-y-francisco/17.webp', alt: 'Retoque de labios a la novia durante los preparativos', isPlaceholderMedia: false, width: 2560, height: 1707 },
    ],
  },
  {
    // Real photos from the studio's own final selection on the external drive
    // ("DISCO DURO/BODAS DEFINITIVAS/28 junio 25 Virginia y Jorge", 15 of the delivered frames).
    // Graded with the site look (grade-photos.py), 1600px long edge, cover 2000px.
    slug: 'virginia-y-jorge',
    title: 'Virginia y Jorge',
    // ETIQUETA «FOTOS», PERTENENCIA TAMBIÉN A «VÍDEO». Esta boda publica
    // dieciséis fotografías y cuatro clips: llevaba rótulo de Vídeo y era lo
    // primero que desmentía la propia ficha nada más abrirla. La etiqueta
    // dice ahora lo que más hay; `alsoIn` la mantiene en la pestaña de vídeo,
    // que es verdad -- tiene tráiler y abre con él -- y de paso evita que esa
    // pestaña se quede con un solo reportaje.
    category: 'boda',
    alsoIn: ['video'],
    year: 2025,
    client: 'Boda privada',
    location: 'Sevilla',
    description: 'Una boda entre palmeras que tiene tráiler y tiene fotos: la llegada en descapotable, la ceremonia al aire libre bajo la carpa, los pétalos a la salida, una entrada a la fiesta entre bengalas y, de noche, los faros de un coche clásico como única luz para el retrato. Foto y vídeo de boda en Sevilla, en junio.',
    cover: {
      // EL RESUMEN MONTADO DEL TRÁILER ENTREGADO, a 1080p.
      //
      // Aquí abría `virginia-y-jorge-preview.mp4`: 19,7 s a 1280x720 sacados
      // de un reescalado. El máster que tiene el estudio de esta boda es el
      // tráiler completo a 1920x1080 y 15 Mbps, así que la portada de la
      // ficha se veía blanda por un intermedio que ya no hacía falta. Este
      // montaje sale directo de ese máster en un solo pase de codificación
      // (scripts/ no lo guarda: se montó con ffmpeg cortando en la entrada,
      // ver el informe), y recorre la boda entera en dieciséis planos: el
      // beso bajo las guirnaldas, los preparativos, la llegada, la ceremonia
      // bajo la carpa, las fuentes de chispas, las servilletas al aire, la
      // fiesta, y cierra con el primer baile entre humo.
      //
      // Sin pista de audio, como todo el vídeo del sitio. La película se
      // entrega con hilo musical con licencia, y esa licencia cubre la
      // entrega a la pareja: publicarla en una web abierta es otra cosa y no
      // se decide desde aquí.
      type: 'video',
      src: '/videos/previews/virginia-y-jorge-resumen.mp4',
      poster: '/videos/posters/virginia-y-jorge-resumen.webp',
      alt: 'Resumen del vídeo de boda de Virginia y Jorge: del beso bajo las guirnaldas al primer baile entre humo',
      isPlaceholderMedia: false,
      width: 1920,
      height: 1080,
      // Medida con ffprobe sobre el .mp4 (32,24 s). Es la pieza montada de
      // esta boda; los cuatro clips de la galería (5-12 s: llegada,
      // ceremonia, salida, fiesta) son planos sueltos de apoyo y no se
      // listan.
      durationSeconds: 32.24,
    },
    thumb: { type: 'image', src: '/images/trabajos/virginia-y-jorge/05.webp', alt: 'La novia y su padre llegando junto al coche clásico', isPlaceholderMedia: false, width: 1707, height: 2560 },
    // LA PORTADA YA CONTIENE DOS DE ESTOS CLIPS. El vídeo de portada es un
    // montaje -- su propio texto alternativo lo dice: «beso nocturno y
    // entrada a la fiesta» --, así que `nocturna` y `fiesta` estaban dos
    // veces en la misma página: arriba reproduciéndose solos y otra vez unos
    // centímetros más abajo. Se quedan los tres momentos que el montaje no
    // cuenta: la llegada, la ceremonia y la lluvia de pétalos.
    // Los ficheros siguen en /public por si el montaje de portada cambia.
    gallery: [
      {
        type: 'video',
        src: '/videos/previews/virginia-y-jorge-llegada.mp4',
        poster: '/videos/posters/virginia-y-jorge-llegada.webp',
        alt: 'Llegada del novio entre los invitados y el descapotable de la novia',
        isPlaceholderMedia: false,
        width: 1280,
        height: 720,
      },
      {
        type: 'video',
        src: '/videos/previews/virginia-y-jorge-ceremonia.mp4',
        poster: '/videos/posters/virginia-y-jorge-ceremonia.webp',
        alt: 'La ceremonia al aire libre entre palmeras',
        isPlaceholderMedia: false,
        width: 1280,
        height: 720,
      },
      {
        type: 'video',
        src: '/videos/previews/virginia-y-jorge-salida.mp4',
        poster: '/videos/posters/virginia-y-jorge-salida.webp',
        alt: 'Lluvia de pétalos a la salida de la ceremonia',
        isPlaceholderMedia: false,
        width: 1280,
        height: 720,
      },
      { type: 'image', src: '/images/trabajos/virginia-y-jorge/01.webp', alt: 'El novio abrazando a su madre junto a la chaqueta colgada, en blanco y negro', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/virginia-y-jorge/02.webp', alt: 'La novia con su sobrina en brazos a contraluz', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/virginia-y-jorge/03.webp', alt: 'La novia riendo reflejada en el espejo, en blanco y negro', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/virginia-y-jorge/04.webp', alt: 'La novia con tiara sentada en el descapotable', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/virginia-y-jorge/05.webp', alt: 'La novia y su padre llegando junto al coche clásico', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/virginia-y-jorge/06.webp', alt: 'Un invitado emocionado durante la ceremonia', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/virginia-y-jorge/07.webp', alt: 'La novia secándose una lágrima durante la ceremonia', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/virginia-y-jorge/08.webp', alt: 'Los novios sentados bajo la carpa de la ceremonia, en blanco y negro', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/virginia-y-jorge/09.webp', alt: 'Beso bajo la celosía de la carpa', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/virginia-y-jorge/10.webp', alt: 'Los novios sentados ante la verja, con el abanico, en blanco y negro', isPlaceholderMedia: false, width: 2560, height: 1706 },
      { type: 'image', src: '/images/trabajos/virginia-y-jorge/11.webp', alt: 'Los novios entrando en la fiesta entre confeti', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/virginia-y-jorge/12.webp', alt: 'Los novios de noche frente a los faros del coche clásico', isPlaceholderMedia: false, width: 2560, height: 1706 },
      { type: 'image', src: '/images/trabajos/virginia-y-jorge/13.webp', alt: 'La madre del novio abrochándole la chaqueta, en blanco y negro', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/virginia-y-jorge/14.webp', alt: 'Los novios entre los invitados al atardecer, bajo las luces del jardín', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/virginia-y-jorge/15.webp', alt: 'La fiesta con luces de colores y sombreros', isPlaceholderMedia: false, width: 2560, height: 1707 },
    ],
  },
  {
    // Real photos from the studio's own final selection on the external drive
    // ("DISCO DURO/BODAS DEFINITIVAS/10 de mayo 25 Miriam y Alejandro", 19 of the delivered frames).
    // Graded with the site look (grade-photos.py), 1600px long edge, cover 2000px.
    slug: 'miriam-y-alejandro',
    title: 'Miriam y Alejandro',
    category: 'boda',
    year: 2025,
    client: 'Boda privada',
    location: 'Sevilla',
    description: 'Telas rosas sobre el patio, una alfombra roja entre los árboles y la sombra de un olivo para los dos: una boda de hacienda en mayo con mucha luz, mucha familia y una salida de la iglesia entre pétalos.',
    cover: {
      type: 'image',
      src: '/images/trabajos/miriam-y-alejandro/cover.webp',
      alt: 'Los novios besándose a la puerta de la iglesia entre flores',
      isPlaceholderMedia: false,
      width: 1707,
      height: 2560,
    },
    gallery: [
      { type: 'image', src: '/images/trabajos/miriam-y-alejandro/01.webp', alt: 'El novio abrochándose el reloj junto a la puerta', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/miriam-y-alejandro/02.webp', alt: 'La novia con la corona de flores doradas, sonriendo', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/miriam-y-alejandro/03.webp', alt: 'La novia con la bata mirando su vestido en el maniquí', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/miriam-y-alejandro/04.webp', alt: 'La novia poniéndose los zapatos con la ayuda de su hermano, en blanco y negro', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/miriam-y-alejandro/05.webp', alt: 'Las amigas de la novia colocándole el velo, en blanco y negro', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/miriam-y-alejandro/06.webp', alt: 'La familia esperando a la novia en la puerta, en blanco y negro', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/miriam-y-alejandro/07.webp', alt: 'La novia entrando en la iglesia del brazo de su padre, en blanco y negro', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/miriam-y-alejandro/08.webp', alt: 'Los novios frente a frente en el altar', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/miriam-y-alejandro/09.webp', alt: 'La ceremonia vista desde el fondo de la iglesia con el retablo dorado', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/miriam-y-alejandro/10.webp', alt: 'Los novios saliendo por el pasillo, recién casados', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/miriam-y-alejandro/11.webp', alt: 'Lluvia de pétalos a la salida de la iglesia', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/miriam-y-alejandro/12.webp', alt: 'Los novios bajo el arco de la puerta de la iglesia, en blanco y negro', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/miriam-y-alejandro/13.webp', alt: 'Los novios caminando por la alfombra roja entre los árboles de la hacienda', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/miriam-y-alejandro/14.webp', alt: 'Abrazo bajo el olivo de la hacienda', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/miriam-y-alejandro/15.webp', alt: 'Los novios frente a frente bajo el árbol', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/miriam-y-alejandro/16.webp', alt: 'Los novios entrando en la celebración entre aplausos', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/miriam-y-alejandro/17.webp', alt: 'La novia con sus amigas bajo las telas rosas del patio', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/miriam-y-alejandro/18.webp', alt: 'El novio con sus amigos en el sofá bajo las telas rosas', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/miriam-y-alejandro/19.webp', alt: 'Primer baile en el patio de la hacienda, en blanco y negro', isPlaceholderMedia: false, width: 2560, height: 1707 },
    ],
  },
  {
    // Real photos from an EME Fotografía shoot on the client's SD card (EOS_DIGITAL/.../pre y post boda/JPG SELE, EXIF 2023-12). La carpeta del disco no lleva nombre, así que la pareja sigue sin identificar; el lugar sí (Real Alcázar). Ampliada en 2026-09 con 4 frames más de la selección definitiva del estudio (DISCO DURO/PRE BODAS DEFINITIVAS, carpeta sin nombrar), la misma sesión.
    slug: 'postboda-en-el-real-alcazar',
    title: 'Postboda en el Real Alcázar',
    category: 'boda',
    year: 2023,
    client: 'Boda privada',
    location: 'Sevilla',
    description: 'Una postboda de diciembre en el Real Alcázar de Sevilla: el reflejo de la alberca del Patio de las Doncellas, los arcos dorados de los baños, las flores de pascua del jardín y, para cerrar, el Patio de Banderas con la Giralda encendida por la tarde. Fotografía de postboda en el monumento más bonito de Sevilla.',
    cover: {
      type: 'image',
      src: '/images/trabajos/postboda-en-el-real-alcazar/cover.webp',
      alt: 'Los novios abrazados bajo los arcos dorados de los baños del Alcázar',
      isPlaceholderMedia: false,
      width: 1707,
      height: 2560,
    },
    gallery: [
      { type: 'image', src: '/images/trabajos/postboda-en-el-real-alcazar/01.webp', alt: 'Los novios ante la gran puerta de madera del Alcázar, con la cola del vestido extendida', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/postboda-en-el-real-alcazar/02.webp', alt: 'El velo volando mientras se besan junto a una columna del patio', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/postboda-en-el-real-alcazar/03.webp', alt: 'Los novios reflejados en la alberca del Patio de las Doncellas', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/postboda-en-el-real-alcazar/04.webp', alt: 'La pareja entre las columnas de mármol y los azulejos del patio', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/postboda-en-el-real-alcazar/05.webp', alt: 'Los novios de la mano bajo las bóvedas de los baños de Doña María de Padilla', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/postboda-en-el-real-alcazar/07.webp', alt: 'La novia apoyada en el pecho del novio bajo los arcos, a media luz', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/postboda-en-el-real-alcazar/08.webp', alt: 'Beso entre los cipreses de los jardines del Alcázar', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/postboda-en-el-real-alcazar/09.webp', alt: 'Los novios junto a la fuente del patio, con flores de pascua', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/postboda-en-el-real-alcazar/10.webp', alt: 'Los novios sentados en la escalera de azulejos del jardín', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/postboda-en-el-real-alcazar/11.webp', alt: 'Abrazo en el gran salón de bóvedas del Alcázar', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/postboda-en-el-real-alcazar/12.webp', alt: 'Los novios frente a frente bajo un arco con la Giralda al fondo', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/postboda-en-el-real-alcazar/13.webp', alt: 'Silueta de los novios a contraluz con la Giralda entre los naranjos', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/postboda-en-el-real-alcazar/14.webp', alt: 'Los novios de la mano en el Patio de Banderas con la Giralda detrás', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/postboda-en-el-real-alcazar/15.webp', alt: 'Beso en el Patio de Banderas, en blanco y negro', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/postboda-en-el-real-alcazar/16.webp', alt: 'Beso en el porche de columnas junto al árbol de Navidad', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/postboda-en-el-real-alcazar/17.webp', alt: 'Los dos bajo el velo, en blanco y negro', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/postboda-en-el-real-alcazar/18.webp', alt: 'Los novios jugando con una claqueta y un martillo de utilería, riéndose', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/postboda-en-el-real-alcazar/19.webp', focus: '50% 14%', alt: 'Los dos delante de las puertas talladas, entre las paredes almagra del patio', isPlaceholderMedia: false, width: 2560, height: 1706 },
      { type: 'image', src: '/images/trabajos/postboda-en-el-real-alcazar/20.webp', focus: '50% 26%', alt: 'El Patio de las Doncellas entero, con los dos al fondo reflejados en la alberca', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/postboda-en-el-real-alcazar/21.webp', focus: '45% 10%', alt: 'Ella rompiendo a reír junto a él en la galería de columnas, en blanco y negro', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/postboda-en-el-real-alcazar/22.webp', focus: '55% 6%', alt: 'Los dos reflejados en los cristales de la galería, con el ramo en la mano, en blanco y negro', isPlaceholderMedia: false, width: 2560, height: 1707 },
    ],
  },
  {
    // Real photos from an EME Fotografía shoot on the client's SD card (EOS_DIGITAL/.../pre y post boda/5/JPG, EXIF 2024-07). La carpeta del disco identifica la sesión ("carmen y alberto"); el slug y el título siguen siendo descriptivos a propósito, no un hueco esperando un nombre. Falta el municipio. Ampliada en 2026-09 con 5 frames más de la selección definitiva del estudio (DISCO DURO/PRE BODAS DEFINITIVAS/carmen y alberto), que es la misma sesión: se descartaron los que ya estaban publicados comparando por hash perceptual.
    slug: 'preboda-de-carmen-y-alberto',
    title: 'Preboda de Carmen y Alberto',
    category: 'boda',
    year: 2024,
    client: 'Boda privada',
    location: 'Sierra de Sevilla',
    description: 'Última hora de la tarde en un pueblo blanco de la sierra: un patio de columnas con la luz naranja entrando de lado, las sombras de los dos en la pared, la fuente, el mirador con las montañas detrás y una silueta al atardecer para terminar. Preboda en verano, con calma y sin posados.',
    cover: {
      type: 'image',
      src: '/images/trabajos/preboda-de-carmen-y-alberto/cover.webp',
      alt: 'La pareja abrazada junto a las columnas de un patio a la luz dorada',
      isPlaceholderMedia: false,
      width: 1707,
      height: 2560,
    },
    gallery: [
      { type: 'image', src: '/images/trabajos/preboda-de-carmen-y-alberto/01.webp', alt: 'Él besándole el hombro con el pueblo blanco y la sierra al fondo', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/preboda-de-carmen-y-alberto/02.webp', alt: 'El reloj de él en las manos de ella, detalle', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/preboda-de-carmen-y-alberto/03.webp', alt: 'Los dos sentados en un muro de piedra, ella con vestido blanco', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/preboda-de-carmen-y-alberto/04.webp', alt: 'Retrato íntimo frente con frente, en blanco y negro', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/preboda-de-carmen-y-alberto/06.webp', alt: 'Beso junto al muro ocre del patio', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/preboda-de-carmen-y-alberto/07.webp', alt: 'Ella apoyada en una columna, mirándole a lo lejos', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/preboda-de-carmen-y-alberto/08.webp', alt: 'La pareja sentada en la escalinata de la galería de arcos', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/preboda-de-carmen-y-alberto/09.webp', alt: 'Abrazo ante un portón antiguo de madera claveteada', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/preboda-de-carmen-y-alberto/10.webp', alt: 'Ella asomándose tras una columna con él desenfocado detrás', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/preboda-de-carmen-y-alberto/11.webp', alt: 'Los dos de la mano con sus sombras alargadas en la pared', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/preboda-de-carmen-y-alberto/12.webp', alt: 'Frente con frente y la sombra de los dos proyectada en el muro amarillo', isPlaceholderMedia: false, width: 2560, height: 1706 },
      { type: 'image', src: '/images/trabajos/preboda-de-carmen-y-alberto/13.webp', alt: 'La pareja abrazada en la esquina de la iglesia, a la luz dorada', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/preboda-de-carmen-y-alberto/14.webp', alt: 'Silueta de la pareja al atardecer sobre la sierra', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/preboda-de-carmen-y-alberto/15.webp', alt: 'Sentados en el borde de la fuente, con el agua cayendo en primer plano', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/preboda-de-carmen-y-alberto/16.webp', alt: 'La pareja sentada entre palmeras', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/preboda-de-carmen-y-alberto/17.webp', alt: 'Los dos en el mirador con el pueblo blanco y las montañas al fondo', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/preboda-de-carmen-y-alberto/18.webp', alt: 'La pareja diminuta bajo los arcos de la iglesia, con la torre al sol', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/preboda-de-carmen-y-alberto/19.webp', focus: '60% 10%', alt: 'Los dos abrazados en el mirador, con los tejados del pueblo y la sierra al fondo', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/preboda-de-carmen-y-alberto/20.webp', focus: '55% 18%', alt: 'Frente a frente junto a una pared ocre, vistos entre las sombras de la calle', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/preboda-de-carmen-y-alberto/21.webp', focus: '55% 12%', alt: 'Retrato de ella apoyada en la fachada, con él desenfocado al fondo, en blanco y negro', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/preboda-de-carmen-y-alberto/22.webp', focus: '45% 8%', alt: 'Sus sombras dadas la mano proyectadas sobre la pared encalada, en blanco y negro', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/preboda-de-carmen-y-alberto/23.webp', focus: '50% 12%', alt: 'La ermita del pueblo vista desde las escaleras, con los dos diminutos bajo el arco de la entrada, en blanco y negro', isPlaceholderMedia: false, width: 2560, height: 1707 },
    ],
  },
  {
    // Real photos from an EME Fotografía shoot on the client's SD card (EOS_DIGITAL/.../pre y post boda/jpg, EXIF 2024-03). La carpeta del disco identifica la sesión ("maria y alberto"); el slug y el título siguen siendo descriptivos a propósito. Falta el municipio. Ampliada en 2026-09 con 7 frames más de la selección definitiva del estudio (DISCO DURO/PRE BODAS DEFINITIVAS/maria y alberto), la misma sesión.
    slug: 'postboda-de-maria-y-alberto',
    title: 'Postboda de María y Alberto',
    category: 'boda',
    year: 2024,
    client: 'Boda privada',
    location: 'Sierra de Sevilla',
    description: 'Ella vuelve a ponerse el vestido y él el traje azul, pero esta vez sin prisa: calles empedradas, una verja verde, el velo volando entre las casas blancas, el campo con los árboles todavía desnudos y una chaqueta de cuero sobre el vestido de novia. Postboda de marzo en un pueblo de la sierra.',
    cover: {
      type: 'image',
      src: '/images/trabajos/postboda-de-maria-y-alberto/cover.webp',
      alt: 'La novia haciendo volar el velo en una calle empedrada del pueblo',
      isPlaceholderMedia: false,
      width: 1707,
      height: 2560,
    },
    gallery: [
      { type: 'image', src: '/images/trabajos/postboda-de-maria-y-alberto/01.webp', alt: 'La novia de espaldas con el velo extendido entre las casas blancas, en blanco y negro', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/postboda-de-maria-y-alberto/02.webp', alt: 'La novia con el velo al viento en la calle empedrada, en blanco y negro', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/postboda-de-maria-y-alberto/03.webp', alt: 'El novio de traje azul y la novia tras una verja verde, sonriendo', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/postboda-de-maria-y-alberto/04.webp', alt: 'Beso en mitad de la calle del pueblo blanco', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/postboda-de-maria-y-alberto/05.webp', alt: 'Los novios bajo un árbol con el velo volando sobre el campo', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/postboda-de-maria-y-alberto/06.webp', alt: 'Frente con frente en el campo, ella con chaqueta vaquera sobre el vestido', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/postboda-de-maria-y-alberto/07.webp', alt: 'El novio cargando a la novia al hombro por un camino de tierra', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/postboda-de-maria-y-alberto/08.webp', alt: 'Abrazo frente a la fachada de ladrillo de la ermita', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/postboda-de-maria-y-alberto/09.webp', alt: 'Beso en primer plano, en blanco y negro', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/postboda-de-maria-y-alberto/10.webp', alt: 'Los novios paseando de la mano por la calle empedrada', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/postboda-de-maria-y-alberto/11.webp', alt: 'La novia recostada ante un portón de madera oscura', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/postboda-de-maria-y-alberto/12.webp', alt: 'La novia riéndose con la chaqueta de cuero bajo el arco de hierro', isPlaceholderMedia: false, width: 1706, height: 2560 },
      { type: 'image', src: '/images/trabajos/postboda-de-maria-y-alberto/13.webp', alt: 'Retrato de los dos mirando a cámara, ella con chaqueta de cuero', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/postboda-de-maria-y-alberto/14.webp', alt: 'Los novios sentados en el lavadero de piedra del pueblo', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/postboda-de-maria-y-alberto/15.webp', focus: '50% 18%', alt: 'Ella de espaldas abriendo el velo como unas alas en mitad de la calle blanca', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/postboda-de-maria-y-alberto/16.webp', focus: '55% 20%', alt: 'Un beso en mitad de la calle empedrada, entre las fachadas encaladas, en blanco y negro', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/postboda-de-maria-y-alberto/17.webp', focus: '50% 20%', alt: 'Los dos en el campo, entre los árboles todavía sin hojas, en blanco y negro', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/postboda-de-maria-y-alberto/18.webp', focus: '50% 32%', alt: 'Retrato de él visto a través de una reja, con los barrotes desenfocados en primer plano', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/postboda-de-maria-y-alberto/19.webp', focus: '50% 14%', alt: 'Él la levanta en brazos y ella abre los brazos, con la espadaña de la iglesia detrás', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/postboda-de-maria-y-alberto/20.webp', focus: '55% 52%', alt: 'Sentados en las escaleras empedradas, con la cola del vestido extendida sobre los escalones', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/postboda-de-maria-y-alberto/21.webp', focus: '60% 12%', alt: 'El velo barriendo la pared encalada mientras él asoma por encima del muro, en blanco y negro', isPlaceholderMedia: false, width: 1707, height: 2560 },
    ],
  },
  {
    // Real photos from an EME Fotografía shoot on the client's SD card (EOS_DIGITAL/.../pre y post boda/resumen pre boda, EXIF 2023-10). Couple and beach are NOT identified on the card -- slug/title/location are PROVISIONAL; confirm with the client.
    slug: 'preboda-en-la-playa',
    title: 'Preboda en la playa',
    category: 'boda',
    year: 2023,
    client: 'Boda privada',
    location: 'Costa de la Luz',
    description: 'Pinar, pasarela de madera, grafitis y marea baja: una preboda de octubre en la costa, vestidos de blanco, que termina con una silueta a contraluz y el faro al fondo. Preboda en la playa para una pareja de Sevilla.',
    cover: {
      type: 'image',
      src: '/images/trabajos/preboda-en-la-playa/cover.webp',
      alt: 'La pareja abrazada en la pasarela de madera bajo los pinos',
      isPlaceholderMedia: false,
      width: 1707,
      height: 2560,
    },
    gallery: [
      { type: 'image', src: '/images/trabajos/preboda-en-la-playa/01.webp', alt: 'Abrazo bajo los pinos junto a la pasarela, en blanco y negro', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/preboda-en-la-playa/02.webp', alt: 'Los dos vestidos de blanco entre las vigas de madera del pinar', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/preboda-en-la-playa/03.webp', alt: 'La pareja bajo la estructura de madera de la playa', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/preboda-en-la-playa/04.webp', alt: 'Los dos frente a un muro de grafitis de colores', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/preboda-en-la-playa/05.webp', alt: 'Riéndose junto a la pared de grafitis', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/preboda-en-la-playa/07.webp', alt: 'Silueta de la pareja a contraluz sobre el paseo de la playa', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/preboda-en-la-playa/08.webp', alt: 'Abrazo entre las rocas de la playa con la marea baja', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/preboda-en-la-playa/09.webp', alt: 'Caminando de la mano por las rocas hacia el mar', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/preboda-en-la-playa/10.webp', alt: 'Los dos abrazados frente al mar', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/preboda-en-la-playa/11.webp', alt: 'La pareja sentada en el muro con el faro detrás', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/preboda-en-la-playa/12.webp', alt: 'La pareja frente a frente junto a un muro pintado, en blanco y negro', isPlaceholderMedia: false, width: 2560, height: 1707 },
    ],
  },
  {
    // Real photos from an EME Fotografía shoot. Gallery rebuilt from the client's SD card originals (EOS_DIGITAL/.../pre y post boda/4/RESUMEN, EXIF 2024-09) -- same session as the previous 7-photo version, now 18 frames graded with the site look. Ampliada en 2026-09 con 7 frames más de la selección definitiva del estudio (DISCO DURO/PRE BODAS DEFINITIVAS/JESUS Y JAVI), la misma sesión, sin repetir ninguno de los ya publicados.
    slug: 'preboda-en-santa-cruz',
    title: 'Preboda en Santa Cruz',
    category: 'boda',
    year: 2024,
    client: 'Boda privada',
    location: 'Sevilla',
    description: 'Un paseo por las callejuelas de Santa Cruz: paredes ocre, la calle Vida, el ficus de la plaza, un beso bajo el arco del Patio de Banderas con la Giralda de fondo y la silueta de los dos al atardecer junto a la catedral. Preboda en el centro de Sevilla, en septiembre.',
    cover: {
      type: 'image',
      src: '/images/trabajos/preboda-en-santa-cruz/cover.webp',
      alt: 'La pareja bajo un arco con la Giralda al fondo',
      isPlaceholderMedia: false,
      width: 1707,
      height: 2560,
    },
    gallery: [
      { type: 'image', src: '/images/trabajos/preboda-en-santa-cruz/01.webp', alt: 'Los dos apoyados en el muro de una callejuela del barrio de Santa Cruz', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/preboda-en-santa-cruz/02.webp', alt: 'Sentados en el escalón de una puerta antigua, besándose', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/preboda-en-santa-cruz/03.webp', alt: 'Riéndose frente a frente, en blanco y negro', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/preboda-en-santa-cruz/04.webp', alt: 'Los dos abrazados en la esquina de una calle ocre', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/preboda-en-santa-cruz/05.webp', alt: 'Beso junto a la pared ocre de la calle Vida', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/preboda-en-santa-cruz/06.webp', alt: 'Uno a caballito del otro por la callejuela', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/preboda-en-santa-cruz/07.webp', alt: 'Abrazo entre las raíces del gran ficus', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/preboda-en-santa-cruz/08.webp', alt: 'Beso con los anillos en la mano bajo el arco de piedra', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/preboda-en-santa-cruz/09.webp', alt: 'De la mano ante una fachada cubierta de hiedra, en blanco y negro', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/preboda-en-santa-cruz/10.webp', alt: 'Abrazo en un pasaje estrecho de paredes blancas', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/preboda-en-santa-cruz/11.webp', alt: 'Beso en la frente, retrato en blanco y negro', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/preboda-en-santa-cruz/12.webp', alt: 'Los dos de espaldas bajo el arco del Patio de Banderas con la Giralda al fondo', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/preboda-en-santa-cruz/13.webp', alt: 'Beso junto a las cadenas de la catedral', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/preboda-en-santa-cruz/14.webp', alt: 'Paseando de la mano junto a la catedral al atardecer', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/preboda-en-santa-cruz/15.webp', alt: 'Silueta de la pareja besándose con el sol detrás', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/preboda-en-santa-cruz/16.webp', alt: 'Uno de ellos levantando al otro en brazos sobre las vías del tranvía', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/preboda-en-santa-cruz/17.webp', alt: 'Beso en una callejuela blanca de Santa Cruz', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/preboda-en-santa-cruz/18.webp', alt: 'La pareja enmarcada por el arco del Patio de Banderas', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/preboda-en-santa-cruz/19.webp', focus: '50% 20%', alt: 'Los dos riéndose apoyados en un portón de clavos, bajo el azulejo de la calle Vida, en blanco y negro', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/preboda-en-santa-cruz/20.webp', focus: '55% 22%', alt: 'Frente a frente en un callejón estrecho, con la pared ocre iluminada de lado', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/preboda-en-santa-cruz/21.webp', focus: '50% 26%', alt: 'Bajo un arco, enseñando el anillo entre los dos, en blanco y negro', isPlaceholderMedia: false, width: 1706, height: 2560 },
      { type: 'image', src: '/images/trabajos/preboda-en-santa-cruz/22.webp', focus: '50% 26%', alt: 'Caminando juntos por una calle de fachadas rosas y amarillas del barrio', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/preboda-en-santa-cruz/23.webp', focus: '50% 20%', alt: 'Uno de los dos rompiendo a reír junto a la reja cubierta de plantas, en blanco y negro', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/preboda-en-santa-cruz/24.webp', focus: '50% 16%', alt: 'Apoyados a cada lado del arco del Patio de Banderas, con la Giralda al fondo, en blanco y negro', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/preboda-en-santa-cruz/25.webp', focus: '50% 22%', alt: 'Uno levanta al otro en volandas en mitad de la avenida, con la ciudad detrás, en blanco y negro', isPlaceholderMedia: false, width: 1706, height: 2560 },
    ],
  },
  {
    // Real photos from the studio's own final selection on the external drive
    // ("DISCO DURO/BODAS DEFINITIVAS/27 octubre 2024 Rocio y Manuel", 20 of the delivered frames).
    // Graded with the site look (grade-photos.py), 1600px long edge, cover 2000px.
    slug: 'rocio-y-manuel',
    title: 'Rocío y Manuel',
    category: 'boda',
    year: 2024,
    client: 'Boda privada',
    location: 'Sevilla',
    description: 'El novio de verde, la novia con encaje y tiara, la torre de la iglesia al fondo y un patio de columnas para el baile: una boda de octubre en un pueblo de Sevilla, con paraguas al salir y los amigos llevando al novio a hombros.',
    cover: {
      type: 'image',
      src: '/images/trabajos/rocio-y-manuel/cover.webp',
      alt: 'Beso bajo el paraguas transparente',
      isPlaceholderMedia: false,
      width: 1333,
      height: 2000,
    },
    gallery: [
      { type: 'image', src: '/images/trabajos/rocio-y-manuel/01.webp', alt: 'El novio abrochándose el reloj, en blanco y negro', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/rocio-y-manuel/02.webp', alt: 'Silueta del novio a contraluz junto a la puerta', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/rocio-y-manuel/03.webp', alt: 'El novio con la chaqueta verde brocada, en blanco y negro', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/rocio-y-manuel/04.webp', alt: 'Detalle del encaje del vestido', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/rocio-y-manuel/05.webp', alt: 'La novia colocándole la flor a su padre', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/rocio-y-manuel/06.webp', alt: 'Retrato de la novia con la tiara y los ojos cerrados', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/rocio-y-manuel/07.webp', alt: 'Los novios en el coche, en blanco y negro', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/rocio-y-manuel/08.webp', alt: 'El novio con su madre y su hermana ante la torre de la iglesia', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/rocio-y-manuel/09.webp', alt: 'La novia sonriendo desde la ventanilla del coche', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/rocio-y-manuel/10.webp', alt: 'La novia mirando atrás durante la ceremonia en el jardín', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/rocio-y-manuel/12.webp', alt: 'Beso a la salida de la ceremonia entre los invitados', isPlaceholderMedia: false, width: 2560, height: 1706 },
      { type: 'image', src: '/images/trabajos/rocio-y-manuel/13.webp', alt: 'Frente con frente, retrato en blanco y negro', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/rocio-y-manuel/14.webp', alt: 'Los novios en el salón de cortinas rojas', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/rocio-y-manuel/15.webp', alt: 'La novia a través del cristal de la ventana', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/rocio-y-manuel/16.webp', alt: 'La novia con el ramo en alto y sus damas de verde', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/rocio-y-manuel/17.webp', alt: 'La novia riendo con las invitadas, en blanco y negro', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/rocio-y-manuel/18.webp', alt: 'El novio a hombros de sus amigos en el patio, en blanco y negro', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/rocio-y-manuel/19.webp', alt: 'El novio inclinando a la novia en el baile, en blanco y negro', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/rocio-y-manuel/20.webp', alt: 'La fiesta con luces moradas y el novio entre sus amigos', isPlaceholderMedia: false, width: 2560, height: 1707 },
    ],
  },
  {
    // Real photos from the studio's own final selection on the external drive
    // ("DISCO DURO/BODAS DEFINITIVAS/12 julio 24 Silvia y David", 10 of the delivered frames).
    // Graded with the site look (grade-photos.py), 1600px long edge, cover 2000px.
    slug: 'silvia-y-david',
    title: 'Silvia y David',
    category: 'boda',
    year: 2024,
    client: 'Boda privada',
    location: 'Sevilla',
    description: 'Una boda de verano con su hija en brazos: la llegada en descapotable, la ceremonia en el jardín con pétalos por el pasillo, un cartel de bienvenida con los tres y, de noche, el velo volando sobre el coche clásico rojo.',
    cover: {
      type: 'image',
      src: '/images/trabajos/silvia-y-david/cover.webp',
      alt: 'El velo volando sobre el coche clásico rojo al anochecer',
      isPlaceholderMedia: false,
      width: 1707,
      height: 2560,
    },
    gallery: [
      { type: 'image', src: '/images/trabajos/silvia-y-david/01.webp', alt: 'El novio abrochándose el gemelo junto a la ventana', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/silvia-y-david/02.webp', alt: 'La novia durante el maquillaje con su madre, en blanco y negro', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/silvia-y-david/03.webp', alt: 'Detalle del maquillaje de la novia', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/silvia-y-david/04.webp', alt: 'Los novios en el descapotable, en blanco y negro', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/silvia-y-david/05.webp', alt: 'La novia entrando del brazo de su padre por el pasillo de pétalos', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/silvia-y-david/06.webp', alt: 'El novio emocionado durante la ceremonia, con la luz del atardecer', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/silvia-y-david/07.webp', alt: 'El novio con su hija en brazos junto al cartel de bienvenida, en blanco y negro', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/silvia-y-david/08.webp', alt: 'La novia riendo con el novio junto a las balas de paja, en blanco y negro', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/silvia-y-david/10.webp', alt: 'Los dos bajo el velo frente a los faros, en blanco y negro', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/silvia-y-david/11.webp', alt: 'Los novios besándose delante del coche clásico, con el velo al viento y el sol bajo detrás', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/silvia-y-david/12.webp', alt: 'La novia con el velo levantado ante los faros encendidos del coche, al anochecer', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/silvia-y-david/13.webp', alt: 'Rematándole el nudo de la corbata al novio antes de salir de casa', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/silvia-y-david/14.webp', alt: 'Colocándole la peineta a la novia durante los preparativos', isPlaceholderMedia: false, width: 2560, height: 1707 },
    ],
  },
  {
    // Real photos from the studio's own final selection on the external drive
    // ("DISCO DURO/BODAS DEFINITIVAS/13 de Mayo 23 Silvia y Jordi", 14 of the delivered frames).
    // Graded with the site look (grade-photos.py), 1600px long edge, cover 2000px.
    slug: 'silvia-y-jordi',
    title: 'Silvia y Jordi',
    category: 'boda',
    year: 2023,
    client: 'Boda privada',
    location: 'Sevilla',
    description: 'Un cortijo blanco con torre, la novia bajando la escalera de azulejos, confeti de colores a la salida y una fiesta con humo y bengalas. Boda de mayo en un cortijo de Sevilla.',
    cover: {
      type: 'image',
      src: '/images/trabajos/silvia-y-jordi/cover.webp',
      alt: 'La novia bajando la escalera de azulejos con el ramo',
      isPlaceholderMedia: false,
      width: 1333,
      height: 2000,
    },
    gallery: [
      { type: 'image', src: '/images/trabajos/silvia-y-jordi/01.webp', alt: 'La novia mirando el vestido colgado en la ventana', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/silvia-y-jordi/02.webp', alt: 'La novia y el vestido reflejados, en blanco y negro', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/silvia-y-jordi/03.webp', alt: 'El novio con su madre antes de salir', isPlaceholderMedia: false, width: 2560, height: 1706 },
      { type: 'image', src: '/images/trabajos/silvia-y-jordi/04.webp', alt: 'Detalle del reloj y el chaleco del novio', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/silvia-y-jordi/05.webp', alt: 'La novia vestida en la habitación con la familia', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/silvia-y-jordi/07.webp', alt: 'La novia llegando a la iglesia con el velo al viento, en blanco y negro', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/silvia-y-jordi/08.webp', alt: 'Las niñas con coronas de flores, en blanco y negro', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/silvia-y-jordi/09.webp', alt: 'Confeti de colores a la salida de la iglesia', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/silvia-y-jordi/10.webp', alt: 'Los novios ante el cortijo blanco iluminado de noche', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/silvia-y-jordi/11.webp', alt: 'Entrada a la fiesta con bengalas de humo', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/silvia-y-jordi/12.webp', alt: 'El novio bailando entre chispas', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/silvia-y-jordi/13.webp', alt: 'Los novios con los brazos en alto en la pista', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/silvia-y-jordi/14.webp', alt: 'La novia a oscuras durante la fiesta, en blanco y negro', isPlaceholderMedia: false, width: 2560, height: 1707 },
    ],
  },
  {
    // Real photos from the studio's own final selection on the external drive
    // ("DISCO DURO/BODAS DEFINITIVAS/30 sept 2022 kuki y jose", 19 of the delivered frames).
    // Graded with the site look (grade-photos.py), 1600px long edge, cover 2000px.
    slug: 'kuki-y-jose',
    title: 'Kuki y José',
    category: 'boda',
    year: 2022,
    client: 'Boda privada',
    location: 'Sevilla',
    description: 'Una boda con capas negras, sables de luz y un casco de moto sobre la mesa: ceremonia al atardecer bajo las telas blancas, pasillo de espadas láser a la salida y primer baile bajo las bombillas. Una boda distinta en Sevilla, en septiembre.',
    cover: {
      type: 'image',
      src: '/images/trabajos/kuki-y-jose/cover.webp',
      alt: 'Pasillo de sables de luz para los novios',
      isPlaceholderMedia: false,
      width: 2560,
      height: 1706,
    },
    thumb: { type: 'image', src: '/images/trabajos/kuki-y-jose/04.webp', alt: 'El novio bajo la lámpara de la escalera, en blanco y negro', isPlaceholderMedia: false, width: 1707, height: 2560 },
    gallery: [
      { type: 'image', src: '/images/trabajos/kuki-y-jose/01.webp', alt: 'Silueta del novio en la puerta del jardín', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/kuki-y-jose/02.webp', alt: 'La chaqueta del novio sobre la silla de cuero', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/kuki-y-jose/03.webp', alt: 'El novio riendo mientras le arreglan la camisa, en blanco y negro', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/kuki-y-jose/04.webp', alt: 'El novio bajo la lámpara de la escalera, en blanco y negro', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/kuki-y-jose/05.webp', alt: 'El casco de moto y los zapatos de la novia', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/kuki-y-jose/06.webp', alt: 'Atando el corsé del vestido de encaje', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/kuki-y-jose/07.webp', alt: 'La novia con su zapato de cuadros en la mano', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/kuki-y-jose/08.webp', alt: 'La novia con el ramo de calas negras', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/kuki-y-jose/09.webp', alt: 'La novia con su madre antes de salir, en blanco y negro', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/kuki-y-jose/10.webp', alt: 'Las amigas con sables de luz alrededor de la novia, en blanco y negro', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/kuki-y-jose/11.webp', alt: 'Los invitados con capas negras llegando junto al coche', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/kuki-y-jose/12.webp', alt: 'Dos invitados con cascos junto al camino', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/kuki-y-jose/13.webp', alt: 'La ceremonia al atardecer bajo las telas blancas', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/kuki-y-jose/14.webp', alt: 'Los novios en la ceremonia con los invitados, en blanco y negro', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/kuki-y-jose/15.webp', alt: 'Los novios saliendo por la alfombra roja entre aplausos', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/kuki-y-jose/17.webp', alt: 'Los novios bajo las espadas de luz', isPlaceholderMedia: false, width: 2560, height: 1706 },
      { type: 'image', src: '/images/trabajos/kuki-y-jose/18.webp', alt: 'Primer baile bajo las bombillas, en blanco y negro', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/kuki-y-jose/19.webp', alt: 'Los novios bailando bajo las luces de la fiesta', isPlaceholderMedia: false, width: 2560, height: 1707 },
    ],
  },
  {
    // Real photos from the studio's own final selection on the external drive
    // ("DISCO DURO/BODAS DEFINITIVAS/4 agosto 23 Maria y Alberto", 19 of the delivered frames).
    // Graded with the site look (grade-photos.py), 1600px long edge, cover 2000px.
    slug: 'maria-y-alberto',
    title: 'María y Alberto',
    category: 'boda',
    year: 2023,
    client: 'Boda privada',
    location: 'Sevilla',
    description: 'Escudos vikingos con los amigos, un traje azul claro, el ramo de flores secas y una ceremonia entre árboles con los votos leídos a mano: una boda de agosto en el campo, con bombillas por encima y mucho baile.',
    cover: {
      type: 'image',
      src: '/images/trabajos/maria-y-alberto/cover.webp',
      alt: 'Los novios abrazados al anochecer con las bombillas al fondo',
      isPlaceholderMedia: false,
      width: 1707,
      height: 2560,
    },
    gallery: [
      { type: 'image', src: '/images/trabajos/maria-y-alberto/01.webp', alt: 'El novio ajustándose los tirantes, en blanco y negro', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/maria-y-alberto/02.webp', alt: 'La novia con la bata junto al velo colgado', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/maria-y-alberto/03.webp', alt: 'La novia y su madre a contraluz durante los preparativos', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/maria-y-alberto/04.webp', alt: 'La novia sentada con los zapatos en la mano', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/maria-y-alberto/05.webp', alt: 'La familia ayudando a la novia, en blanco y negro', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/maria-y-alberto/06.webp', alt: 'La novia con el ramo de flores secas', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/maria-y-alberto/07.webp', alt: 'Retrato de la novia con el ramo, sonriendo', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/maria-y-alberto/08.webp', alt: 'El novio leyendo sus votos entre risas', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/maria-y-alberto/09.webp', alt: 'La novia riendo durante los votos, con los invitados detrás', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/maria-y-alberto/10.webp', alt: 'Los novios ante el portón de madera, en blanco y negro', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/maria-y-alberto/12.webp', alt: 'Los amigos con escudos vikingos, en blanco y negro', isPlaceholderMedia: false, width: 2560, height: 1706 },
      { type: 'image', src: '/images/trabajos/maria-y-alberto/13.webp', alt: 'Los novios entre los escudos al atardecer', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/maria-y-alberto/14.webp', alt: 'Abrazo con la abuela bajo las luces', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/maria-y-alberto/15.webp', alt: 'Los novios bailando entre los invitados', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/maria-y-alberto/16.webp', alt: 'Primer baile, en blanco y negro', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/maria-y-alberto/17.webp', alt: 'La novia con una cerveza en la fiesta, en blanco y negro', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/maria-y-alberto/18.webp', alt: 'La novia bailando con los brazos en alto', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/maria-y-alberto/19.webp', alt: 'Los invitados bailando bajo las luces, en blanco y negro', isPlaceholderMedia: false, width: 2560, height: 1707 },
    ],
  },
  {
    // Real photos from the studio's own final selection on the external drive
    // ("DISCO DURO/BODAS DEFINITIVAS/5 de noviembre 22 eva y jose", 15 of the delivered frames).
    // Graded with the site look (grade-photos.py), 1600px long edge, cover 2000px.
    slug: 'eva-y-jose',
    title: 'Eva y José',
    category: 'boda',
    year: 2022,
    client: 'Boda privada',
    location: 'Sevilla',
    description: 'El novio con su hija de la mano, la abuela colocando el velo, el perro en los preparativos y una ceremonia al sol de noviembre: una boda de familia con confeti a la salida y bengalas en el primer baile.',
    cover: {
      type: 'image',
      src: '/images/trabajos/eva-y-jose/cover.webp',
      alt: 'Los novios en el patio con la cola del vestido extendida, en blanco y negro',
      isPlaceholderMedia: false,
      width: 2560,
      height: 1707,
    },
    thumb: { type: 'image', src: '/images/trabajos/eva-y-jose/03.webp', alt: 'El novio con su hija de la mano junto a la ventana', isPlaceholderMedia: false, width: 1707, height: 2560 },
    gallery: [
      { type: 'image', src: '/images/trabajos/eva-y-jose/01.webp', alt: 'El novio junto a la ventana de la escalera, en blanco y negro', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/eva-y-jose/02.webp', alt: 'El traje colgado en la escalera', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/eva-y-jose/03.webp', alt: 'El novio con su hija de la mano junto a la ventana', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/eva-y-jose/04.webp', alt: 'La novia reflejada en el espejo, en blanco y negro', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/eva-y-jose/05.webp', alt: 'La abuela colocándole el velo a la novia', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/eva-y-jose/06.webp', alt: 'La familia alrededor de la novia, en blanco y negro', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/eva-y-jose/07.webp', alt: 'La novia con las niñas y el perro antes de salir', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/eva-y-jose/08.webp', alt: 'La novia vista a través de la ventanilla del coche, en blanco y negro', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/eva-y-jose/09.webp', alt: 'Los novios riendo durante la ceremonia al sol', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/eva-y-jose/10.webp', alt: 'Lluvia de confeti a la salida', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/eva-y-jose/12.webp', alt: 'La habitación de los preparativos vista desde arriba', isPlaceholderMedia: false, width: 2560, height: 1706 },
      { type: 'image', src: '/images/trabajos/eva-y-jose/13.webp', alt: 'La novia bailando con las invitadas, en blanco y negro', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/eva-y-jose/14.webp', alt: 'La novia con sables de luz en la fiesta', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/eva-y-jose/15.webp', alt: 'Primer baile entre bengalas frías', isPlaceholderMedia: false, width: 2560, height: 1707 },
    ],
  },
  {
    // Real photos from the studio's own final selection on the external drive
    // ("DISCO DURO/BODAS DEFINITIVAS/7 sep 23 Soledad y Alejandro", 15 of the delivered frames).
    // Graded with the site look (grade-photos.py), 1600px long edge, cover 2000px.
    slug: 'soledad-y-alejandro',
    title: 'Soledad y Alejandro',
    category: 'boda',
    year: 2023,
    client: 'Boda privada',
    location: 'Sevilla',
    description: 'La tiara de la novia, el novio con su madre de mantilla ante el retablo, confeti dorado a la salida y la novia saludando desde el descapotable con el ramo en alto. Boda de septiembre en un pueblo de Sevilla.',
    // RETRATO PROPIO PARA LA CASILLA DE LA REJILLA. La portada de este
    // reportaje es apaisada, y la pared de /trabajos es de casillas 2:3: el
    // navegador se queda con una franja central que tira más de la mitad del
    // encuadre -- la pareja acababa arrinconada en una esquina -- y, al
    // sobrevivir menos ancho de fichero, se veía además más blanda que las
    // casillas de al lado, que son verticales de nacimiento. Esta es una
    // fotografía vertical de la misma boda, recortada 2:3 sobre el original
    // de cámara (no sobre la publicada) y exportada a 2560 px.
    thumb: { type: 'image', src: '/images/trabajos/soledad-y-alejandro/retrato-salida.webp', alt: 'Los novios saliendo de la iglesia bajo una lluvia de arroz', isPlaceholderMedia: false, width: 1707, height: 2560 },
    cover: {
      type: 'image',
      src: '/images/trabajos/soledad-y-alejandro/cover.webp',
      alt: 'La novia con el velo al viento junto al novio, en blanco y negro',
      isPlaceholderMedia: false,
      width: 2560,
      height: 1707,
    },
    gallery: [
      { type: 'image', src: '/images/trabajos/soledad-y-alejandro/01.webp', alt: 'La novia con su madre durante los preparativos, en blanco y negro', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/soledad-y-alejandro/02.webp', alt: 'El maquillaje de la novia, en blanco y negro', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/soledad-y-alejandro/03.webp', alt: 'La novia colocándose la tiara', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/soledad-y-alejandro/04.webp', alt: 'Colocando el velo a la novia', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/soledad-y-alejandro/05.webp', alt: 'La novia con sus damas de honor, en blanco y negro', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/soledad-y-alejandro/06.webp', alt: 'El novio con su madre de mantilla ante el retablo', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/soledad-y-alejandro/07.webp', alt: 'Los pajes entrando por la alfombra roja', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/soledad-y-alejandro/08.webp', alt: 'Los novios riendo a la salida, en blanco y negro', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/soledad-y-alejandro/09.webp', alt: 'Confeti dorado a la salida de la iglesia', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/soledad-y-alejandro/10.webp', alt: 'Abrazos con las invitadas a la puerta de la iglesia', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/soledad-y-alejandro/11.webp', alt: 'Los novios con el coche clásico entre palmeras', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/soledad-y-alejandro/13.webp', alt: 'La novia con el ramo en alto desde el descapotable al anochecer', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/soledad-y-alejandro/14.webp', alt: 'Primer baile entre el humo de la pista', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/soledad-y-alejandro/15.webp', alt: 'La fiesta con luces moradas', isPlaceholderMedia: false, width: 2560, height: 1707 },
    ],
  },
  {
    // Real photos from an actual EME Fotografía wedding shoot (provided by
    // the client 2026-09-01, organized by the client into a folder named
    // "raquel y fran"). EXIF capture timestamps on the source files are
    // consistent across all of them (2026-06-16, same morning) — a real,
    // verified date, not a guess. Replaces a previous placeholder entry
    // ("Clara y Manuel", stock Unsplash photos).
    slug: 'raquel-y-fran',
    title: 'Raquel y Fran',
    category: 'boda',
    year: 2026,
    client: 'Boda privada',
    location: 'Sevilla',
    description: 'Una boda con un pie de foto y otro en la carretera: coche clásico, jardines y una celebración sin postureo.',
    // RETRATO PROPIO PARA LA CASILLA DE LA REJILLA. La portada de este
    // reportaje es apaisada, y la pared de /trabajos es de casillas 2:3: el
    // navegador se queda con una franja central que tira más de la mitad del
    // encuadre -- la pareja acababa arrinconada en una esquina -- y, al
    // sobrevivir menos ancho de fichero, se veía además más blanda que las
    // casillas de al lado, que son verticales de nacimiento. Esta es una
    // fotografía vertical de la misma boda, recortada 2:3 sobre el original
    // de cámara (no sobre la publicada) y exportada a 2560 px.
    thumb: { type: 'image', src: '/images/trabajos/raquel-y-fran/retrato-novia.webp', alt: 'La novia poniéndose un pendiente frente al espejo, con la luz de la mañana', isPlaceholderMedia: false, width: 1707, height: 2560 },
    cover: {
      type: 'image',
      src: '/images/trabajos/raquel-y-fran/cover.webp',
      alt: 'Los novios celebrando de pie en un coche descapotable clásico frente a un edificio señorial',
      isPlaceholderMedia: false,
      // Verified via `sips -g pixelWidth -g pixelHeight`.
      width: 2560,
      height: 1707,
    },
    gallery: [
      { type: 'image', src: '/images/trabajos/raquel-y-fran/detalle-ojal.webp', alt: 'Detalle del ojal de lavanda del novio', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/raquel-y-fran/primer-baile.webp', alt: 'Primer baile de los novios', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/raquel-y-fran/candido.webp', alt: 'Momento cómplice y desenfadado del novio', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/raquel-y-fran/01.webp', alt: 'El novio abrochándose el chaleco antes de salir', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/raquel-y-fran/02.webp', alt: 'El novio reflejado en los espejos redondos del recibidor', isPlaceholderMedia: false, width: 2560, height: 1706 },
      { type: 'image', src: '/images/trabajos/raquel-y-fran/03.webp', alt: 'La novia y una invitada asomadas a la ventana', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/raquel-y-fran/04.webp', alt: 'La novia al volante del coche clásico, a la luz del atardecer', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/raquel-y-fran/05.webp', alt: 'La novia bailando con su padre, en blanco y negro', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/raquel-y-fran/06.webp', alt: 'Los novios entre el humo verde de la fiesta', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/raquel-y-fran/07.webp', alt: 'La novia junto al piano de cola, en blanco y negro', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/raquel-y-fran/08.webp', alt: 'Los novios junto al escarabajo blanco, con el velo al viento, en blanco y negro', isPlaceholderMedia: false, width: 2560, height: 1707 },
    ],
  },
  {
    // LOS VÍDEOS DE DRON SON DE ESTA BODA.
    // Estuvieron publicados bajo una ficha con un nombre provisional («Eva y
    // Rafa») hasta que el cliente aclaró de quién eran, el 2026-09-11. Al
    // traerlos aquí esta ficha pasa a ser la de vídeo del sitio: la película
    // abre la página y las fotografías que ya tenía la acompañan.
    // Material real del estudio (clips en bruto de Canon EOS 5D Mark IV y
    // DJI; «com.apple.quicktime.author: EME FOTOGRAFIA» en los metadatos).
    slug: 'andrea-y-jesus',
    title: 'Andrea y Jesús',
    category: 'video',
    year: 2026,
    client: 'Boda privada',
    location: 'Sevilla',
    description: 'La boda desde el aire y desde dentro: la puerta de la hacienda abriéndose al campo, el coche clásico, el paseo entre olivos y el banquete a contraluz, y de noche el primer baile bajo luces de escenario.',
    cover: {
      type: 'video',
      src: '/videos/previews/andrea-y-jesus-preview.mp4',
      // Póster: el beso frente a la puerta de la hacienda, fotograma del
      // tráiler completo.
      poster: '/videos/posters/andrea-y-jesus-full.webp',
      alt: 'Tráiler aéreo de la boda de Andrea y Jesús: la puerta de la hacienda, el paseo entre olivos y el banquete a contraluz',
      isPlaceholderMedia: false,
      // Verificado con `ffprobe -select_streams v:0 -show_entries stream=width,height`.
      width: 1280,
      height: 720,
      // `durationSeconds` es la marca editorial con la que app/sitemap.ts
      // decide qué clip es el contenido principal de su página. Medido con
      // ffprobe: 35,269 s.
      durationSeconds: 35.269,
    },
    // Retrato para el marco anclado del índice, que es vertical: la portada
    // es un vídeo apaisado y ahí se quedaría en una franja.
    thumb: { type: 'image', src: '/images/trabajos/andrea-y-jesus/preparativos.webp', alt: 'La novia reflejada en un espejo durante los preparativos', isPlaceholderMedia: false, width: 1707, height: 2560 },
    // SOLO VÍDEO EN LA GALERÍA. Las tres fotografías que había aquí
    // intercaladas se quitaron: esta es la ficha de vídeo del sitio y lo que
    // se viene a ver es la película, no un reportaje mezclado. Las fotos
    // siguen en uso -- la de los preparativos es el retrato del marco del
    // índice (`thumb`, justo aquí arriba) y las tres forman la casilla de
    // esta boda en el mosaico de la portada (content/mosaic.ts).
    gallery: [
      {
        type: 'video',
        src: '/videos/previews/andrea-y-jesus-aerial.mp4',
        poster: '/videos/posters/andrea-y-jesus-aerial.webp',
        alt: 'Los novios en la puerta de la hacienda, vista aérea',
        isPlaceholderMedia: false,
        width: 1920,
        height: 1080,
      },
      {
        // Clip real de dron DJI. Reexportado desde el máster 4K a 1080p
        // H.264 sin pista de audio y SIN el etalonado anterior: aquel
        // añadía un viñeteado fuerte y una bruma cálida que, sobre un
        // reescalado a 720p, es lo que se veía en pantalla como "pixelado".
        type: 'video',
        src: '/videos/previews/andrea-y-jesus-golden-hour.mp4',
        poster: '/videos/posters/andrea-y-jesus-golden-hour.webp',
        alt: 'Vista aérea de los novios paseando por el jardín de la hacienda al atardecer',
        isPlaceholderMedia: false,
        width: 1920,
        height: 1080,
      },
      {
        // Cortado de un tercer clip de dron sin usar (26s-44s). Los primeros
        // ~25 s del bruto tenían aparcado un autobús de invitados en cuadro;
        // esta ventana es entera posterior al descenso del dron, y un recorte
        // adicional del 15% superior quita el último rastro del horizonte
        // -- comprobado extrayendo un fotograma después del recorte, no
        // supuesto.
        type: 'video',
        src: '/videos/previews/andrea-y-jesus-recepcion.mp4',
        poster: '/videos/posters/andrea-y-jesus-recepcion.webp',
        alt: 'Vista aérea del banquete preparado en el patio de la hacienda al atardecer',
        isPlaceholderMedia: false,
        width: 1920,
        height: 1080,
      },
      {
        // Cortado de un clip de dron que no se había usado (0s-9s). La pareja
        // y el coche junto a la puerta, con el equipo de fotografía visible
        // en el plano general: se deja a propósito, la misma honestidad de
        // trastienda que la sombra del fotógrafo en el póster del dron.
        type: 'video',
        src: '/videos/previews/andrea-y-jesus-llegada.mp4',
        poster: '/videos/posters/andrea-y-jesus-llegada.webp',
        alt: 'Vista aérea de los novios junto al coche clásico a la entrada de la hacienda',
        isPlaceholderMedia: false,
        width: 1920,
        height: 1080,
      },
      {
        // Segundo clip de dron sin usar (18s-34s): un plano general puro de
        // arquitectura, sin gente, con el dron a la mayor altura de todo el
        // rodaje.
        type: 'video',
        src: '/videos/previews/andrea-y-jesus-hacienda-aerea.mp4',
        poster: '/videos/posters/andrea-y-jesus-hacienda-aerea.webp',
        alt: 'Vista aérea completa de la hacienda y los campos que la rodean',
        isPlaceholderMedia: false,
        width: 1920,
        height: 1080,
      },
      { type: 'image', src: '/images/trabajos/andrea-y-jesus/09.webp', alt: 'La novia terminando de arreglarse, ya con el vestido puesto', isPlaceholderMedia: false, width: 1707, height: 2560, focus: '50% 18%' },
      { type: 'image', src: '/images/trabajos/andrea-y-jesus/preparativos.webp', alt: 'La novia reflejada en un espejo durante los preparativos', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/andrea-y-jesus/01.webp', alt: 'Maquillando a la novia, que se ríe durante los preparativos', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/andrea-y-jesus/02.webp', alt: 'Un niño mirando a los novios abrazados, en blanco y negro', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/andrea-y-jesus/03.webp', alt: 'La novia con el velo en el marco de la puerta, en blanco y negro', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/andrea-y-jesus/10.webp', alt: 'La novia al fondo de un pasillo largo, ya vestida', isPlaceholderMedia: false, width: 1707, height: 2560, focus: '50% 6%' },
      { type: 'image', src: '/images/trabajos/andrea-y-jesus/11.webp', alt: 'El novio, de uniforme y con un ramo en la mano, en blanco y negro', isPlaceholderMedia: false, width: 2560, height: 1707, focus: '50% 23%' },
      { type: 'image', src: '/images/trabajos/andrea-y-jesus/13.webp', alt: 'El novio, de uniforme, esperando en el altar', isPlaceholderMedia: false, width: 1707, height: 2560, focus: '50% 2%' },
      { type: 'image', src: '/images/trabajos/andrea-y-jesus/12.webp', alt: 'La novia entrando en la iglesia, vista desde dentro', isPlaceholderMedia: false, width: 1707, height: 2560, focus: '50% 21%' },
      { type: 'image', src: '/images/trabajos/andrea-y-jesus/14.webp', alt: 'Dos compañeros del novio con los anillos, en blanco y negro', isPlaceholderMedia: false, width: 2560, height: 1707, focus: '33% 38%' },
      { type: 'image', src: '/images/trabajos/andrea-y-jesus/15.webp', alt: 'Los novios saliendo de la iglesia, con el retablo dorado detrás', isPlaceholderMedia: false, width: 1707, height: 2560, focus: '50% 32%' },
      { type: 'image', src: '/images/trabajos/andrea-y-jesus/04.webp', alt: 'La salida bajo el arco de sables, en blanco y negro', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/andrea-y-jesus/16.webp', alt: 'La novia abrazándose con sus amigas a la salida, en blanco y negro', isPlaceholderMedia: false, width: 2560, height: 1707, focus: '34% 13%' },
      { type: 'image', src: '/images/trabajos/andrea-y-jesus/06.webp', alt: 'Los novios saliendo de la capilla encalada', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/andrea-y-jesus/17.webp', alt: 'Los novios junto al coche clásico, delante de la fachada de la hacienda', isPlaceholderMedia: false, width: 2560, height: 1707, focus: '50% 30%' },
      { type: 'image', src: '/images/trabajos/andrea-y-jesus/18.webp', alt: 'La hacienda entera al atardecer, con el coche clásico y la novia', isPlaceholderMedia: false, width: 2560, height: 1707, focus: '40% 46%' },
      { type: 'image', src: '/images/trabajos/andrea-y-jesus/19.webp', alt: 'El novio levantando en volandas a la novia en el patio', isPlaceholderMedia: false, width: 2560, height: 1707, focus: '36% 6%' },
      { type: 'image', src: '/images/trabajos/andrea-y-jesus/05.webp', alt: 'Los novios a contraluz, con el sol poniéndose entre los dos', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/andrea-y-jesus/20.webp', alt: 'El primer baile bajo las luces del escenario', isPlaceholderMedia: false, width: 2560, height: 1707, focus: '44% 42%' },
      { type: 'image', src: '/images/trabajos/andrea-y-jesus/07.webp', alt: 'Dos invitadas besando al novio en las mejillas, en blanco y negro', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/andrea-y-jesus/fiesta.webp', alt: 'Invitadas bailando y celebrando en la fiesta', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/andrea-y-jesus/08.webp', alt: 'La novia bailando con un abanico luminoso en la fiesta', isPlaceholderMedia: false, width: 2560, height: 1707 },
    ],
  },
  {
    // Real photos from an actual EME Fotografía wedding shoot (provided by
    // the client, organized by the client into a folder named "andrea y
    // enrique"). EXIF capture timestamps consistent across selected files
    // (2026-03-16). SPELLING NOTE, same class of gap as the old boda-real-01's
    // provisional-name comment: the client's own explicitly-confirmed name
    // list (given earlier for a different set of couples) spells this groom
    // "Andre y Enrique" (no final "a"); this folder is spelled "andrea y
    // enrique" (with it). Used the folder's own spelling here rather than
    // silently picking the other — unconfirmed, flag and correct if the
    // client clarifies.
    slug: 'andrea-y-enrique',
    title: 'Andrea y Enrique',
    category: 'boda',
    year: 2026,
    client: 'Boda privada',
    location: 'Sevilla',
    description: 'Una ceremonia bajo arcos andaluces y una fiesta con mucha energía: de la risa nerviosa de los preparativos al abrazo compartido delante de todos.',
    cover: {
      type: 'image',
      src: '/images/trabajos/andrea-y-enrique/cover.webp',
      alt: 'Los novios riendo juntos bajo un arco de piedra durante la ceremonia',
      isPlaceholderMedia: false,
      // Verified via `sips -g pixelWidth -g pixelHeight`.
      width: 1707,
      height: 2560,
    },
    gallery: [
      { type: 'image', src: '/images/trabajos/andrea-y-enrique/01.webp', alt: 'El chaqué del novio colgado, con los zapatos y un retrato enmarcado debajo', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/andrea-y-enrique/09.webp', alt: 'Las manos del novio mientras le abrochan el reloj y los gemelos', isPlaceholderMedia: false, width: 2560, height: 1707, focus: '20% 31%' },
      { type: 'image', src: '/images/trabajos/andrea-y-enrique/10.webp', alt: 'El novio secándose los ojos con dos familiares al lado, antes de salir', isPlaceholderMedia: false, width: 2560, height: 1707, focus: '63% 55%' },
      { type: 'image', src: '/images/trabajos/andrea-y-enrique/preparativos-novio.webp', alt: 'El novio riendo junto a un amigo mientras se viste', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/andrea-y-enrique/03.webp', alt: 'Maquillando a la novia, que sostiene su sombrero, en blanco y negro', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/andrea-y-enrique/11.webp', alt: 'Dos invitadas con sombrero esperando junto a la fuente del patio', isPlaceholderMedia: false, width: 1707, height: 2560, focus: '50% 44%' },
      { type: 'image', src: '/images/trabajos/andrea-y-enrique/preparativos-novia.webp', alt: 'La novia con su ramo bajo una lámpara de araña durante los preparativos', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/andrea-y-enrique/04.webp', alt: 'La novia con el ramo, de pie ante la puerta de la casa', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/andrea-y-enrique/12.webp', alt: 'La salida de casa, con los invitados agitando los pañuelos', isPlaceholderMedia: false, width: 2560, height: 1707, focus: '19% 35%' },
      { type: 'image', src: '/images/trabajos/andrea-y-enrique/13.webp', alt: 'La novia con el velo puesto, al lado de su padre', isPlaceholderMedia: false, width: 1707, height: 2560, focus: '50% 21%' },
      { type: 'image', src: '/images/trabajos/andrea-y-enrique/14.webp', alt: 'El coche clásico esperando a la puerta, sobre la alfombra roja', isPlaceholderMedia: false, width: 1707, height: 2560, focus: '50% 7%' },
      { type: 'image', src: '/images/trabajos/andrea-y-enrique/15.webp', alt: 'La novia con mantilla y el novio, durante la ceremonia', isPlaceholderMedia: false, width: 1707, height: 2560, focus: '50% 23%' },
      { type: 'image', src: '/images/trabajos/andrea-y-enrique/16.webp', alt: 'El beso de los novios en el altar, con el sacerdote al lado', isPlaceholderMedia: false, width: 2560, height: 1707, focus: '65% 18%' },
      { type: 'image', src: '/images/trabajos/andrea-y-enrique/17.webp', alt: 'La firma después de la ceremonia', isPlaceholderMedia: false, width: 2560, height: 1707, focus: '46% 5%' },
      { type: 'image', src: '/images/trabajos/andrea-y-enrique/06.webp', alt: 'La salida bajo la lluvia de arroz, en blanco y negro', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/andrea-y-enrique/18.webp', alt: 'La foto de grupo del novio con todos sus amigos', isPlaceholderMedia: false, width: 2560, height: 1707, focus: '59% 36%' },
      { type: 'image', src: '/images/trabajos/andrea-y-enrique/19.webp', alt: 'Los amigos levantando al novio en volandas, en blanco y negro', isPlaceholderMedia: false, width: 2560, height: 1707, focus: '19% 17%' },
      { type: 'image', src: '/images/trabajos/andrea-y-enrique/20.webp', alt: 'Los novios junto al coche clásico, delante de la fachada de la hacienda', isPlaceholderMedia: false, width: 1707, height: 2560, focus: '50% 52%' },
      { type: 'image', src: '/images/trabajos/andrea-y-enrique/21.webp', alt: 'El novio besando en la frente a la novia, que sostiene el ramo', isPlaceholderMedia: false, width: 1707, height: 2560, focus: '50% 86%' },
      { type: 'image', src: '/images/trabajos/andrea-y-enrique/08.webp', alt: 'Los novios frente a frente bajo una palmera', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/andrea-y-enrique/07.webp', alt: 'Los novios rodeados de invitados en plena fiesta, en blanco y negro', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/andrea-y-enrique/fiesta.webp', alt: 'Invitados celebrando y agitando servilletas en la fiesta', isPlaceholderMedia: false, width: 2560, height: 1707 },
    ],
  },
  {
    // Real photos from an actual EME Fotografía wedding shoot (provided by
    // the client, organized into a folder named "marta y alvaro" — matches
    // exactly one of the couple names the client explicitly confirmed
    // earlier). EXIF capture timestamp 2026-06-22; the bouquet ribbon in
    // one selected photo is embroidered with the date "20.06.2026" and the
    // initials "M&A", independently corroborating both the couple and the
    // wedding date.
    slug: 'marta-y-alvaro',
    title: 'Marta y Álvaro',
    category: 'boda',
    year: 2026,
    client: 'Boda privada',
    location: 'Sevilla',
    description: 'Preparativos frente al espejo, una ceremonia al aire libre con los más pequeños de la familia como protagonistas, y un ramo con el día bordado en la cinta.',
    cover: {
      type: 'image',
      src: '/images/trabajos/marta-y-alvaro/cover.webp',
      alt: 'La novia sonriendo con su ramo de claveles y una cinta bordada con la fecha de la boda',
      isPlaceholderMedia: false,
      // Verified via `sips -g pixelWidth -g pixelHeight`.
      width: 1707,
      height: 2560,
    },
    gallery: [
      { type: 'image', src: '/images/trabajos/marta-y-alvaro/06.webp', alt: 'La brocha del maquillaje sobre los ojos cerrados de la novia', isPlaceholderMedia: false, width: 2560, height: 1707, focus: '56% 0%' },
      { type: 'image', src: '/images/trabajos/marta-y-alvaro/07.webp', alt: 'La novia sosteniendo su diadema en las manos antes de ponérsela', isPlaceholderMedia: false, width: 1706, height: 2560, focus: '50% 9%' },
      { type: 'image', src: '/images/trabajos/marta-y-alvaro/08.webp', alt: 'La novia enseñando las zapatillas blancas que lleva bordadas con su nombre', isPlaceholderMedia: false, width: 1707, height: 2560, focus: '50% 18%' },
      { type: 'image', src: '/images/trabajos/marta-y-alvaro/detalle.webp', alt: 'Detalle de la corbata y los gemelos del novio', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/marta-y-alvaro/preparativos-novio.webp', alt: 'El novio arreglándose frente al espejo antes de la ceremonia', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/marta-y-alvaro/09.webp', alt: 'La novia con sus amigas y los niños en la habitación, antes de salir', isPlaceholderMedia: false, width: 2560, height: 1707, focus: '65% 24%' },
      { type: 'image', src: '/images/trabajos/marta-y-alvaro/01.webp', alt: 'Abrochándole el vestido a la novia junto a la ventana', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/marta-y-alvaro/10.webp', alt: 'La novia ya vestida, con el ramo en la mano', isPlaceholderMedia: false, width: 1707, height: 2560, focus: '50% 11%' },
      { type: 'image', src: '/images/trabajos/marta-y-alvaro/11.webp', alt: 'El padre de la novia mirándola por primera vez con el vestido puesto', isPlaceholderMedia: false, width: 2560, height: 1707, focus: '70% 64%' },
      { type: 'image', src: '/images/trabajos/marta-y-alvaro/12.webp', alt: 'Los niños de la boda sentados con los cestillos en las manos', isPlaceholderMedia: false, width: 2560, height: 1707, focus: '71% 9%' },
      { type: 'image', src: '/images/trabajos/marta-y-alvaro/13.webp', alt: 'Uno de los niños de la boda con un bebé en brazos durante la ceremonia, con los novios al fondo', isPlaceholderMedia: false, width: 1707, height: 2560, focus: '50% 36%' },
      { type: 'image', src: '/images/trabajos/marta-y-alvaro/ceremonia.webp', alt: 'Los novios y los pajes durante la ceremonia al aire libre', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/marta-y-alvaro/14.webp', alt: 'La ceremonia vista de lejos, con el campo detrás', isPlaceholderMedia: false, width: 2560, height: 1707, focus: '65% 44%' },
      { type: 'image', src: '/images/trabajos/marta-y-alvaro/15.webp', alt: 'El beso al terminar la ceremonia, entre los invitados', isPlaceholderMedia: false, width: 2560, height: 1707, focus: '52% 16%' },
      { type: 'image', src: '/images/trabajos/marta-y-alvaro/16.webp', alt: 'El beso bajo el arco de entrada de la finca', isPlaceholderMedia: false, width: 1707, height: 2560, focus: '50% 43%' },
      { type: 'image', src: '/images/trabajos/marta-y-alvaro/03.webp', alt: 'Los novios bajo la cúpula del cenador, en blanco y negro', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/marta-y-alvaro/04.webp', alt: 'El beso entre las palmeras, en blanco y negro', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/marta-y-alvaro/05.webp', alt: 'Los novios abrazados, ella con el velo al viento, en blanco y negro', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/marta-y-alvaro/17.webp', alt: 'El cóctel bajo las sombrillas, con los invitados alrededor de los novios', isPlaceholderMedia: false, width: 2560, height: 1707, focus: '96% 34%' },
      { type: 'image', src: '/images/trabajos/marta-y-alvaro/18.webp', alt: 'Los novios solos en el salón, ya montado para la cena', isPlaceholderMedia: false, width: 2560, height: 1707, focus: '63% 27%' },
      { type: 'image', src: '/images/trabajos/marta-y-alvaro/19.webp', alt: 'El novio entrando al salón entre los aplausos de los invitados', isPlaceholderMedia: false, width: 2560, height: 1707, focus: '61% 12%' },
    ],
  },
  {
    // Real photos from an actual EME Fotografía wedding shoot (provided by
    // the client, organized into a folder named "maria y francisco
    // manuel" — a couple not previously named/confirmed elsewhere in this
    // project's records, no discrepancy to flag). EXIF capture timestamp
    // 2026-07-27.
    slug: 'maria-y-francisco-manuel',
    title: 'María y Francisco Manuel',
    category: 'boda',
    year: 2026,
    client: 'Boda privada',
    location: 'Sevilla',
    description: 'Una novia con diadema de estrellas, un coche clásico rojo a la puerta y un abrazo con la cola del vestido extendida sobre el suelo.',
    cover: {
      type: 'image',
      src: '/images/trabajos/maria-y-francisco-manuel/cover.webp',
      alt: 'Retrato de la novia con diadema y ramo de rosas blancas y eucalipto',
      isPlaceholderMedia: false,
      // Verified via `sips -g pixelWidth -g pixelHeight`.
      width: 1707,
      height: 2560,
    },
    gallery: [
      { type: 'image', src: '/images/trabajos/maria-y-francisco-manuel/05.webp', alt: 'La corbata azul del novio con un gemelo encima, sobre la mesa junto a los zapatos', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/maria-y-francisco-manuel/06.webp', alt: 'Los dos niños de la boda ayudando al novio a terminar de vestirse', isPlaceholderMedia: false, width: 2560, height: 1707, focus: '31% 9%' },
      { type: 'image', src: '/images/trabajos/maria-y-francisco-manuel/07.webp', alt: 'La novia acabando de arreglarse junto a la ventana, con las fotos de familia en la cómoda', isPlaceholderMedia: false, width: 1707, height: 2560, focus: '50% 62%' },
      { type: 'image', src: '/images/trabajos/maria-y-francisco-manuel/20.webp', alt: 'La novia perfumándose ante el espejo del tocador, en blanco y negro', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/maria-y-francisco-manuel/llegada.webp', alt: 'La novia llegando en un coche clásico rojo junto a su padre', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/maria-y-francisco-manuel/08.webp', alt: 'El padre de la novia caminando junto al coche rojo, con ella esperando dentro', isPlaceholderMedia: false, width: 2560, height: 1707, focus: '11% 4%' },
      { type: 'image', src: '/images/trabajos/maria-y-francisco-manuel/09.webp', alt: 'La fachada de la iglesia con el coche rojo a la puerta y los invitados esperando', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/maria-y-francisco-manuel/01.webp', alt: 'La novia entrando del brazo de sus padres, con los niños delante', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/maria-y-francisco-manuel/10.webp', alt: 'La novia ante el retablo dorado, con el velo extendido por las gradas del altar', isPlaceholderMedia: false, width: 1707, height: 2560, focus: '50% 21%' },
      { type: 'image', src: '/images/trabajos/maria-y-francisco-manuel/11.webp', alt: 'Los novios de pie ante el altar durante la ceremonia, con los padrinos a los lados', isPlaceholderMedia: false, width: 1707, height: 2560, focus: '50% 21%' },
      { type: 'image', src: '/images/trabajos/maria-y-francisco-manuel/12.webp', alt: 'El novio sujetándole la cara a la novia para besarla, con el velo por medio', isPlaceholderMedia: false, width: 2560, height: 1707, focus: '45% 1%' },
      { type: 'image', src: '/images/trabajos/maria-y-francisco-manuel/13.webp', alt: 'La salida de la iglesia entre el arroz, con los invitados a los lados', isPlaceholderMedia: false, width: 2560, height: 1707, focus: '62% 12%' },
      { type: 'image', src: '/images/trabajos/maria-y-francisco-manuel/14.webp', alt: 'La novia saliendo a la calle con el velo al vuelo y un invitado aplaudiendo', isPlaceholderMedia: false, width: 2560, height: 1707, focus: '58% 22%' },
      { type: 'image', src: '/images/trabajos/maria-y-francisco-manuel/15.webp', alt: 'La novia abrazando a una invitada a la salida, con el ramo en la mano', isPlaceholderMedia: false, width: 1707, height: 2560, focus: '50% 24%' },
      { type: 'image', src: '/images/trabajos/maria-y-francisco-manuel/16.webp', alt: 'Los novios de espaldas por una galería larga, con la cola del vestido detrás', isPlaceholderMedia: false, width: 1707, height: 2560, focus: '50% 34%' },
      { type: 'image', src: '/images/trabajos/maria-y-francisco-manuel/17.webp', alt: 'Los novios apoyados en una pared lisa, con el velo extendido por el suelo', isPlaceholderMedia: false, width: 1707, height: 2560, focus: '50% 18%' },
      { type: 'image', src: '/images/trabajos/maria-y-francisco-manuel/pareja.webp', alt: 'Los novios abrazados con la cola del vestido extendida sobre el suelo', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/maria-y-francisco-manuel/18.webp', alt: 'Los novios besándose bajo un arco iluminado, ya de noche', isPlaceholderMedia: false, width: 1706, height: 2560, focus: '50% 20%' },
      { type: 'image', src: '/images/trabajos/maria-y-francisco-manuel/19.webp', alt: 'La novia riéndose con el novio abrazándola junto al arco de flores', isPlaceholderMedia: false, width: 2560, height: 1707, focus: '36% 15%' },
      { type: 'image', src: '/images/trabajos/maria-y-francisco-manuel/03.webp', alt: 'El novio levantando en volandas a la novia entre los invitados', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/maria-y-francisco-manuel/04.webp', alt: 'Los fuegos artificiales sobre la fiesta', isPlaceholderMedia: false, width: 2560, height: 1707 },
    ],
  },
  {
    // Real photos from an actual EME Fotografía wedding shoot (provided by
    // the client, organized into a folder named "rocío y juanje" — matches
    // exactly one of the couple names the client explicitly confirmed
    // earlier). EXIF capture timestamps mostly 2026-05-05, one selected
    // file (the rings detail) dated 2026-06-02 -- only the year is stated
    // in this project's data model, so this day-level discrepancy doesn't
    // affect anything recorded here.
    slug: 'rocio-y-juanje',
    title: 'Rocío y Juanje',
    category: 'boda',
    year: 2026,
    client: 'Boda privada',
    location: 'Sevilla',
    description: 'De un anillo con guiño personal a la novia esperando junto a un coche clásico, hasta el novio levantado en volandas por sus amigos en la fiesta.',
    cover: {
      type: 'image',
      src: '/images/trabajos/rocio-y-juanje/cover.webp',
      alt: 'Retrato de la novia con tiara y ramo de rosas blancas sobre suelo de damero',
      isPlaceholderMedia: false,
      // Verified via `sips -g pixelWidth -g pixelHeight`.
      width: 1707,
      height: 2560,
    },
    gallery: [
      { type: 'image', src: '/images/trabajos/rocio-y-juanje/01.webp', alt: 'Los novios en el estudio de tatuaje: él la besa mientras a ella la tatúan', isPlaceholderMedia: false, width: 1707, height: 2560, focus: '50% 56%' },
      { type: 'image', src: '/images/trabajos/rocio-y-juanje/02.webp', alt: 'El novio poniéndose la camisa en la habitación, con los zapatos sobre la cama', isPlaceholderMedia: false, width: 2560, height: 1707, focus: '76% 16%' },
      { type: 'image', src: '/images/trabajos/rocio-y-juanje/detalle.webp', alt: 'El novio mostrando un anillo con un guiño personal', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/rocio-y-juanje/03.webp', alt: 'Un invitado sujetando un perrito junto al novio, ya vestido', isPlaceholderMedia: false, width: 1707, height: 2560, focus: '50% 31%' },
      { type: 'image', src: '/images/trabajos/rocio-y-juanje/04.webp', alt: 'El novio al fondo, detrás de unas flores desenfocadas', isPlaceholderMedia: false, width: 1707, height: 2560, focus: '50% 50%' },
      { type: 'image', src: '/images/trabajos/rocio-y-juanje/05.webp', alt: 'La novia sentada y ya vestida, en la habitación de suelo de damero', isPlaceholderMedia: false, width: 1707, height: 2560, focus: '50% 36%' },
      { type: 'image', src: '/images/trabajos/rocio-y-juanje/06.webp', alt: 'La novia con el velo largo y su padre a su lado, secándose los ojos', isPlaceholderMedia: false, width: 2560, height: 1707, focus: '50% 3%' },
      { type: 'image', src: '/images/trabajos/rocio-y-juanje/07.webp', alt: 'El abrazo de la novia a su padre, con el velo cubriéndolos', isPlaceholderMedia: false, width: 2560, height: 1707, focus: '45% 30%' },
      { type: 'image', src: '/images/trabajos/rocio-y-juanje/llegada.webp', alt: 'El novio esperando junto a un coche clásico mientras llega la novia', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/rocio-y-juanje/08.webp', alt: 'La puerta de la iglesia con los invitados esperando a que llegue la novia', isPlaceholderMedia: false, width: 2560, height: 1707, focus: '50% 10%' },
      { type: 'image', src: '/images/trabajos/rocio-y-juanje/09.webp', alt: 'Los novios frente a frente en el altar, él de perfil y ella con el velo puesto', isPlaceholderMedia: false, width: 2560, height: 1707, focus: '53% 12%' },
      { type: 'image', src: '/images/trabajos/rocio-y-juanje/10.webp', alt: 'La novia ante el altar durante la ceremonia, con la madrina al lado', isPlaceholderMedia: false, width: 2560, height: 1707, focus: '40% 2%' },
      { type: 'image', src: '/images/trabajos/rocio-y-juanje/11.webp', alt: 'Los novios sentados durante la ceremonia, mirándose', isPlaceholderMedia: false, width: 1707, height: 2560, focus: '50% 12%' },
      { type: 'image', src: '/images/trabajos/rocio-y-juanje/12.webp', alt: 'La salida de la iglesia, con el novio esperando entre los invitados', isPlaceholderMedia: false, width: 2560, height: 1707, focus: '22% 6%' },
      { type: 'image', src: '/images/trabajos/rocio-y-juanje/13.webp', alt: 'Los novios saliendo a la calle entre la gente, ella con el brazo en alto', isPlaceholderMedia: false, width: 2560, height: 1707, focus: '75% 28%' },
      { type: 'image', src: '/images/trabajos/rocio-y-juanje/14.webp', alt: 'El novio dentro del coche, visto a través del parabrisas', isPlaceholderMedia: false, width: 2560, height: 1707, focus: '31% 23%' },
      { type: 'image', src: '/images/trabajos/rocio-y-juanje/15.webp', alt: 'Los novios junto al coche clásico, ella de espaldas con el velo extendido', isPlaceholderMedia: false, width: 2560, height: 1707, focus: '46% 29%' },
      { type: 'image', src: '/images/trabajos/rocio-y-juanje/16.webp', alt: 'El cóctel en el patio, con las invitadas alrededor de la novia', isPlaceholderMedia: false, width: 2560, height: 1707, focus: '47% 13%' },
      { type: 'image', src: '/images/trabajos/rocio-y-juanje/17.webp', alt: 'El novio riéndose con sus amigos durante la fiesta', isPlaceholderMedia: false, width: 2560, height: 1707, focus: '64% 18%' },
      { type: 'image', src: '/images/trabajos/rocio-y-juanje/18.webp', alt: 'La novia bailando entre las invitadas', isPlaceholderMedia: false, width: 2560, height: 1707, focus: '25% 13%' },
      { type: 'image', src: '/images/trabajos/rocio-y-juanje/fiesta.webp', alt: 'El novio levantado en volandas por sus amigos durante la fiesta', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/rocio-y-juanje/19.webp', alt: 'El beso de los novios en la pista, ya de noche', isPlaceholderMedia: false, width: 2560, height: 1707, focus: '60% 20%' },
    ],
  },
  {
    // Fotografías reales del estudio, entregadas en el disco duro del cliente
    // (carpeta «NUEVA. PRE BODA HUELVA ANGELICA», 8 archivos). EXIF: todas el
    // 14 de octubre de 2023. La misma pareja que la boda de
    // `angelica-y-jesus`, que fue el 9 de diciembre de 2023: esta sesión es de
    // dos meses antes, y por eso la ficha dice «preboda» y no lo deduce el
    // lector.
    //
    // PENDIENTE DE CONFIRMAR POR EL ESTUDIO: el municipio. La carpeta solo
    // dice «Huelva». Lo que se ve en las fotos —una torre almenara caída
    // dentro del agua y un faro blanco con banda roja— es reconociblemente
    // Matalascañas (la Torre la Higuera), así que es lo que se escribe aquí
    // en vez de dejarlo en la provincia. Si el estudio dice otra cosa, se
    // corrige este campo y ya está.
    slug: 'preboda-de-angelica-y-jesus',
    title: 'Preboda de Angélica y Jesús',
    category: 'boda',
    year: 2023,
    client: 'Boda privada',
    location: 'Matalascañas, Huelva',
    description: 'Una tarde de octubre en la playa, los dos vestidos de blanco: la pasarela de madera entre las dunas, un beso a contraluz sobre la arena y el paseo por la orilla con la torre caída al fondo. Dos meses antes de su boda.',
    cover: {
      type: 'image',
      src: '/images/trabajos/preboda-de-angelica-y-jesus/cover.webp',
      alt: 'Beso de la pareja en la duna, a la luz del atardecer',
      isPlaceholderMedia: false,
      width: 1707,
      height: 2560,
    },
    gallery: [
      { type: 'image', src: '/images/trabajos/preboda-de-angelica-y-jesus/01.webp', alt: 'Los dos sentados en la pasarela de madera, riéndose, con el faro al fondo', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/preboda-de-angelica-y-jesus/02.webp', alt: 'Beso de puntillas en la pasarela de madera, en blanco y negro', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/preboda-de-angelica-y-jesus/03.webp', alt: 'Ella abrazada a su espalda en la pasarela, con el faro detrás, en blanco y negro', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/preboda-de-angelica-y-jesus/04.webp', alt: 'Ella riéndose abrazada a él entre las dunas, en blanco y negro', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/preboda-de-angelica-y-jesus/05.webp', alt: 'Beso en la duna con las manos entrelazadas en primer plano', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/preboda-de-angelica-y-jesus/06.webp', alt: 'Los dos de la mano caminando por la orilla, con la torre caída al fondo', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/preboda-de-angelica-y-jesus/07.webp', alt: 'Beso descalzos en la orilla, con la torre caída dentro del agua', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/preboda-de-angelica-y-jesus/08.webp', alt: 'Los dos caminando por la arena mojada al final de la tarde', isPlaceholderMedia: false, width: 2560, height: 1707 },
    ],
  },
  {
    // Fotografías reales del estudio, entregadas en el disco duro del cliente
    // (carpeta «sandra-y-jesus-29-8-26», 38 archivos; aquí van los 26 que
    // cuentan el día sin repetirse). Boda de uniforme, con arco de sables a la
    // salida de la iglesia.
    //
    // El municipio NO está inventado: en una de las fotografías de la entrada
    // a la fiesta se lee el rótulo de la finca sobre el arco, y esa finca está
    // en Utrera. La fecha viene del nombre de la carpeta, 29 de agosto de 2026.
    slug: 'sandra-y-jesus',
    title: 'Sandra y Jesús',
    category: 'boda',
    year: 2026,
    client: 'Boda privada',
    location: 'Utrera, Sevilla',
    description: 'Una boda de uniforme: la casa en calma por la mañana, el arco de sables a la salida de la iglesia, el coche clásico a la puerta de la hacienda y una fiesta que acabó con la novia bailando con unas alas de luz.',
    cover: {
      type: 'image',
      src: '/images/trabajos/sandra-y-jesus/cover.webp',
      alt: 'Los novios frente a frente ante la fachada de la hacienda',
      isPlaceholderMedia: false,
      width: 1707,
      height: 2560,
    },
    gallery: [
      { type: 'image', src: '/images/trabajos/sandra-y-jesus/01.webp', alt: 'La lámpara encendida y el ramo esperando junto a la ventana', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/sandra-y-jesus/02.webp', alt: 'La novia riéndose mientras la maquillan', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/sandra-y-jesus/03.webp', alt: 'Un niño abrazado a la novia en el salón de casa, en blanco y negro', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/sandra-y-jesus/04.webp', alt: 'La novia sentada junto a la ventana con el vestido extendido, en blanco y negro', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/sandra-y-jesus/05.webp', alt: 'La novia con el velo al vuelo entre las hojas de una puerta, en blanco y negro', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/sandra-y-jesus/06.webp', alt: 'La novia al fondo de una galería larga de cuadros, en blanco y negro', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/sandra-y-jesus/07.webp', alt: 'La novia llevándose las manos a la cara antes de salir, en blanco y negro', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/sandra-y-jesus/08.webp', alt: 'El novio de uniforme con su madre ante el retablo de la iglesia', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/sandra-y-jesus/09.webp', alt: 'El abrazo del novio a la novia con el ramo entre los dos, en blanco y negro', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/sandra-y-jesus/10.webp', alt: 'Los novios sentados durante la ceremonia, vistos desde la puerta de la iglesia', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/sandra-y-jesus/11.webp', alt: 'Los novios ante el retablo dorado, ya casados', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/sandra-y-jesus/12.webp', alt: 'El arco de sables esperando a los novios a la salida', isPlaceholderMedia: false, width: 2560, height: 1706 },
      { type: 'image', src: '/images/trabajos/sandra-y-jesus/13.webp', alt: 'El beso de los novios bajo el arco de sables', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/sandra-y-jesus/14.webp', alt: 'La salida entre los invitados con los sables levantados, en blanco y negro', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/sandra-y-jesus/15.webp', alt: 'Las amigas abrazando a la novia, en blanco y negro', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/sandra-y-jesus/16.webp', alt: 'El beso de los novios junto al coche clásico', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/sandra-y-jesus/17.webp', alt: 'Los novios pequeñitos junto al portón de madera, en blanco y negro', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/sandra-y-jesus/18.webp', alt: 'El beso de los novios a contraluz, con el sol poniéndose detrás', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/sandra-y-jesus/19.webp', alt: 'Los novios abrazados bajo el arco de la capilla, en blanco y negro', isPlaceholderMedia: false, width: 1707, height: 2560 },
      { type: 'image', src: '/images/trabajos/sandra-y-jesus/20.webp', alt: 'Los novios entre las mesas puestas, con las palmeras al fondo', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/sandra-y-jesus/21.webp', alt: 'La fachada de la hacienda al atardecer, con los novios y el coche clásico delante', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/sandra-y-jesus/22.webp', alt: 'El novio levantando a la novia en el patio, con la cola del vestido extendida', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/sandra-y-jesus/23.webp', alt: 'La entrada a la fiesta de la mano, entre pétalos', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/sandra-y-jesus/24.webp', alt: 'El baile de los novios bajo los focos, en blanco y negro', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/sandra-y-jesus/25.webp', alt: 'La novia riéndose entre las amigas en plena pista, en blanco y negro', isPlaceholderMedia: false, width: 2560, height: 1707 },
      { type: 'image', src: '/images/trabajos/sandra-y-jesus/26.webp', alt: 'La novia bailando con unas alas de luz al final de la noche', isPlaceholderMedia: false, width: 2560, height: 1707 },
    ],
  },
];
