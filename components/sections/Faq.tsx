'use client';
import { useMemo, useState } from 'react';
import { faqs } from '@/content/faq';
import { PlusIcon } from '@/components/ui/Icon';
import styles from './Faq.module.css';

/**
 * Las preguntas frecuentes, al pie de /contacto.
 *
 * SON DIECISÉIS, y ése es todo el problema de diseño. Lo bastante pocas para
 * que esconderlas sea absurdo y lo bastante muchas para que recorrerlas a ojo
 * buscando la tuya canse. Por eso hay un buscador: se escribe «precio» o
 * «antelación» y quedan las que hablan de eso. Es lo que pidió el estudio
 * cuando dijo «más funcional» -- no un efecto más, una forma de llegar antes.
 *
 * LO QUE NO HACE EL FILTRO ES DESMONTAR NADA. Las preguntas que no encajan se
 * marcan con el atributo `hidden`, no se quitan del árbol: las dieciséis
 * respuestas siguen en el HTML que se sirve --que es por lo que un buscador
 * las indexa y el Ctrl+F del navegador las encuentra-- y volver a vaciar la
 * caja las devuelve al instante, sin volver a montar nada.
 *
 * BUSCA SIN ACENTOS Y SIN MAYÚSCULAS, en la pregunta Y en la respuesta.
 * Quien escribe «antelacion» a toda prisa en el móvil tiene que encontrar
 * «¿Con cuánta antelación...?»; si la búsqueda mirase sólo el título, «álbum»
 * --que aparece en tres respuestas y en ningún título-- no daría nada.
 *
 * Y SIGUE SIENDO `<details>` NATIVO: el teclado lo abre con Enter, el lector
 * de pantalla lo anuncia como lo que es, y no hay acordeón excluyente --se
 * pueden tener abiertas el precio y la antelación a la vez, que es justo el
 * par que se consulta junto.
 */

/** Minúsculas y sin tildes, para que «antelacion» encuentre «antelación». */
function normaliza(texto: string) {
  return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

export function Faq() {
  const [consulta, setConsulta] = useState('');

  const visibles = useMemo(() => {
    const q = normaliza(consulta.trim());
    if (!q) return new Set(faqs.map((f) => f.id));
    return new Set(
      faqs.filter((f) => normaliza(`${f.question} ${f.answer}`).includes(q)).map((f) => f.id),
    );
  }, [consulta]);

  const n = visibles.size;

  return (
    // El id es el destino del enlace del lateral de /contacto: las tres
    // primeras preguntas (fecha libre, antelación, precio) son las que la
    // pareja trae en la cabeza antes de escribir, y el bloque vive debajo
    // del formulario.
    <section id="preguntas-frecuentes" className={styles.section} aria-labelledby="faq-heading">
      <div className={styles.encabezado}>
        <p className={styles.eyebrow}>Antes de escribir</p>
        <h2 id="faq-heading" className={styles.titulo}>
          Preguntas frecuentes
        </h2>

        <div className={styles.buscador}>
          {/* `type="search"` y no `text`: en un teléfono trae la tecla de
              buscar y la cruz para vaciar sin tener que dibujarlas.
              LAS TRES PALABRAS DEL EJEMPLO DEVUELVEN ALGO, comprobado contra
              content/faq.ts: «presupuesto» encuentra cuatro, «antelación» una
              y «álbum» dos. «Precio» --que era el primer ejemplo-- no aparece
              en ninguna: las respuestas dicen «cuesta» y «presupuesto», y un
              ejemplo que no encuentra nada enseña a desconfiar del buscador
              justo en el primer intento. */}
          <input
            type="search"
            className={styles.campo}
            value={consulta}
            onChange={(e) => setConsulta(e.target.value)}
            placeholder="Buscar: presupuesto, antelación, álbum…"
            aria-label="Buscar entre las preguntas frecuentes"
            aria-controls="faq-lista"
          />
          {/* El recuento se anuncia solo al filtrar. `polite` y no `assertive`:
              es información de apoyo, no puede cortar a quien está tecleando. */}
          <p className={styles.recuento} role="status" aria-live="polite">
            {consulta.trim() === ''
              ? `${faqs.length} preguntas`
              : n === 0
                ? 'Ninguna pregunta coincide'
                : `${n} ${n === 1 ? 'pregunta' : 'preguntas'}`}
          </p>
        </div>
      </div>

      <div id="faq-lista" className={styles.lista}>
        {faqs.map((f) => (
          // `hidden`, no desmontar: ver el comentario del componente.
          <details key={f.id} className={styles.item} hidden={!visibles.has(f.id)}>
            <summary className={styles.resumen}>
              {/* LA PREGUNTA ES UN ENCABEZADO DE VERDAD. Se ven como
                  encabezados --serif, cuerpo de titular, tinta plena-- así que
                  tienen que serlo: es WCAG 1.3.1, información transmitida sólo
                  por el aspecto. Y en una lista de dieciséis, el rotor de
                  encabezados es el atajo que evita tabular por trece controles
                  para llegar a la catorce. */}
              <h3 className={styles.pregunta}>{f.question}</h3>
              <span className={styles.marca} aria-hidden="true">
                <PlusIcon size={16} />
              </span>
            </summary>
            <div className={styles.cuerpo}>
              <p>{f.answer}</p>
            </div>
          </details>
        ))}
      </div>

      {n === 0 && (
        <p className={styles.vacio}>
          Eso no lo hemos respondido todavía. Escribidnos en el formulario de arriba y os
          contestamos personalmente, normalmente el mismo día.
        </p>
      )}
    </section>
  );
}
