import Image from 'next/image';
import Link from 'next/link';
import { site } from '@/content/site';
import { ScrollReveal } from '@/components/motion/ScrollReveal';
import styles from './SobreEmePreview.module.css';

export function SobreEmePreview() {
  return (
    <section className={styles.section} aria-labelledby="sobre-heading">
      <div className={styles.layout}>
        {/* Each block below is its own top-level ScrollReveal instance rather
            than one nested inside another. Nesting them (an earlier version
            of this component did) caused a real bug: the outer instance's
            own translateY animation shifts the inner instance's DOM position
            while ITS ScrollTrigger is simultaneously measuring/animating
            against that same position, so the inner reveal never reliably
            settles (confirmed stuck mid-transition — opacity ~0.68,
            filter: blur(~2px) — in a real browser). Keeping every instance a
            sibling, none an ancestor of another, removes that conflict. */}
        <ScrollReveal className={styles.imageWrap}>
          <Image
            src="/images/sobre-nosotros/placeholder-team.webp"
            alt="Equipo de EME Fotografía Sevilla"
            fill
            sizes="(max-width: 700px) 100vw, 50vw"
          />
        </ScrollReveal>
        <div className={styles.text}>
          <ScrollReveal>
            <span className={styles.chapterNumber} aria-hidden="true">
              02
            </span>
          </ScrollReveal>
          <ScrollReveal>
            <p className={styles.eyebrow}>Sobre {site.brandName}</p>
          </ScrollReveal>
          {/* `blur` layers a filter: blur(6px) → 0 transition on top of the
              base ScrollReveal fade+translate, scoped to just this one
              statement line — see ScrollReveal.tsx for the reasoning. */}
          <ScrollReveal blur>
            <h2 id="sobre-heading" className={styles.heading}>
              No dirigimos la boda: la seguimos de cerca hasta que se cuenta sola.
            </h2>
          </ScrollReveal>
          <ScrollReveal>
            <p className={styles.body}>
              Un estudio de fotografía y vídeo en {site.legalCity} que trata cada boda y cada
              evento como una historia editorial, no como un simple reportaje.
            </p>
          </ScrollReveal>
          <Link href="/sobre-nosotros" className={styles.link}>
            Conocer el estudio
          </Link>
        </div>
      </div>
    </section>
  );
}
