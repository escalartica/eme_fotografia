import { projects } from './projects';

export interface FeaturedFrame {
  /** Project the frame belongs to -- the slide links to /trabajos/<slug>. */
  projectSlug: string;
  src: string;
  alt: string;
  /** Real intrinsic pixel size of the file, never guessed. */
  width: number;
  height: number;
  /**
   * `object-position` for this frame. Only set it when the default
   * (50% 18%, styles/globals.css) would clip a face: the reel crops every
   * frame to 3:4, 4:3 or 1:1, so a photograph with someone near an edge
   * needs its own anchor. Verified per frame against the crop the reel
   * actually produces, drift included.
   */
  focus?: string;
}

/**
 * The home reel (SelectedReel): ten frames, ONE per wedding, and none of
 * them from the five weddings in the hero mosaic above -- scrolling the
 * home page never shows the same photograph, or the same couple, twice.
 * Shapes alternate portrait / landscape / square by position, so the list
 * order also sets the rhythm of the column.
 */
export const featuredFrames: FeaturedFrame[] = [
  { projectSlug: 'angelica-y-jesus', src: '/images/trabajos/angelica-y-jesus/12.webp', alt: 'Vista cenital de los novios sobre la línea de la carretera con el velo extendido', width: 1600, height: 987 },
  { projectSlug: 'carmen-y-enrique', src: '/images/trabajos/carmen-y-enrique/cover.webp', alt: 'Silueta de los novios bajo el velo frente a los faros del coche clásico', width: 1333, height: 2000 },
  { projectSlug: 'miriam-y-alejandro', src: '/images/trabajos/miriam-y-alejandro/13.webp', alt: 'Los novios caminando por la alfombra roja entre los árboles de la hacienda', width: 1600, height: 1067 },
  { projectSlug: 'postboda-entre-casas-blancas', src: '/images/trabajos/postboda-entre-casas-blancas/cover.webp', alt: 'La novia haciendo volar el velo en una calle empedrada del pueblo', width: 1333, height: 2000 },
  { projectSlug: 'reyes-y-francisco', src: '/images/trabajos/reyes-y-francisco/15.webp', alt: 'Primer baile entre bengalas frías', width: 1600, height: 1067 },
  { projectSlug: 'preboda-en-un-pueblo-de-la-sierra', src: '/images/trabajos/preboda-en-un-pueblo-de-la-sierra/cover.webp', alt: 'La pareja abrazada junto a las columnas de un patio a la luz dorada', width: 1333, height: 2000 },
  { projectSlug: 'kuki-y-jose', src: '/images/trabajos/kuki-y-jose/cover.webp', alt: 'Pasillo de sables de luz para los novios', width: 2000, height: 1333 },
  { projectSlug: 'silvia-y-jordi', src: '/images/trabajos/silvia-y-jordi/10.webp', alt: 'Los novios ante el cortijo blanco iluminado de noche', width: 1600, height: 1067 },
  { projectSlug: 'virginia-y-jorge', src: '/images/trabajos/virginia-y-jorge/12.webp', alt: 'Los novios de noche frente a los faros del coche clásico', width: 1600, height: 1067 },
  { projectSlug: 'rocio-y-manuel', src: '/images/trabajos/rocio-y-manuel/cover.webp', alt: 'Beso bajo el paraguas transparente', width: 1333, height: 2000 },
];

/** Frames joined with their project (title, location, href); unpublished projects drop out. */
export function resolveFeaturedFrames() {
  return featuredFrames.flatMap((frame) => {
    const project = projects.find((p) => p.slug === frame.projectSlug);
    return project ? [{ ...frame, project }] : [];
  });
}
