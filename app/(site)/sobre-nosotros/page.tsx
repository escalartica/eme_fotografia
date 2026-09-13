import { focusOf } from '@/lib/focal';
import { turno } from '@/lib/turno';
import Image from 'next/image';
import Link from 'next/link';
import { site } from '@/content/site';
import { foto } from '@/content/seleccion';
import { buildMetadata, ogImage } from '@/lib/seo';
import { ShowreelClip } from '@/components/sections/ShowreelClip';
import { Cifras } from '@/components/sections/Cifras';
import { CtaContacto } from '@/components/sections/CtaContacto';
import { ScrollReveal } from '@/components/motion/ScrollReveal';
import { ScrubWords } from '@/components/motion/ScrubWords';
import { TeamList, type TeamMember } from '@/components/sections/TeamList';
import styles from './page.module.css';
import { RevealWords, pasoPara } from '@/components/motion/RevealWords';
import { QuienSoyBloques } from './QuienSoyBloques';
import { ArrowGlyph } from '@/components/ui/ArrowGlyph';

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
  // LA TARJETA DE ENLACE ES UNA FOTOGRAFÍA, no el logotipo.
  // Todas las páginas menos las fichas de boda compartían la misma tarjeta
  // genérica --la marca sobre fondo oscuro-- así que un estudio de fotografía
  // que se manda por WhatsApp aparecía como un wordmark. La imagen ES el
  // producto y es lo único que se ve en una previsualización antes de decidir
  // si se pincha. `ogImage()` cambia la extensión al derivado JPEG de 1200x630
  // que vive al lado de cada foto (WhatsApp no pinta WebP; ver lib/seo.ts).
  image: ogImage('/images/equipo/equipo.webp'),
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
    // «Cinco personas» aquí era una promesa de plantilla, y el estudio
    // aclaró que no van los cinco a todas las bodas: quién va depende de lo
    // contratado y del tamaño del día. La frase se queda con lo que sí es
    // cierto siempre -- de dónde sale quien va -- y dice en voz alta de qué
    // depende el número, que es además lo que la pareja necesita saber para
    // leer su presupuesto.
    title: 'El día',
    text: 'Llegamos con los primeros nervios de la mañana y nos vamos con el último baile. No vamos siempre los cinco: cuántos somos ese día depende de lo que hayáis contratado y de cómo sea la boda, y lo acordamos antes de firmar. Vaya quien vaya, sale de este equipo y ya sabe dónde se coloca.',
  },
  {
    // El tráiler y el álbum dependen del pack, y los plazos de antes (una
    // semana, "dentro de diez años") no eran los reales. Lo que se promete
    // aquí es lo que va en todas las entregas; lo demás se nombra como lo
    // que es.
    title: 'Entrega',
    text: 'Un adelanto de fotos en los días siguientes y, después, la galería privada completa para vosotros y vuestros invitados: entre tres y seis meses. La película, entre seis meses y un año, montada sobre hilo musical. El tráiler y el álbum impreso van según el pack que elijáis.',
  },
];

// Real frames from projects already published on /trabajos.
// Cuatro fotos eran pocas para una sección que se titula «Nuestra mirada»:
// el mural decía lo mismo que el resto de la página en vez de demostrarlo.
// Las tres nuevas vienen de content/seleccion.ts -- bodas sin ficha propia en
// /trabajos -- y están elegidas por lo que enseñan de la forma de mirar, no
// por lo bonitas: el perro debajo de las sillas durante la ceremonia, el niño
// tirado en el suelo mientras los novios salen detrás, y el velo cruzando el
// encuadre con el viento. Ninguna de las tres se puede encargar, que es
// justo lo que dice el principio 01 de aquí arriba.
const MURAL = [
  { src: '/images/trabajos/carmen-y-alberto/cover.webp', alt: 'Los novios bajo un arco de piedra con el velo extendido a la luz del atardecer', width: 1707, height: 2560 },
  foto('perro-bajo-las-sillas'),
  { src: '/images/trabajos/angelica-y-jesus/12.webp', alt: 'Vista cenital de los novios sobre la línea de la carretera con el velo extendido', width: 2560, height: 1579 },
  foto('nino-en-el-suelo'),
  { src: '/images/trabajos/reyes-y-francisco/15.webp', alt: 'Primer baile entre bengalas frías', width: 2560, height: 1707 },
  foto('velo-al-viento-bajo-el-arbol'),
  { src: '/images/trabajos/carmen-y-enrique/cover.webp', alt: 'Silueta de los novios bajo el velo frente a los faros del coche clásico', width: 1706, height: 2560 },
];

