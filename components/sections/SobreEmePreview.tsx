import Image from 'next/image';
import Link from 'next/link';
import { site } from '@/content/site';
import { ScrollReveal } from '@/components/motion/ScrollReveal';
import styles from './SobreEmePreview.module.css';

export function SobreEmePreview() {
  return (
    <ScrollReveal>
      <section className={styles.section} aria-labelledby="sobre-heading">
        <div className={styles.layout}>
          <div className={styles.imageWrap}>
            <Image
              src="/images/sobre-nosotros/placeholder-team.webp"
              alt="Equipo de EME Fotografía Sevilla"
              fill
              sizes="(max-width: 700px) 100vw, 50vw"
            />
          </div>
          <div className={styles.text}>
            <p className={styles.eyebrow}>Sobre {site.brandName}</p>
            {/* `blur` layers a filter: blur(6px) → 0 transition on top of the
                base ScrollReveal fade+translate, scoped to just this one
                statement line — see ScrollReveal.tsx for the reasoning. */}
            <ScrollReveal blur>
              <h2 id="sobre-heading" className={styles.heading}>
                No dirigimos la boda: la seguimos de cerca hasta que se cuenta sola.
              </h2>
            </ScrollReveal>
            <p className={styles.body}>
              Un estudio de fotografía y vídeo en {site.legalCity} que trata cada boda y cada
              evento como una historia editorial, no como un simple reportaje.
            </p>
            <Link href="/sobre-nosotros" className={styles.link}>
              Conocer el estudio
            </Link>
          </div>
        </div>
      </section>
    </ScrollReveal>
  );
}
