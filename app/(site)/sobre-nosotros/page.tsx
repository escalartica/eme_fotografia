import { focusOf } from '@/lib/focal';
import Image from 'next/image';
import Link from 'next/link';
import { site } from '@/content/site';
import { buildMetadata } from '@/lib/seo';
import { ShowreelClip } from '@/components/sections/ShowreelClip';
import { Cifras } from '@/components/sections/Cifras';
import { CtaContacto } from '@/components/sections/CtaContacto';
import { ScrollReveal } from '@/components/motion/ScrollReveal';
import { ScrollParallax } from '@/components/motion/ScrollParallax';
import { ScrubWords } from '@/components/motion/ScrubWords';
import { TeamList, type TeamMember } from '@/components/sections/TeamList';
import styles from './page.module.css';

export const metadata = buildMetadata({
  // 40 + 17 de plantilla = 57 caracteres servidos; el anterior daba 65 y
  // perdía la marca por el corte de Google. 'y vídeo de boda' sale del
  // título porque ya está en la descripción y en el propio <h2> de equipo.
  title: 'El equipo: fotógrafos de boda en Sevilla',
  // 148 caracteres: entera en la SERP. La anterior medía 191 y
  // clampDescription se comía justo la última frase.
  description:
    'Cinco especialistas en foto y vídeo de boda dirigidos por eme (María Leal): quince años, del fotoperiodismo y los conciertos a las bodas de Sevilla.',
  path: '/sobre-nosotros',
});

// Three ways of looking that every EME wedding on this site shares. Copy is
// deliberately about method, not adjectives -- each principle is something
// a visitor can verify by opening any gallery on /trabajos.
const PRINCIPLES = [
  {
    title: 'Cazamos, no colocamos',
    text: 'De la sala de redacción se hereda un reflejo que no se enseña: la cámara lista antes de que pase. Los posados se resuelven en unos minutos; el resto del día lo pasamos a un lado, esperando lo que solo va a ocurrir una vez.',
  },
  {
    title: 'Un color que se reconoce',
    text: 'La foto y el vídeo salen del mismo etalonaje: negros suaves, altas luces cálidas, grano fino. Abrid cualquier reportaje de esta web tapando la firma; se sabe que es nuestro.',
  },
  {
    title: 'Del suelo al aire',
    text: 'Cámara en mano para lo íntimo, dron para el lugar y la escala: la hacienda abriéndose al campo, el paseo entre olivos, el banquete visto desde arriba. Dos alturas en el mismo día, y una sola pieza al final.',
  },
];

const STEPS = [
  {
    title: 'Primera conversación',
    text: 'Un café o una videollamada, sin compromiso. Nos contáis la fecha, el sitio y cómo os imagináis el día, y os enseñamos bodas enteras de principio a fin, no una selección de diez fotos buenas.',
  },
  {
    title: 'Planificación',
    text: 'Repartimos ángulos, horarios y luces con vosotros y con el resto de proveedores. Cuando llega el día, cada uno del equipo ya sabe dónde se coloca y a quién mira.',
  },
  {
    title: 'El día',
    text: 'Llegamos con los primeros nervios de la mañana y nos vamos con el último baile. Cinco personas moviéndose sin que se note, con la cámara lista antes de que ocurra.',
  },
  {
    title: 'Entrega',
    text: 'Galería privada para vosotros y para vuestros invitados, tráiler para compartir la misma semana, película completa para volver a verla dentro de diez años, y el álbum impreso con la selección que hacemos juntos.',
  },
];

// Real frames from projects already published on /trabajos.
const STRIP = [
  { src: '/images/trabajos/carmen-y-alberto/cover.webp', alt: 'Los novios bajo un arco de piedra con el velo extendido a la luz del atardecer', width: 1333, height: 2000 },
  { src: '/images/trabajos/angelica-y-jesus/12.webp', alt: 'Vista cenital de los novios sobre la línea de la carretera con el velo extendido', width: 1600, height: 987 },
  { src: '/images/trabajos/reyes-y-francisco/15.webp', alt: 'Primer baile entre bengalas frías', width: 1600, height: 1067 },
  { src: '/images/trabajos/carmen-y-enrique/cover.webp', alt: 'Silueta de los novios bajo el velo frente a los faros del coche clásico', width: 1333, height: 2000 },
];

