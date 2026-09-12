import { projects } from './projects';

export interface MosaicTile {
  kind: 'image' | 'video';
  src: string;
  alt: string;
  /** Poster for video tiles. */
  poster?: string;
  /**
   * Softens the site-wide photo grade for this one frame. The grade
   * (--photo-grade) pushes saturation and contrast a little on every
   * photograph, which is right for most of them and wrong for a backlit,
   * already-warm frame: it turns the warmth into an orange cast and
   * deepens the shadows, so the tile reads darker and redder than its
   * neighbours and the eye catches the jump.
   */
  grade?: 'soft';
  /** Real intrinsic pixel size, so a tile can take the photograph's own
   *  shape rather than a uniform crop. See HeroMosaic.module.css. */
  width?: number;
  height?: number;
  /**
   * `object-position` for this tile. Only set it where the site default
   * (50% 18%, styles/globals.css) would cut someone off: every tile is a
   * 3:4 crop, so a photograph with a face low in the frame needs its own
   * anchor. Checked against the crop the tile actually renders.
   */
  focus?: string;
}

export interface MosaicColumn {
  projectSlug: string;
  /** Four tiles shown stacked, top to bottom. */
  tiles: MosaicTile[];
  /** Extra frames the top tile cycles through (crossfade), in order. */
  cycle: MosaicTile[];
}

/**
 * Home hero mosaic: five staggered columns, one wedding per column, every
 * tile cropped to 3:4. Files are the same real, graded assets published
 * on /trabajos; the project supplies the column's name and link.
 */
