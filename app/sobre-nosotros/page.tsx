import Image from 'next/image';
import { site } from '@/content/site';
import { buildMetadata } from '@/lib/seo';
import { ShowreelClip } from '@/components/sections/ShowreelClip';
import styles from './page.module.css';

export const metadata = buildMetadata({
  title: 'Sobre nosotros',
  description: 'Contamos bodas y eventos como editoriales de moda: dirección de arte, luz cuidada y una narrativa propia.',
  path: '/sobre-nosotros',
});

export default function Page() {
  return (
    <article className={styles.page}>
      {/* Full-bleed real photo opener, mirroring /trabajos's own bespoke
          opener (TrabajosFilter.module.css) rather than the generic
          `.section { max-width; margin-inline: auto; text-align: center }`
          idiom this page used to be built from entirely. A real, unedited
          aerial frame of a hacienda venue -- the kind of place this studio
          actually shoots at -- rather than a stock or placeholder image. */}
      <div className={styles.opener}>
        <Image
          src="/images/sobre-nosotros/hacienda-establecimiento.webp"
          alt="Vista aérea de una hacienda sevillana al atardecer, uno de los escenarios reales donde trabajamos"
          fill
          sizes="100vw"
          className={styles.openerImage}
          priority
        />
        <div className={styles.openerScrim} aria-hidden="true" />
        <div className={styles.openerContent}>
          <span className={styles.openerChapter} aria-hidden="true">00</span>
          <h1 className={styles.openerTitle}>{site.brandName}</h1>
        </div>
      </div>

      <p className={styles.intro}>
        Contamos bodas y eventos como se cuentan los editoriales: con dirección de arte, luz cuidada y una narrativa
        propia, no como un reportaje al uso.
      </p>

      <section aria-labelledby="filosofia-heading" className={styles.section}>
        <span className={styles.chapterNumber} aria-hidden="true">01</span>
        <h2 id="filosofia-heading">Filosofía</h2>
        <p>Cada encargo empieza por entender a las personas, no solo el evento. La cámara viene después.</p>
      </section>

      <section aria-labelledby="proceso-heading" className={styles.section}>
        <span className={styles.chapterNumber} aria-hidden="true">02</span>
        <h2 id="proceso-heading">Proceso</h2>
        <p>De la primera llamada a la entrega final, mantenemos una comunicación cercana y plazos claros.</p>
      </section>

      <section aria-labelledby="trabajo-heading" className={styles.section}>
        <span className={styles.chapterNumber} aria-hidden="true">03</span>
        <h2 id="trabajo-heading">Nuestro trabajo</h2>
        <p>Un vistazo real a bodas que ya hemos contado.</p>
        <ShowreelClip
          src="/videos/previews/showreel.mp4"
          poster="/videos/posters/showreel.webp"
          alt="Montaje de fotografías reales de varias bodas recientes"
        />
      </section>

      <section aria-labelledby="equipo-heading" className={styles.section}>
        <span className={styles.chapterNumber} aria-hidden="true">04</span>
        <h2 id="equipo-heading">Equipo</h2>
        <Image
          src="/images/sobre-nosotros/placeholder-team.webp"
          alt="Equipo de EME Fotografía Sevilla (imagen de muestra)"
          width={800}
          height={1200}
          sizes="(max-width: 700px) 100vw, 44rem"
          className={styles.teamImage}
        />
        <p>
          Al frente del estudio está {site.founderName}, fotógrafa. El resto de la trayectoria del equipo, así como
          la fotografía real del equipo, está pendiente de confirmación por el cliente — esta sección se actualizará
          con los datos reales.
        </p>
      </section>
    </article>
  );
}