// The people. Order matches the group photograph (left to right).
//
// ⚠️ TODO(cliente): los cuatro roles que NO son el de María Leal están
// ASIGNADOS POR NOSOTROS, no confirmados por el estudio. El brief pidió
// sustituir el genérico "Fotografía y vídeo" por un título propio para cada
// uno, y estos son plausibles y coherentes con lo que la web ya cuenta —
// pero quién dirige el vídeo, quién vuela el dron y quién hace segunda
// cámara es un dato que solo tiene el estudio. Confirmadlos o cambiadlos
// antes de publicar: un rol equivocado en la web es peor que uno genérico,
// porque el genérico no afirma nada y este sí.
const TEAM: TeamMember[] = [
  { name: 'eme · María Leal', role: 'Dirección creativa y fotografía', portrait: '/images/equipo/eme-retrato.webp', href: site.instagramUrl },
  { name: 'Rafa', role: 'Realización audiovisual', portrait: '/images/equipo/rafa-retrato.webp' },
  { name: 'Raúl', role: 'Operador de cámara y dron', portrait: '/images/equipo/raul-retrato.webp' },
  { name: 'Antonio', role: 'Fotografía de reportaje', portrait: '/images/equipo/antonio-retrato.webp' },
  { name: 'Manuel', role: 'Segunda cámara y edición', portrait: '/images/equipo/manuel-retrato.webp' },
];