export const mosaicColumns: MosaicColumn[] = [
  {
    projectSlug: 'carmen-y-alberto',
    tiles: [
      { kind: 'image', src: '/images/trabajos/carmen-y-alberto/cover.webp', alt: 'La novia y el novio bajo el arco de piedra con la cola extendida', width: 1707, height: 2560 },
      { kind: 'image', src: '/images/trabajos/carmen-y-alberto/19.webp', alt: 'La novia con el velo al viento en la calle empedrada al atardecer', width: 2560, height: 1707 },
      { kind: 'image', src: '/images/trabajos/carmen-y-alberto/08.webp', alt: 'La novia jugando con el velo ante el novio de uniforme', width: 2560, height: 1707 },
      { kind: 'image', src: '/images/trabajos/carmen-y-alberto/09.webp', alt: 'Los novios a través del velo, con el ramo', width: 2560, height: 1707 },
    ],
    cycle: [
      { kind: 'image', src: '/images/trabajos/carmen-y-alberto/07.webp', alt: 'El retablo de la iglesia con los novios diminutos ante el altar', width: 1707, height: 2560 },
    ],
  },
  {
    projectSlug: 'gloria-y-andres',
    tiles: [
      { kind: 'image', src: '/images/trabajos/gloria-y-andres/cover.webp', alt: 'Los novios besándose junto al coche clásico con la Giralda al fondo', width: 1707, height: 2560 },
      { kind: 'image', src: '/images/trabajos/gloria-y-andres/13.webp', alt: 'Los novios caminando de la mano bajo la muralla, en blanco y negro', width: 1707, height: 2560 },
      { kind: 'image', src: '/images/trabajos/gloria-y-andres/20.webp', alt: 'Beso en cubierta del barco al anochecer con el puente iluminado', width: 1707, height: 2560 },
      { kind: 'image', src: '/images/trabajos/gloria-y-andres/15.webp', alt: 'La novia sentada en la fuente con la Giralda detrás', width: 1707, height: 2560 },
    ],
    cycle: [
      { kind: 'image', src: '/images/trabajos/gloria-y-andres/08.webp', alt: 'Las damas y la novia con el vestido de volantes, en blanco y negro', width: 1707, height: 2560 },
      { kind: 'image', src: '/images/trabajos/gloria-y-andres/10.webp', alt: 'Los novios ante el altar, con la chaqueta bordada del novio', width: 1707, height: 2560 },
      { kind: 'image', src: '/images/trabajos/gloria-y-andres/18.webp', alt: 'La novia con el ramo en el puente, con el vestido de cola', width: 1707, height: 2560 },
    ],
  },
  {
    // TODAS LAS PIEZAS DE ESTA CASILLA SON DE LA MISMA BODA, y por eso ha
    // cambiado de pareja. El plano de dron es de Andrea y Jesús, pero la
    // casilla enlazaba a Eva y Rafa y acompañaba ese vídeo con tres
    // fotografías de ella: quien pulsaba desde la portada llegaba a una ficha
    // donde no estaba nada de lo que acababa de ver. Ahora la casilla es
    // entera de Andrea y Jesús -- su vídeo y sus tres fotografías --, que es
    // además la ficha de vídeo del sitio.
    projectSlug: 'andrea-y-jesus',
    tiles: [
      {
        kind: 'video',
        // Recorte 3:4 del máster 4K de dron, a 960x1280 (2,5 MB) para que la
        // casilla -- 480 px de ancho en pantalla -- tenga los 2x que pide una
        // pantalla retina; antes salía de un reescalado a 480x640 y en un
        // portátil moderno se veía blando. El preview 16:9 completo se queda
        // para la página del reportaje.
        src: '/videos/previews/andrea-y-jesus-hero-drone-tile.mp4',
        poster: '/videos/posters/andrea-y-jesus-hero-drone-tile.webp',
        alt: 'Los novios junto al coche clásico a las puertas de la hacienda, vistos desde el aire',
      },
      { kind: 'image', src: '/images/trabajos/andrea-y-jesus/preparativos.webp', alt: 'La novia reflejada en un espejo durante los preparativos', width: 1707, height: 2560, grade: 'soft' },
      { kind: 'image', src: '/images/trabajos/andrea-y-jesus/cover.webp', alt: 'Primer baile de los novios bajo luces de escenario', width: 2560, height: 1707 },
      { kind: 'image', src: '/images/trabajos/andrea-y-jesus/fiesta.webp', alt: 'Invitadas bailando y celebrando en la fiesta', width: 2560, height: 1707 },
    ],
    cycle: [],
  },
  {
    projectSlug: 'postboda-en-el-real-alcazar',
    tiles: [
      { kind: 'image', src: '/images/trabajos/postboda-en-el-real-alcazar/cover.webp', alt: 'Los novios abrazados bajo los arcos dorados de los baños del Alcázar', width: 1707, height: 2560 },
      { kind: 'image', src: '/images/trabajos/postboda-en-el-real-alcazar/03.webp', alt: 'Los novios reflejados en la alberca del Patio de las Doncellas', width: 1707, height: 2560 },
      { kind: 'image', src: '/images/trabajos/postboda-en-el-real-alcazar/12.webp', alt: 'Los novios frente a frente bajo un arco con la Giralda al fondo', width: 1707, height: 2560 },
      { kind: 'image', src: '/images/trabajos/postboda-en-el-real-alcazar/01.webp', alt: 'Los novios ante la gran puerta de madera del Alcázar, con la cola del vestido extendida', width: 1707, height: 2560 },
    ],
    cycle: [
      { kind: 'image', src: '/images/trabajos/postboda-en-el-real-alcazar/07.webp', alt: 'La novia apoyada en el pecho del novio bajo los arcos, a media luz', width: 1707, height: 2560 },
      { kind: 'image', src: '/images/trabajos/postboda-en-el-real-alcazar/14.webp', alt: 'Los novios de la mano en el Patio de Banderas con la Giralda detrás', width: 1707, height: 2560 },
      { kind: 'image', src: '/images/trabajos/postboda-en-el-real-alcazar/10.webp', alt: 'Los novios sentados en la escalera de azulejos del jardín', width: 1707, height: 2560 },
    ],
  },
  {
    projectSlug: 'jesus-y-javier',
    tiles: [
      { kind: 'image', src: '/images/trabajos/jesus-y-javier/14.webp', alt: 'Los novios saliendo por el arco entre humo azul y blanco', width: 1707, height: 2560 },
      { kind: 'image', src: '/images/trabajos/jesus-y-javier/07.webp', alt: 'El beso tras el sí en el patio de la hacienda', width: 1707, height: 2560 },
      { kind: 'image', src: '/images/trabajos/jesus-y-javier/10.webp', alt: 'Frente con frente, a través de un velo de luz dorada', width: 1707, height: 2560 },
      { kind: 'image', src: '/images/trabajos/jesus-y-javier/13.webp', alt: 'Retrato de los novios en la torre de la hacienda, en blanco y negro', width: 1707, height: 2560 },
    ],
    cycle: [
      { kind: 'image', src: '/images/trabajos/jesus-y-javier/08.webp', alt: 'Los novios riendo bajo la lluvia de pétalos', width: 1707, height: 2560 },
      { kind: 'image', src: '/images/trabajos/jesus-y-javier/02.webp', alt: 'Uno de los novios riendo mientras se abrocha la chaqueta', width: 1707, height: 2560 },
      { kind: 'image', src: '/images/trabajos/jesus-y-javier/09.webp', alt: 'Los novios en la capilla de la hacienda, ante el retablo', width: 1707, height: 2560 },
    ],
  },
];

/** Columns joined with their project (title + href); columns whose project is unpublished are dropped. */
export function resolveMosaicColumns() {
  return mosaicColumns.flatMap((col) => {
    const project = projects.find((p) => p.slug === col.projectSlug);
    return project ? [{ ...col, project }] : [];
  });
}