// The people. Order matches the group photograph (left to right).
//
// LOS CARGOS LOS HA DADO EL ESTUDIO, ya no son suposición nuestra. Estuvieron
// un tiempo marcados con un aviso porque los habíamos asignado por
// verosimilitud, que en una web es afirmar algo que no sabes; ahora vienen
// del cliente y el aviso sobra. Que Rafa y Manuel compartan cargo no es un
// error de copia: es lo que hay, dos personas haciendo lo mismo.
const TEAM: TeamMember[] = [
  { name: 'eme · María Leal', role: 'Dirección creativa y fotografía', portrait: '/images/equipo/eme-retrato.webp', href: site.instagramUrl },
  { name: 'Rafa', role: 'Realización audiovisual y dron', portrait: '/images/equipo/rafa-retrato.webp' },
  { name: 'Raúl', role: 'Videógrafo', portrait: '/images/equipo/raul-retrato.webp' },
  { name: 'Antonio', role: 'Fotógrafo', portrait: '/images/equipo/antonio-retrato.webp' },
  { name: 'Manuel', role: 'Realización audiovisual y dron', portrait: '/images/equipo/manuel-retrato.webp' },
];

export default function Page() {
  return (
    <article className={styles.page}>
      {/* LA APERTURA. Un enunciado en dos mitades y la fotografía del equipo
          trabajando, al lado.

          POR QUÉ LA FOTO YA NO VA A SANGRE, que es la corrección que pidió el
          estudio («dale más calidad a la imagen en la que sale eme entre dos
          novios»). El fichero mide 1600x1200. En una banda a sangre el
          navegador le pide el ancho entero de la ventana: en un portátil de
          1440 px a 2x son 2880, o sea que se estaba ampliando un 80%. Y
          además la banda era de 1,76:1 con una fotografía de 4:3 dentro, así
          que `object-fit: cover` tiraba una cuarta parte del alto -- se
          ampliaba Y se recortaba a la vez.
          Aquí la fotografía ocupa una columna de 38rem como mucho. A 2x eso
          son unos 1.216 px: POR DEBAJO de los 1.600 que tiene el fichero, o
          sea que no se amplía nada y por primera vez se ve nítida. Y como el
          marco toma su propio 4:3, tampoco se recorta: vuelven a estar los
          dos novios enteros y el pueblo del fondo.
          Esto NO sustituye a tener el original: con un fichero grande esta
          foto podría volver a ir a sangre. Mientras tanto, nítida y mediana
          es mejor que enorme y blanda en la web de un fotógrafo.

          LA SEGUNDA MITAD DE LA FRASE BAJA A PAPEL. Estaba impresa sobre la
          fotografía en `aria-hidden`, con el texto de verdad escondido en un
          `sr-only`: dos copias de la misma frase para que el lector de
          pantalla oyera una cosa y la pantalla enseñara otra. En una columna
          de 38rem ese titular ya no cabe encima, y no hace falta -- puesto
          debajo del primero, en cursiva, la frase se lee entera y una sola
          vez, y el <h1> deja de necesitar copias ocultas. */}
      <header className={styles.hero}>
        <div className={styles.heroCopy}>
          {/* El titular sale del CV real de eme, no de una figura retórica:
              viene del fotoperiodismo y de fotografiar conciertos, o sea de
              oficios donde la toma no se repite nunca. Esa es también la
              promesa de una boda, y dicho así el argumento se entiende sin
              explicarlo. */}
          <h1 className={styles.heroTitle}>
            <span className="sr-only">{site.brandName}. </span>
            {/* Las dos mitades son UN SOLO titular de ocho palabras, y las dos
                cosas que lo consiguen van juntas:
                  - `offset` continúa la cuenta en la segunda línea en vez de
                    reiniciarla («Un concierto no se repite.» son cinco), que
                    es lo que haría que las dos frases se revelaran a la vez
                    como si fueran dos titulares distintos.
                  - y `paso` se calcula sobre EL TOTAL, porque si no cada mitad
                    calcularía el suyo por su cuenta --5 la primera, 4,3 la
                    segunda-- y la cascada cambiaría de ritmo a mitad de
                    frase. */}
            <span className={styles.heroLine}>
              <RevealWords segments={[{ text: 'Un concierto no se repite.' }]} paso={pasoPara(8)} />
            </span>{' '}
            <span className={styles.heroLineEm}>
              <RevealWords
                segments={[{ text: 'Vuestra boda tampoco.' }]}
                offset={5}
                paso={pasoPara(8)}
              />
            </span>
          </h1>
          <p className={styles.heroLede}>
            Cinco especialistas en foto y vídeo cubriendo el mismo día a la vez, desde el suelo y desde el aire. Sin
            estudio, sin poses de catálogo y sin un solo momento esperando a que alguien lo repita.
          </p>
        </div>
        <figure className={styles.heroFigure}>
          {/* SIN ScrollParallax, y a propósito. Ese componente monta una capa
              de `inset: -strength% 0`, o sea un 10% más alta que su marco,
              para tener margen por donde desplazarse -- y `object-fit: cover`
              paga ese margen recortando por los lados. En esta fotografía
              concreta eso se lleva un 9% del ancho, que es justo por donde
              están los dos novios. Aquí el movimiento lo pone el posado de
              `heroSettle` (page.module.css), que es un 4% y vuelve a 1: la
              imagen acaba exacta, sin un píxel de recorte. */}
          <div className={styles.heroFrame}>
            <Image
              src="/images/equipo/eme-en-accion.webp"
              alt="eme entre los dos novios, los tres con sus cámaras, sobre el mirador de cristal de un pueblo blanco"
              fill
              /* 38rem es el tope de la columna (ver .hero en la hoja); por
                 encima de 900 px no crece más, así que pedir 100vw ahí sería
                 pedir el doble de lo que se pinta. */
              sizes="(max-width: 900px) 100vw, 608px"
              className={styles.heroImage}
              priority
            />
          </div>
          <figcaption className={styles.heroCaption}>
            eme, entre los novios, en mitad de un reportaje.
          </figcaption>
        </figure>
      </header>

      {/* 01 -- QUIÉN SOY.
          Aquí había UN SOLO PÁRRAFO de ciento treinta palabras en serif
          grande, con el revelado palabra a palabra encima. El estudio lo
          señaló como «largo y tedioso de leer» y tenía razón dos veces:

           1. Ciento treinta palabras en cuerpo de titular son ocho líneas
              largas sin un punto de descanso, y lo que se cuenta ahí -- la
              cámara del abuelo, la redacción, los conciertos, la moda, las
              bodas, dónde trabajamos, los premios -- son SEIS asuntos
              distintos metidos en una sola respiración.
           2. Y el revelado palabra a palabra, que en una frase corta es un
              gesto, en un párrafo largo es un freno: obliga a bajar despacio
              justo donde el lector querría ir rápido. Se queda sólo en la
              frase de apertura, que es de siete palabras y donde sí funciona.

          Ahora son tres bloques con su propio rótulo, en el orden en que los
          escribió el estudio: de dónde viene la forma de mirar, qué se hace
          hoy con ella, y dónde. Y en primera persona, como los pasó el
          cliente -- es el capítulo de eme, no el del estudio; el «nosotros»
          empieza en el 02.

          LOS CRÉDITOS NO SE PIERDEN, CAMBIAN DE FORMA. El Correo de
          Andalucía, los tres artistas y Spagnolo estaban dentro del párrafo
          entre guiones, que es donde más cuesta leerlos y donde menos pesan.
          Puestos en una tira de nombres debajo del bloque que los explica se
          leen de un vistazo, como la ficha de créditos de un cartel: es la
          parte comprobable de todo este capítulo y ahora se ve sin leer una
          línea. */}
      <section aria-labelledby="quienes-heading" className={styles.statementSection}>
        <div className={styles.capituloCabecera}>
          <span className={styles.chapterNumber} aria-hidden="true">01</span>
          {/* ESTE TITULAR NO LLEVA REVELADO POR PALABRAS, y no es un olvido.
              Vive dentro de `.capituloCabecera`, que de 900 px para arriba es
              `position: sticky`. El revelado de RevealWords se mide con
              `animation-timeline: view()`, es decir contra la pantalla -- y un
              elemento anclado NO se mueve respecto a la pantalla, así que su
              progreso se congela en cuanto se pega y las palabras se quedarían
              a medio subir durante todo el capítulo. Es el mismo hallazgo que
              documenta SelectedReel.module.css sobre por qué la línea de
              tiempo se declara en el escenario y no en lo anclado. */}
          <h2 id="quienes-heading" className={styles.heading}>Quién soy</h2>
          <div className={styles.statementLinks}>
            <Link href="/trabajos" className={styles.arrow}>
              Ver los reportajes
              <ArrowGlyph />
            </Link>
            <a href={site.bodasNetUrl} target="_blank" rel="noopener noreferrer" className={styles.arrow}>
              Puntuación máxima en Bodas.net
              <ArrowGlyph />
            </a>
          </div>
        </div>

        <div className={styles.capituloCuerpo}>
          {/* La única frase que conserva el revelado palabra a palabra de
              toda la página. Siete palabras: el gesto se lee entero antes de
              que llegue a cansar. */}
          <ScrubWords className={styles.scrub}>
            Todo empezó con la cámara analógica de mi abuelo.
          </ScrubWords>

          {/* LOS TRES TRAMOS. Dos formas, una por pantalla, y el porqué de
              las dos está escrito entero en QuienSoyBloques.tsx:

              - En un ordenador, tres bloques abiertos que se apilan con el
                scroll. Fueron tarjetas desplegables y el estudio lo corrigió
                con razón: «no quiero tener que darle al botón + para verla».
              - En un teléfono, un acordeón con el primero ya abierto, que es
                lo que el estudio pidió después de navegar desde su móvil:
                «aplica un efecto acordeón para no tener que hacer tanto
                scroll». Ahí abajo no hay anclado --es de 900 px para
                arriba--, así que los tres tramos eran tres párrafos largos
                seguidos y casi tres pantallas de recorrido. */}
          <QuienSoyBloques />
        </div>
      </section>

      {/* LA CITA. Va aquí y no en otro sitio porque es el remate del capítulo
          que acaba de contar de dónde sale esta forma de mirar: el
          fotoperiodismo, el instante que dura medio segundo. Cartier-Bresson
          es quien puso nombre a eso --el «instante decisivo»-- y su frase dice
          en una línea lo que el capítulo entero acaba de explicar en tres
          bloques. No es un adorno motivacional: es la escuela de la que viene
          eme, citada con su autor.

          «LA CABEZA», no «la mente». El original francés dice «mettre sur la
          même ligne de mire LA TÊTE, l'œil et le cœur», y en una cita
          atribuida a alguien la traducción libre deja de ser una licencia de
          redacción para convertirse en una afirmación sobre lo que esa
          persona dijo.

          Y EL AUTOR VA EN TEXTO PLANO, no en <cite>. La especificación de HTML
          es explícita: el nombre de una persona no es el título de una obra y
          `<cite>` no debe usarse para nombres. El síntoma de que estaba mal
          era tener que anular en el CSS lo único que `<cite>` aporta, que es
          la cursiva. El <figcaption> fuera del <blockquote> sí es lo que pide
          la norma, y eso se queda.

          El revelado palabra a palabra es el de la casa, sin `em`: ese tramo
          emite un `<em>` de verdad, o sea énfasis semántico, y un lector de
          pantalla cambiaría la entonación en media frase que el autor no
          enfatizó. */}
      <ScrollReveal>
        <figure className={styles.cita}>
          <blockquote className={styles.citaTexto}>
            <RevealWords
              segments={[
                { text: 'Fotografiar es poner la cabeza, el ojo y el corazón sobre la misma línea de mira.' },
              ]}
            />
          </blockquote>
          <figcaption className={styles.citaAutor}>Henri Cartier-Bresson</figcaption>
        </figure>
      </ScrollReveal>

      {/* EL RETRATO DEL EQUIPO, SOLO.
          Aquí había dos fotografías en paralelo: el equipo a la izquierda y
          una boda a la derecha. El estudio lo señaló y tiene razón: en mitad
          de la presentación de las personas, una pareja de novios no viene a
          cuento -- el lector acaba de leer quién es eme y está a punto de leer
          quiénes son los cinco, y en medio se le enseña a unos clientes. Las
          bodas tienen su sitio dos capítulos más abajo, en «Nuestra mirada»,
          y toda una sección del sitio para ellas.

          Y DE PASO SE VE NÍTIDA, que era el otro problema. El fichero mide
          896x1195. En la mitad de la página se pintaba a unos 690 px, o sea
          1.380 reales en densidad doble: un 54% de ampliación. En una columna
          de 32rem son 1.024, un 14% -- imperceptible. También se le ha quitado
          el desplazamiento de parallax: esa capa se monta un 8% más alta que
          su marco y `object-fit: cover` paga ese margen recortando por los
          lados, justo por donde están los dos de los extremos. */}
      <ScrollReveal>
        <figure className={styles.retratoEquipo}>
          <div className={styles.retratoEquipoMarco}>
            <Image
              src="/images/equipo/equipo.webp"
              alt="El equipo de EME con sus cámaras: Rafa, Raúl, eme, Antonio y Manuel"
              fill
              sizes="(max-width: 560px) 92vw, 512px"
              className={styles.retratoEquipoImagen}
            />
          </div>
          <figcaption className={styles.retratoEquipoPie}>
            El equipo. De izquierda a derecha: Rafa, Raúl, eme, Antonio y Manuel.
          </figcaption>
        </figure>
      </ScrollReveal>

      {/* 02 -- the people. */}
      <ScrollReveal>
        <section aria-labelledby="equipo-heading" className={`${styles.section} ${styles.team}`}>
          <div className={styles.teamCopy}>
            <span className={styles.chapterNumber} aria-hidden="true">02</span>
            {/* EL TITULAR DICE ALGO, no nombra el apartado. «Equipo» era una
                etiqueta: describe dónde está el lector, no por qué debería
                importarle. La frase que de verdad diferencia a este estudio
                estaba enterrada en la segunda línea del párrafo, que es donde
                menos gente llega. Ahora es el titular, y el párrafo empieza
                directamente por el dato. La palabra «Equipo» sigue en el
                antetítulo, para quien viene buscándola. */}
            <span className={styles.teamKicker}>Equipo</span>
            {/* EL TITULAR DA EL MOTIVO, NO EL CENSO. «Cinco personas que
                trabajan juntas todo el año» es un dato de plantilla: cierto,
                comprobable y del que la pareja no sabe qué hacer. Lo que de
                verdad compra con eso estaba enterrado en la mitad del segundo
                párrafo --«que no exista el momento que nadie estaba
                cubriendo»--, o sea en el renglón al que menos gente llega.
                Ahora abre el capítulo, y el número sigue en el primer
                párrafo, donde es un apoyo y no una pregunta.
                Y en una sola negación. La primera versión de este titular
                --«No hay un solo momento que nadie esté mirando»-- decía lo
                mismo, pero obligaba a desmontar tres negaciones seguidas
                para llegar a una promesa que es positiva. En mitad de un
                párrafo se sostiene; de titular, no. */}
            <h2 id="equipo-heading" className={styles.heading}>
              <RevealWords segments={[{ text: 'Ningún momento se queda sin cámara.' }]} />
            </h2>
            {/* Los tres párrafos llegaban a la vez debajo de un titular que
                se revela palabra a palabra. `--turno` los pone en fila (ver
                lib/turno.ts y `.teamCopy p` en la hoja). */}
            <p style={turno(0)}>
              Somos cinco y trabajamos juntos todo el año. Al frente está eme, {site.founderName}, dirigiendo un equipo
              permanente de especialistas en foto y vídeo, con los ángulos repartidos antes de que empiece el día.
            </p>
            <p style={turno(1)}>
              Mientras una cámara está en la cara de la novia, otra está en la de su padre. Mientras el dron abre el
              plano de la finca, otro objetivo cierra sobre las manos. Para eso sirve ser un equipo y no un fotógrafo
              con un ayudante. Cuántos vamos a vuestra boda lo decide el día -- las
              horas, el número de invitados, si lleváis vídeo -- y lo acordamos con vosotros antes de firmar.
            </p>
            <p style={turno(2)}>Si queréis conocernos antes de decidir, escribidnos: la primera conversación es siempre sin compromiso.</p>
            <div className={styles.teamLinks}>
              <Link href="/contacto" className={styles.arrow}>
                Escribirnos
                <ArrowGlyph />
              </Link>
              <a href={site.instagramUrl} target="_blank" rel="noopener noreferrer" className={styles.arrow}>
                {site.instagramHandle}
                <ArrowGlyph />
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
            <h2 id="mirada-heading" className={styles.heading}>
              <RevealWords segments={[{ text: 'Nuestra mirada' }]} />
            </h2>
          </header>
          <div className={styles.principles} role="list">
            {PRINCIPLES.map((p, i) => (
              <div key={p.title} role="listitem" className={styles.principle} style={turno(i)}>
                <span className={styles.itemNumber} aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                <h3 className={styles.principleTitle}>{p.title}</h3>
                <p className={styles.principleText}>{p.text}</p>
              </div>
            ))}
          </div>
{/* UN MURAL, NO UNA TIRA QUE HAY QUE ARRASTRAR.
              Esto era un carril horizontal con la barra de scroll escondida:
              en un escritorio se veían dos fotografías y media y las otras
              cuatro sólo existían para quien adivinara que aquello se
              arrastraba -- y necesitaba además un `tabIndex` para que el
              teclado pudiera recorrerlo. En la sección que se titula «Nuestra
              mirada», cuatro de cada siete pruebas invisibles.
              Ahora se ven las siete de una vez, cada una con la forma de su
              fichero, y entran escalonadas con el scroll. Mismo mural que las
              páginas de servicio, o sea que las dos secciones siguen siendo
              un solo sistema. */}
          <div className={styles.mural}>
            {MURAL.map((item, i) => (
              <figure
                /* Por índice y no por `src`: content/seleccion.ts devuelve
                   siempre la misma referencia, así que un mural que repitiera
                   una fotografía tendría dos claves iguales. */
                key={`${item.src}-${i}`}
                className={styles.muralItem}
                style={{ ...turno(i), aspectRatio: `${item.width} / ${item.height}` }}
              >
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  sizes="(max-width: 700px) 92vw, (max-width: 1100px) 46vw, 30vw"
                  className={styles.muralImagen}
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
            <h2 id="proceso-heading" className={styles.heading}>
              <RevealWords segments={[{ text: 'Cómo trabajamos' }]} />
            </h2>
          </header>
          <ol className={styles.steps}>
            {STEPS.map((s, i) => (
              <li key={s.title} className={styles.step} style={turno(i)}>
                <span className={styles.stepNumber} aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <h3 className={styles.stepTitle}>{s.title}</h3>
                  <p className={styles.stepText}>{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
          {/* CONFIRMADO POR EL ESTUDIO el 12/09/2026: los formatos existen y
              están en preparación, así que el bloque se publica.
              Está escrito a propósito sin nombrar formato, fecha ni precio,
              para crear expectativa sin comprometer una entrega concreta. Lo
              que NO puede hacer es sobrevivir a la novedad: el día que los
              formatos salgan, esto deja de ser un adelanto y pasa a ser una
              promesa vieja sin cumplir a la vista de quien está decidiendo.
              Entonces se sustituye por lo que ya se ofrece, o se quita. */}
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
        <section aria-labelledby="montaje-heading" className={styles.section}>
          <header className={styles.sectionHeader}>
            <span className={styles.chapterNumber} aria-hidden="true">05</span>
            {/* TERCER RÓTULO PARA ESTE CAPÍTULO, y cada uno arreglaba lo que
                rompía el anterior.
                «Nuestro trabajo, en movimiento» prometía el catálogo entero
                del estudio y lo que hay debajo son bodas. «Bodas reales, en
                movimiento» lo arregló y estrenó dos problemas: repetía
                palabra por palabra el titular de la portada --«Bodas reales,
                historias irrepetibles»-- y seguía diciendo «en movimiento»
                de un montaje de fotos FIJAS, o sea prometiendo metraje de
                vídeo donde no lo hay.
                Éste no promete nada: es una instrucción, que es el tono con
                el que esta web ya se dirige a la pareja, y describe
                literalmente lo que hace un montaje de fotografías. La
                entradilla remata la broma y da el dato. */}
            <h2 id="montaje-heading" className={styles.heading}>
              <RevealWords segments={[{ text: 'Muchas bodas, muy deprisa.' }]} />
            </h2>
            {/* CUARTO RÓTULO, Y EL MOTIVO DEL CAMBIO ES OTRO QUE EL DE LOS
                TRES ANTERIORES. «Pasad las fotos muy deprisa» era una
                instrucción sin objeto: el lector no sabe qué fotos ni dónde,
                y la entradilla tenía que explicarle el chiste --que es
                justamente lo que mata un chiste--. Éste describe lo que hay
                debajo en cuatro palabras, y la entradilla se queda con lo
                único que hacía falta advertir (que no es vídeo) y con el
                dato. El «muy deprisa» del estudio no se pierde: cambia de
                renglón. */}
            <p className={styles.lede}>
              No es vídeo: son fotografías fijas, una detrás de otra, de bodas distintas.
              Veinticuatro segundos.
            </p>
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
