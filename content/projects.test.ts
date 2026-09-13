import { describe, it, expect } from 'vitest';
import { projects } from './projects';
import { services } from './services';

describe('projects content', () => {
  /**
   * CADA PORTADA TIENE SU DERIVADO JPEG PARA LA TARJETA DE COMPARTIR.
   *
   * `ogImage()` (lib/seo.ts) construye la ruta cambiando `.webp` por
   * `-og.jpg` a ciegas, sin comprobar nada: si el fichero no está, el
   * `og:image` de esa boda apunta a un 404 y quien mande el enlace por
   * WhatsApp --que es como una pareja le enseña su reportaje a la familia--
   * no ve ninguna previsualización. Peor que la tarjeta genérica.
   *
   * No se nota en pantalla y no lo cazaba nada: cuando se escribió esta
   * prueba faltaban TRES de las veintiséis, dos de ellas de bodas añadidas
   * ese mismo día. Por eso se comprueba el disco y no el código.
   */
  it('deja junto a cada portada su JPEG de 1200x630 para compartir', async () => {
    const { existsSync } = await import('node:fs');
    const { join } = await import('node:path');
    const sinDerivado = projects
      .map((p) => p.cover.src)
      .filter((src): src is string => Boolean(src) && src.endsWith('.webp'))
      .filter((src) => !existsSync(join(process.cwd(), 'public', src.replace(/\.webp$/, '-og.jpg').replace(/^\//, ''))));
    expect(sinDerivado).toEqual([]);
  });

  it('has exactly 30 projects with unique slugs', () => {
    // A tripwire, not a description: the number is here so that losing a
    // wedding to a bad edit fails loudly instead of silently. It was left
    // at 17 while the catalogue grew to 29, so it had been failing for a
    // while and telling nobody anything. Update it deliberately when a
    // real project is added or removed.
    // 2026-09-11: 29 -> 28. Se retiró «Basílica y vestido rojo», la única
    // ficha cuya pareja no estaba identificada (título y slug eran
    // descriptivos, a la espera de que el cliente diera los nombres).
    // 2026-09-11: 28 -> 29. Entra «Maite y Nerea», de la tarjeta EOS_DIGITAL.
    // 2026-09-11: 29 -> 30. Entra «Isa y Jose», de la misma tarjeta: la
    // jornada entera en 24 fotografías.
    // 2026-09-13: 30 -> 32. Del disco duro del cliente entran la preboda de
    // Angélica y Jesús (la misma pareja que la boda de diciembre de 2023) y
    // la boda de Sandra y Jesús, en Utrera.
    expect(projects).toHaveLength(32);
    const slugs = projects.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('has a portrait for every card in the grid with enough pixels not to be upscaled', () => {
    // POR QUÉ ESTO IMPORTA EN ESTA WEB Y NO EN OTRA. La rejilla de /trabajos
    // pinta cada reportaje en una casilla vertical 2:3 de unos 384 px, que en
    // una pantalla de densidad doble son 768 px reales. Si la imagen que se
    // mete ahí no tiene 768 px de ancho DESPUÉS de recortarla a 2:3, el
    // navegador la amplía y se ve el grano.
    // Pasó de verdad: las dos fichas de vídeo usaban el póster del clip
    // (1280x720). Recortado a 2:3 quedan 480 px de ancho, o sea una
    // ampliación del 60%. El cliente lo vio antes que nosotros.
    // `thumb` es el suplente vertical que existe justo para esto.
    const ANCHO_CASILLA = 384 * 2;
    const flojas: string[] = [];
    for (const p of projects) {
      const retrato = p.thumb ?? p.cover;
      const src = retrato.type === 'video' ? retrato.poster : retrato.src;
      if (!retrato.width || !retrato.height) continue;
      const aprovechado = Math.min(retrato.width, Math.round((retrato.height * 2) / 3));
      const escala = ANCHO_CASILLA / aprovechado;
      // 1.10 y no 1.00: una ampliación por debajo del 10% no se ve, y exigir
      // el píxel exacto obligaría a reencuadrar fotografías que están bien.
      if (escala > 1.1) flojas.push(`${p.slug} (${src}, x${escala.toFixed(2)})`);
    }
    expect(flojas).toEqual([]);
  });

  it('never sends a landscape frame into the portrait wall of the grid', () => {
    // ESTO NO ES LO MISMO QUE LA PRUEBA DE ARRIBA, y por eso son dos.
    // Aquélla mide PÍXELES: que lo que se mete en la casilla tenga bastantes
    // para no ampliarse. Ésta mide ENCUADRE.
    //
    // Una fotografía apaisada dentro de una casilla 2:3 pierde el 56% de su
    // anchura por el recorte. La aritmética de la otra prueba la aprueba sin
    // pestañear -- un apaisado de 2560 px conserva 1138 px de ancho, de sobra
    // para los 768 que pide la casilla --, pero en pantalla se ve a la pareja
    // arrinconada en una esquina con media fotografía tirada, y al lado de las
    // casillas verticales se ve encima más blanda, porque sobrevive menos
    // fichero por píxel pintado. El cliente lo señaló en dos reportajes
    // (raquel-y-fran y soledad-y-alejandro) llamándolo «pixelada», que es como
    // se ve el problema aunque no sea como se llama.
    //
    // `thumb` es el suplente vertical que existe justo para esto: cuando la
    // portada de un reportaje es apaisada, hay que darle a la rejilla una
    // fotografía propia.
    const apaisadas: string[] = [];
    for (const p of projects) {
      const retrato = p.thumb ?? p.cover;
      if (!retrato.width || !retrato.height) continue;
      const proporcion = retrato.width / retrato.height;
      // 1.05 y no 1.00: un cuadrado justo se recorta poco y no vale la pena
      // rechazarlo.
      if (proporcion > 1.05) {
        const src = retrato.type === 'video' ? retrato.poster : retrato.src;
        apaisadas.push(`${p.slug} (${src}, ${retrato.width}x${retrato.height})`);
      }
    }
    expect(apaisadas).toEqual([]);
  });

  it('flags every seed media item as placeholder, except real media explicitly marked otherwise', () => {
    // 'eva-y-rafa', 'raquel-y-fran', and 'andrea-y-jesus' all carry
    // genuine client photos/footage (provided 2026-08-31 and 2026-09-01,
    // organized by the client into per-couple folders) — every other seed
    // project is still stock/placeholder content.
    const realSlugs = [
      'eva-y-rafa', 'raquel-y-fran', 'andrea-y-jesus', 'andrea-y-enrique', 'marta-y-alvaro', 'maria-y-francisco-manuel', 'rocio-y-juanje',
      'virginia-y-jorge',
      // 2026-09-07: weddings rebuilt from the studio's "BODAS DEFINITIVAS" folder (named couples).
      'carmen-y-alberto', 'gloria-y-andres', 'angelica-y-jesus', 'miriam-y-alejandro', 'maria-angeles-y-borja', 'carmen-y-enrique',
      'reyes-y-francisco', 'jesus-y-javier', 'rocio-y-manuel', 'silvia-y-david', 'silvia-y-jordi', 'kuki-y-jose', 'maria-y-alberto',
      'eva-y-jose', 'soledad-y-alejandro',
      // de la tarjeta EOS_DIGITAL
      'maite-y-nerea', 'isa-y-jose',
      // preboda / postboda sessions from EOS_DIGITAL
      'postboda-en-el-real-alcazar', 'preboda-de-carmen-y-alberto', 'postboda-de-maria-y-alberto', 'preboda-en-la-playa', 'preboda-en-santa-cruz',
      // 2026-09-13, del disco duro del cliente
      'preboda-de-angelica-y-jesus', 'sandra-y-jesus',
    ];
    for (const project of projects) {
      const isReal = realSlugs.includes(project.slug);
      if (isReal) {
        expect(project.cover.isPlaceholderMedia).toBe(false);
        for (const media of project.gallery) expect(media.isPlaceholderMedia).toBe(false);
      } else {
        // No seed project is stock-only any more; any future placeholder
        // entry must still declare itself as such on its cover.
        expect(project.cover.isPlaceholderMedia).toBe(true);
      }
      for (const media of project.gallery) {
        if (media.type === 'video') expect(media.poster).toBeTruthy();
      }
    }
  });

  it('includes at least one video-led project', () => {
    expect(projects.some((p) => p.category === 'video')).toBe(true);
  });
});

describe('services content', () => {
  it('covers the two EME services: photo and video', () => {
    const slugs = services.map((s) => s.slug).sort();
    expect(slugs).toEqual(['boda', 'video']);
  });
});
