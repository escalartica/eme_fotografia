import { site } from '@/content/site';
import { formatRating } from '@/lib/format';
import { ScrollReveal } from '@/components/motion/ScrollReveal';
import styles from './Cifras.module.css';

/**
 * Trust strip: three real, verifiable figures from the studio's Bodas.net
 * profile (content/site.ts documents the verification), plus the service
 * count. Deliberately terse -- a row of serif numerals over hairlines, the
 * same "table of contents" language as ServiciosPreview -- rather than a
 * badge wall. All numbers come from content/site.ts so they can be kept
 * current in one place.
 */
export function Cifras() {
  const figures: { value: string; label: string; stars?: number; years?: string[]; href?: string }[] = [
    {
      value: `+${site.bodasNetCoupleCount}`,
      label: 'parejas nos han confiado su boda',
    },
    {
      value: formatRating(site.bodasNetRating),
      // Five filled stars under the numeral say "maximum score" without a
      // fraction; the label spells it out for anyone reading it aloud.
      stars: Math.round(site.bodasNetRating),
      label: `puntuación máxima en Bodas.net, con ${site.bodasNetReviewCount} opiniones verificadas`,
      href: site.bodasNetUrl,
    },
    {
      // Five Wedding Awards: 2019, 2021, 2022, 2023 and 2025. Not a claim
      // invented here -- all five badges are published further down this
      // same site (Testimonios.tsx renders every one with its year in the
      // alt text), so the run is the studio's own and independently
      // checkable on the linked Bodas.net profile. A five-year run says
      // considerably more than the latest year on its own, which is what
      // this figure used to show.
      value: '5',
      // The five years, spelled out beside the numeral. A bare "5" sat with
      // nothing next to it while the rating beside it carried five stars,
      // so the column read as unfinished. These are not decoration: they
      // are the same five badges Testimonios.tsx renders further down the
      // page, which is what makes the figure checkable rather than a claim.
      years: ['2019', '2021', '2022', '2023', '2025'],
      label: 'años premiados en los Wedding Awards de Bodas.net, que los votan las parejas',
      href: site.bodasNetUrl,
    },
  ];

  return (
    <ScrollReveal>
      <section className={styles.section} aria-label="Cifras de EME Fotografía Sevilla">
        <dl className={styles.list}>
          {figures.map((f) => (
            <div key={f.label} className={styles.item}>
              <dt className={styles.label}>{f.label}</dt>
              <dd className={styles.value}>
                {f.href ? (
                  <a href={f.href} target="_blank" rel="noopener noreferrer" className={styles.valueLink}>
                    {f.value}
                  </a>
                ) : (
                  f.value
                )}
                {/* role="img" is required, not decoration: aria-label on a bare
                    <span> (role `generic`) is prohibited by ARIA in HTML and
                    browsers drop it, and every child here is aria-hidden -- so
                    without the role the five years were announced as nothing at
                    all. `.stars` below already does this. */}
                {f.years && (
                  <span className={styles.years} role="img" aria-label={`Años premiados: ${f.years.join(', ')}`}>
                    {f.years.map((y) => (
                      <span key={y} className={styles.year} aria-hidden="true">
                        {`’${y.slice(2)}`}
                      </span>
                    ))}
                  </span>
                )}
                {f.stars && (
                  <span className={styles.stars} role="img" aria-label={`${f.stars} de ${f.stars} estrellas`}>
                    {Array.from({ length: f.stars }, (_, i) => (
                      <svg key={i} viewBox="0 0 24 24" aria-hidden="true" className={styles.star}>
                        <path d="M12 2.6l2.9 6.2 6.8.8-5 4.7 1.3 6.7L12 17.7 6 21l1.3-6.7-5-4.7 6.8-.8z" />
                      </svg>
                    ))}
                  </span>
                )}
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </ScrollReveal>
  );
}
