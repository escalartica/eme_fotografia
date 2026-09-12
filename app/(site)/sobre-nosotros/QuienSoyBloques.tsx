'use client';
import { Fragment, useState } from 'react';
import { useMediaQuery } from '@/lib/hooks/useMediaQuery';
import { RevealWords } from '@/components/motion/RevealWords';
import { PlusIcon } from '@/components/ui/Icon';
import { site } from '@/content/site';
import styles from './page.module.css';

/**
 * LOS TRES TRAMOS DE «QUIÉN SOY», CON DOS FORMAS.
 * ---------------------------------------------------------------------
 * En un ORDENADOR son lo que ya eran: tres bloques abiertos que se van
 * quedando pegados bajo la cabecera mientras se baja, y el siguiente sube y
 * tapa al anterior. Nada que pulsar, todo a la vista. Eso lo pidió el estudio
 * con todas las letras cuando aquí hubo tarjetas desplegables: «no quiero
 * tener que darle al botón + para verla».
 *
 * En un TELÉFONO son un acordeón, y lo pidió el mismo estudio después de
 * navegar la web desde su móvil: «mejora la usabilidad y aplica un efecto
 * acordeón para no tener que hacer tanto scroll». Las dos peticiones no se
 * contradicen, porque el anclado del que vive la versión de escritorio no
 * existe por debajo de 900 px (ver page.module.css): ahí abajo los tres
 * tramos son tres párrafos largos seguidos, y recorrerlos enteros para llegar
 * a la cita cuesta casi tres pantallas.
 *
 * Y EL PRIMERO VIENE ABIERTO, que es lo que separa este acordeón del que el
 * estudio rechazó: nadie tiene que pulsar nada para empezar a leer. El «+» no
 * es el peaje para ver el capítulo, es el atajo para saltárselo.
 *
 * Es excluyente --abrir uno cierra el anterior-- porque ése es justo el punto:
 * si se pudieran tener los tres abiertos a la vez, en el peor caso se volvería
 * a la pantalla y media de scroll que se quería evitar.
 *
 * `<details>`/`<summary>` nativos, el mismo aparato que las dieciséis
 * preguntas frecuentes (components/sections/Faq.tsx): el teclado los abre con
 * Intro, el lector de pantalla los anuncia como lo que son y el estado abierto
 * no hay que inventarlo con `aria-expanded`.
 */

const BLOQUES = [
  {
    id: 'origen',
    titulo: 'El origen y la escuela',
    texto:
      'De los estudios de Arte pasé al fotoperiodismo en El Correo de Andalucía, donde se aprende lo único que no se enseña: que el instante bueno dura medio segundo y no avisa. Después, la fotografía de conciertos me enseñó el ritmo, y las editoriales de moda me enseñaron a mirar.',
    // Nombres reales, en una sola tira. Es la parte de este capítulo que
    // cualquiera puede comprobar.
    creditos: [
      'El Correo de Andalucía',
      'Beret',
      'Marisol Bizcocho',
      'Rafa Ruda',
      'Balbino Bernal',
      'Spagnolo',
    ],
  },
  {
    id: 'quince',
    titulo: 'Quince años después',
    texto:
      'Aplico esa escuela entera en cada boda. Por eso no hacemos posados tradicionales: contamos vuestra historia con principio, tensión y final, como un documental.',
  },
  {
    id: 'donde',
    titulo: '¿Dónde estamos?',
    // Aquí ponía el pueblo, sacado de site.addressLocality. Esa localidad es
    // el domicilio fiscal y su sitio son las páginas legales, donde la LSSI
    // obliga a publicarla. En el relato no aporta: a una pareja que busca
    // fotógrafo le dice menos que «Sevilla», y de paso mete un municipio que
    // no es donde se trabaja.
    texto: `Partimos de Sevilla y recorremos toda Andalucía. Más de ${site.coupleCount} parejas, cinco Wedding Awards y ser la imagen de Saal Digital en ferias confirman que este enfoque funciona.`,
  },
] as const;

function Creditos({ nombres }: { nombres: readonly string[] }) {
  // Versalitas y separadores puestos desde el marcado (un `·` por hueco), no
  // con `::before`, para que al copiar el texto salgan los nombres separados
  // y no pegados.
  return (
    <p className={styles.creditos}>
      {nombres.map((nombre, i) => (
        <Fragment key={nombre}>
          {/* Los espacios van FUERA del `·`: el punto está oculto al lector
              de pantalla, y con los espacios dentro los nombres se leían
              pegados unos a otros. Y el separador es el único `<span>` de
              la tira porque de eso vive `.creditos span` en la hoja. */}
          {i > 0 ? (
            <>
              {' '}
              <span aria-hidden="true">·</span>{' '}
            </>
          ) : null}
          {nombre}
        </Fragment>
      ))}
    </p>
  );
}

export function QuienSoyBloques() {
  // `false` en el servidor (no hay ventana a la que preguntar), que es la
  // forma de escritorio: la que lo lleva TODO en el HTML servido. Así el
  // capítulo entero se indexa y se puede buscar con Ctrl+F, y lo que hace la
  // hidratación en un teléfono es recoger, no revelar.
  const esMovil = useMediaQuery('(max-width: 899px)');
  const [abierto, setAbierto] = useState<string>(BLOQUES[0].id);

  if (!esMovil) {
    return (
      <ol className={styles.bloques}>
        {BLOQUES.map((b) => (
          <li key={b.id} className={styles.bloque}>
            <h3 className={styles.bloqueTitulo}>
              <RevealWords segments={[{ text: b.titulo }]} />
            </h3>
            <p className={styles.bloqueTexto}>{b.texto}</p>
            {'creditos' in b ? <Creditos nombres={b.creditos} /> : null}
          </li>
        ))}
      </ol>
    );
  }

  return (
    <ol className={styles.bloques}>
      {BLOQUES.map((b) => (
        <li key={b.id} className={styles.bloque}>
          <details
            className={styles.bloqueDetalle}
            open={abierto === b.id}
            // `onToggle` y no `onClick`: el elemento se abre también con el
            // teclado y desde la búsqueda del navegador, y el clic no se
            // entera de ninguna de las dos.
            onToggle={(e) => {
              if (e.currentTarget.open) setAbierto(b.id);
              else if (abierto === b.id) setAbierto('');
            }}
          >
            <summary className={styles.bloqueResumen}>
              {/* El título sigue siendo un encabezado de verdad dentro del
                  resumen, como en las preguntas frecuentes: se ve como un
                  encabezado, así que tiene que serlo (WCAG 1.3.1), y el rotor
                  de encabezados del lector de pantalla sigue funcionando.
                  SIN RevealWords aquí: ese gesto revela el título palabra a
                  palabra según entra en pantalla, y dentro de un panel que se
                  abre y se cierra bajo el dedo el título aparecería en blanco
                  hasta que el scroll lo cruzara. */}
              <h3 className={styles.bloqueTitulo}>{b.titulo}</h3>
              <span className={styles.bloqueMarca} aria-hidden="true">
                <PlusIcon size={16} />
              </span>
            </summary>
            <div className={styles.bloqueCuerpo}>
              <p className={styles.bloqueTexto}>{b.texto}</p>
              {'creditos' in b ? <Creditos nombres={b.creditos} /> : null}
            </div>
          </details>
        </li>
      ))}
    </ol>
  );
}
