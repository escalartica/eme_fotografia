import { site } from '@/content/site';
import { Contador, type FormatoCifra } from '@/components/motion/Contador';
import styles from './Cifras.module.css';

/**
 * Trust strip: three real, verifiable figures from the studio's Bodas.net
 * profile (content/site.ts documents the verification), plus the service
 * count. Deliberately terse -- a row of serif numerals over hairlines, the
 * same "table of contents" language as ServiciosPreview -- rather than a
 * badge wall. All numbers come from content/site.ts so they can be kept
 * current in one place.
 *
 * CÓMO ENTRA. Las tres cifras se escalonan de izquierda a derecha y cada
 * numeral sube desde detrás de su propia ventana -- el mismo gesto de
 * `components/motion/RevealWords`, aquí a tamaño pequeño y escalonado por
 * columna en vez de por palabra (ver Cifras.module.css). Antes esto era un
 * único `<ScrollReveal>` alrededor de la sección entera: las tres cifras
 * llegaban a la vez y en bloque, que es precisamente lo que hace que un
 * recibo parezca un banner. Además ese envoltorio desplazaba a sus
 * descendientes mientras ellos medían su propia posición, que es el fallo de
 * los reveals anidados que este proyecto ya documenta en dos sitios.
 */
export function Cifras() {
  /**
   * LAS CIFRAS CUENTAN AL ENTRAR. El valor va como número, no como cadena, y
   * `<Contador>` se encarga de escribirlo: así puede subir hasta él cuando la
   * franja entra en pantalla, que es el gesto que pidió el cliente (el
   * contador de la referencia que trajo). Lo que se renderiza en el servidor
   * es el valor FINAL -- ver el comentario del componente sobre por qué no
   * puede empezar en cero.
   */
  const figures: { valor: number; formato: FormatoCifra; label: string; stars?: number; years?: string[]; href?: string }[] = [
    {
      valor: site.coupleCount,
      formato: 'entero-con-mas',
      label: 'parejas nos han confiado su boda',
    },
    {
      valor: site.bodasNetRating,
      formato: 'nota',
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
      valor: 5,
      formato: 'entero',
      // The five years, spelled out beside the numeral. A bare "5" sat with
      // nothing next to it while the rating beside it carried five stars,
      // so the column read as unfinished. These are not decoration: they
      // are the same five badges Testimonios.tsx renders further down the
      // page, which is what makes the figure checkable rather than a claim.
      years: ['2019', '2021', '2022', '2023', '2025'],
      label: 'años premiados en los Wedding Awards',
      href: site.bodasNetUrl,
    },
  ];

  return (
    <section className={styles.section} aria-label="Cifras de EME Fotografía Sevilla">
      <dl className={styles.list}>
        {figures.map((f, i) => (
          <div key={f.label} className={styles.item} style={{ ['--i' as string]: i }}>
            <dt className={styles.label}>{f.label}</dt>
            <dd className={styles.value}>
              {/* La ventana del numeral. El <a>, cuando lo hay, va DENTRO de
                  ella y no al revés: el enlace tiene que seguir siendo el
                  elemento que lleva el texto para que su nombre accesible sea
                  exactamente "5,0". */}
              <span className={styles.numeralMask}>
                <span className={styles.numeral}>
                  {f.href ? (
                    <a href={f.href} target="_blank" rel="noopener noreferrer" className={styles.valueLink}>
                      <Contador valor={f.valor} formato={f.formato} />
                    </a>
                  ) : (
                    <Contador valor={f.valor} formato={f.formato} />
                  )}
                </span>
              </span>
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
                  {Array.from({ length: f.stars }, (_, star) => (
                    <svg key={star} viewBox="0 0 24 24" aria-hidden="true" className={styles.star}>
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
  );
}