export default function Page() {
  return (
    <article className={styles.page}>
      {/* Opener in the Lundani register: one statement in two halves. The
          first half sits on paper above a full-bleed photograph of the team
          at work; the second half is printed on the photograph itself. The
          h1 carries the brand for search (visually hidden) plus the whole
          statement, so the page still announces itself as EME. */}
      <header className={styles.hero}>
        {/* El titular sale del CV real de eme, no de una figura retórica:
            viene del fotoperiodismo y de fotografiar conciertos, o sea de
            oficios donde la toma no se repite nunca. Esa es también la
            promesa de una boda, y dicho así el argumento se entiende sin
            explicarlo. Sustituye a "No hacemos fotos de boda. / Guardamos
            recuerdos.", que además era la cuarta vez que el sitio usaba la
            construcción "No X. Y." */}
        <h1 className={styles.heroTitle}>
          <span className="sr-only">{site.brandName}. </span>
          <span className={styles.heroLine}>Un concierto no se repite.</span>
          <span className="sr-only"> Vuestra boda tampoco.</span>
        </h1>
        <p className={styles.heroLede}>
          Cinco especialistas en foto y vídeo cubriendo el mismo día a la vez, desde el suelo y desde el aire. Sin
          estudio, sin poses de catálogo y sin un solo momento esperando a que alguien lo repita.
        </p>
        <div className={styles.heroFigure}>
          <ScrollParallax strength={5}>
            <Image
              src="/images/equipo/eme-en-accion.webp"
              alt="eme fotografiando a una pareja de novios sobre un mirador de cristal, con el pueblo y la sierra al fondo"
              fill
              sizes="100vw"
              className={styles.heroImage}
              priority
            style={focusOf("/images/equipo/eme-en-accion.webp")}
          />
          </ScrollParallax>
          <div className={styles.heroScrim} aria-hidden="true" />
          <p className={styles.heroSecond} aria-hidden="true">
            Vuestra boda <em>tampoco.</em>
          </p>
        </div>
      </header>

      {/* 01 -- the statement, read along with the scroll. */}
      <section aria-labelledby="quienes-heading" className={styles.statementSection}>
        <span className={styles.chapterNumber} aria-hidden="true">01</span>
        <h2 id="quienes-heading" className="sr-only">
          Quiénes somos
        </h2>
        {/* La historia, que hasta ahora no se contaba: de dónde sale esta
            forma de trabajar. Todos los datos vienen del estudio (la cámara
            del abuelo, El Correo de Andalucía, los conciertos, Spagnolo, la
            titulación de 2010). Una corrección deliberada sobre el brief:
            dice "galardonados consecutivamente", pero las cinco insignias que
            esta misma web publica son 2019, 2021, 2022, 2023 y 2025 — faltan
            2020 y 2024. "Cinco ediciones" dice lo mismo y es comprobable en el
            perfil de Bodas.net que enlazamos aquí al lado; "consecutivamente"
            sería una afirmación falsa a un clic de distancia. */}
        <ScrubWords className={styles.scrub}>
          Empezó con la cámara analógica del abuelo de eme y una niña de ocho años en Sevilla. De ahí a los estudios de
          Arte, a la Titulación Superior en Imagen y a la redacción de El Correo de Andalucía, donde se aprende lo único
          que no se enseña: que el instante bueno dura medio segundo y no avisa. Después llegaron los conciertos
          —Beret, Marisol Bizcocho, Rafa Ruda—, las portadas de disco y los catálogos de Spagnolo. El directo enseña
          ritmo; la moda, a mirar. Quince años más tarde, esa escuela se aplica entera a las bodas: por eso contamos la
          vuestra con principio, tensión y final. Partimos de {site.addressLocality}, a las afueras de Sevilla, y nos
          movemos por toda Andalucía. Cinco ediciones de los Wedding Awards, la imagen de Saal Digital en ferias y más
          de {site.bodasNetCoupleCount} parejas dicen que funciona.
        </ScrubWords>
        <div className={styles.statementLinks}>
          <Link href="/trabajos" className={styles.arrow}>
            Ver los reportajes
            <span className="arrow" aria-hidden="true">↗</span>
          </Link>
          <a href={site.bodasNetUrl} target="_blank" rel="noopener noreferrer" className={styles.arrow}>
            Puntuación máxima en Bodas.net
            <span className="arrow" aria-hidden="true">↗</span>
          </a>
        </div>
      </section>

      {/* Two portraits, side by side, drifting at different rates. */}
      <ScrollReveal>
        <div className={styles.pair}>
          <figure className={styles.pairItem}>
            <div className={styles.pairFrame}>
            <ScrollParallax strength={8}>
              <Image
                src="/images/equipo/equipo.webp"
                alt="El equipo de EME con sus cámaras: Rafa, Raúl, eme, Antonio y Manuel"
                fill
                sizes="(max-width: 900px) 100vw, 48vw"
                className={styles.pairImage}
            style={focusOf("/images/equipo/equipo.webp")}
          />
            </ScrollParallax>
            </div>
            <figcaption className={styles.pairCaption}>El equipo. De izquierda a derecha: Rafa, Raúl, eme, Antonio y Manuel.</figcaption>
          </figure>
          <figure className={`${styles.pairItem} ${styles.pairItemOffset}`}>
            <div className={styles.pairFrame}>
            <ScrollParallax strength={5}>
              <Image
                src="/images/trabajos/carmen-y-alberto/cover.webp"
                alt="Los novios bajo un arco de piedra con el velo extendido a la luz del atardecer"
                fill
                sizes="(max-width: 900px) 100vw, 48vw"
                className={styles.pairImage}
            style={focusOf("/images/trabajos/carmen-y-alberto/cover.webp")}
          />
            </ScrollParallax>
            </div>
            <figcaption className={styles.pairCaption}>Carmen y Alberto, Sevilla.</figcaption>
          </figure>
        </div>
      </ScrollReveal>

      {/* 02 -- the people. */}
      <ScrollReveal>
        <section aria-labelledby="equipo-heading" className={`${styles.section} ${styles.team}`}>
          <div className={styles.teamCopy}>
            <span className={styles.chapterNumber} aria-hidden="true">02</span>
            <h2 id="equipo-heading" className={styles.heading}>Equipo</h2>
            <p>
              Al frente está eme, {site.founderName}, dirigiendo un equipo permanente de especialistas en foto y vídeo.
              No es un fotógrafo con refuerzos: son cinco profesionales que trabajan juntos todo el año, con los
              ángulos repartidos antes de que empiece el día.
            </p>
            <p>
              Mientras una cámara está en la cara de la novia, otra está en la de su padre. Mientras el dron abre el
              plano de la finca, otro objetivo cierra sobre las manos. Ser cinco sirve para una cosa concreta: que
              no exista el momento que nadie estaba cubriendo.
            </p>
            <p>Si queréis conocernos antes de decidir, escribidnos: la primera conversación es siempre sin compromiso.</p>
            <div className={styles.teamLinks}>
              <Link href="/contacto" className={styles.arrow}>
                Escribirnos
                <span className="arrow" aria-hidden="true">↗</span>
              </Link>
              <a href={site.instagramUrl} target="_blank" rel="noopener noreferrer" className={styles.arrow}>
                {site.instagramHandle}
                <span className="arrow" aria-hidden="true">↗</span>
              </a>
            </div>
          </div>
          <TeamList members={TEAM} />
        </section>
      </ScrollReveal>

      <ScrollReveal>
        <section aria-labelledby="mirada-heading" className={styles.section}>
          <header className={styles.sectionHeader}>
            <span className={styles.chapterNumber} aria-hidden="true">03</span>
            <h2 id="mirada-heading" className={styles.heading}>Nuestra mirada</h2>
          </header>
          <div className={styles.principles} role="list">
            {PRINCIPLES.map((p, i) => (
              <div key={p.title} role="listitem" className={styles.principle}>
                <span className={styles.itemNumber} aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                <h3 className={styles.principleTitle}>{p.title}</h3>
                <p className={styles.principleText}>{p.text}</p>
              </div>
            ))}
          </div>
          <div className={styles.strip} role="list" aria-label="Fotografías reales de nuestros reportajes">
            {STRIP.map((item) => (
              <figure key={item.src} role="listitem" className={styles.stripItem} style={{ aspectRatio: `${item.width} / ${item.height}` }}>
                <Image src={item.src} alt={item.alt} fill sizes="(max-width: 900px) 70vw, 28vw" className={styles.stripImage}
            style={focusOf(item.src)}
          />
              </figure>
            ))}
          </div>
        </section>
      </ScrollReveal>

      <ScrollReveal>
        <section aria-labelledby="proceso-heading" className={styles.section}>
          <header className={styles.sectionHeader}>
            <span className={styles.chapterNumber} aria-hidden="true">04</span>
            <h2 id="proceso-heading" className={styles.heading}>Cómo trabajamos</h2>
          </header>
          <ol className={styles.steps}>
            {STEPS.map((s, i) => (
              <li key={s.title} className={styles.step}>
                <span className={styles.stepNumber} aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <h3 className={styles.stepTitle}>{s.title}</h3>
                  <p className={styles.stepText}>{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
          {/* ⚠️ TODO(cliente): este bloque promete algo. Está escrito en
              deliberadamente vago —no nombra formato, fecha ni precio— para
              crear expectativa sin comprometer al estudio a una entrega
              concreta, que es lo que pedía el brief. Aun así, es una promesa
              pública: confirmad que efectivamente hay algo en camino antes de
              publicarlo, o quitadlo. Una novedad anunciada que no llega hace
              más daño que no haberla anunciado. */}
          <aside className={styles.upcoming}>
            <p className={styles.upcomingLabel}>Próximamente</p>
            <p className={styles.upcomingText}>
              Estamos preparando formatos nuevos: piezas pensadas para verse en el móvil el mismo fin de semana de la
              boda, y una forma distinta de volver al reportaje pasado el tiempo. Si os apetece ser de las primeras
              parejas en probarlo, decídnoslo cuando escribáis.
            </p>
          </aside>
        </section>
      </ScrollReveal>

      <ScrollReveal>
        <section aria-labelledby="movimiento-heading" className={styles.section}>
          <header className={styles.sectionHeader}>
            <span className={styles.chapterNumber} aria-hidden="true">05</span>
            <h2 id="movimiento-heading" className={styles.heading}>Nuestro trabajo, en movimiento</h2>
            <p className={styles.lede}>Un montaje de bodas reales que ya hemos contado.</p>
          </header>
          <ShowreelClip
            src="/videos/previews/showreel.mp4"
            poster="/videos/posters/showreel.webp"
            alt="Montaje de fotografías reales de varias bodas recientes"
          />
        </section>
      </ScrollReveal>

      <Cifras />
      <CtaContacto />
    </article>
  );
}
