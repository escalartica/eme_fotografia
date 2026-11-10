import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { galleryPhotosDir, sniffImageKind, type GalleryPhoto } from '@/lib/gallery-store';
import { limpiarMetadatos } from '@/lib/image-metadata';
import { excedeElTechoDePixeles, MAX_PIXELES } from '@/lib/sharp-limites';
import { MAX_BYTES_POR_PETICION, MAX_FOTOS_POR_PETICION } from '@/lib/gallery-limits';

/**
 * Lo que comparten las dos rutas que reciben fotos: la que crea una galería
 * (app/api/admin/galerias/route.ts) y la que le añade más
 * (app/api/admin/galerias/[slug]/fotos/route.ts). Antes todo esto vivía
 * dentro de la primera; con dos puertas de entrada, tener la comprobación
 * escrita dos veces es la forma segura de que un día una de las dos se quede
 * atrás.
 */

// 60 MB por foto: lo normal es que lleguen encogidas a unos 600 KB desde el
// navegador (lib/reducir-foto.ts), pero si ese paso falla --un navegador
// viejo, un canvas sin memoria-- sube el original, y rechazarlo aquí sería
// castigar a quien menos culpa tiene. El techo de píxeles (MAX_PIXELES) es el
// que protege la memoria de verdad.
export const MAX_FILE_BYTES = 60 * 1024 * 1024;

export type ResultadoSubida =
  | { ok: true; photos: GalleryPhoto[] }
  | { ok: false; status: number; error: string };

/** Saca del formulario los ficheros de verdad (un campo vacío llega como un
 *  File de 0 bytes y no es una foto). */
export function fotosDelFormulario(form: FormData): File[] {
  return form.getAll('photos').filter((f): f is File => f instanceof File && f.size > 0);
}

/**
 * Los topes de UNA petición: cuántas fotos, cuánto pesa cada una y cuánto
 * pesan juntas. No mira la galería: el total de la galería lo comprueba quien
 * llama, porque solo él sabe cuántas tiene ya.
 */
export function validarLote(files: File[]): { status: number; error: string } | null {
  if (files.length === 0) {
    return { status: 400, error: 'Sube al menos una foto.' };
  }
  if (files.length > MAX_FOTOS_POR_PETICION) {
    return {
      status: 400,
      error: `Como mucho ${MAX_FOTOS_POR_PETICION} fotos en cada envío. El panel las reparte solo; si ves esto, recarga la página.`,
    };
  }
  let totalBytes = 0;
  for (const file of files) {
    if (file.size > MAX_FILE_BYTES) {
      return { status: 400, error: `"${file.name}" supera el tamaño máximo de ${MAX_FILE_BYTES / 1024 / 1024} MB.` };
    }
    totalBytes += file.size;
  }
  if (totalBytes > MAX_BYTES_POR_PETICION) {
    return {
      status: 400,
      error: `Este envío supera los ${MAX_BYTES_POR_PETICION / 1024 / 1024} MB. Exporta las fotos a menos resolución.`,
    };
  }
  return null;
}

/**
 * Comprueba y guarda en disco las fotos de una petición.
 *
 * Si UNA falla, se borran las que esta misma llamada ya había escrito, y
 * solo esas: en un añadido, la galería ya tiene fotos de antes que no se
 * pueden tocar. Lo que devuelve `ok` todavía no está en meta.json; apuntarlas
 * es cosa de quien llama.
 *
 * `primerNumero` es el número de la primera foto en la galería, para que el
 * texto alternativo siga la cuenta («Foto 41 de...») en vez de empezar en 1
 * con cada tanda.
 */
export async function guardarFotos(
  slug: string,
  files: File[],
  { primerNumero, clientName }: { primerNumero: number; clientName: string }
): Promise<ResultadoSubida> {
  const photosDir = galleryPhotosDir(slug);
  await fs.mkdir(photosDir, { recursive: true, mode: 0o700 });

  const escritas: string[] = [];
  const deshacer = async () => {
    await Promise.all(
      escritas.map((f) => fs.rm(path.join(/* turbopackIgnore: true */ photosDir, f), { force: true }))
    );
  };

  // El nombre del fichero lo genera SIEMPRE el servidor (nunca el que traía el
  // fichero subido): eso quita de en medio tanto el path traversal por un
  // nombre manipulado como la fuga del nombre original (las exportaciones de
  // los programas de revelado suelen llevar dentro el nombre y la fecha reales
  // del cliente).
  //
  // Y la extensión sale de los BYTES del fichero, no de su `Content-Type`: ese
  // campo lo escribe quien sube y no demuestra nada. Antes bastaba declarar
  // `image/jpeg` para que un .html o un .svg con <script> se guardara y luego
  // se sirviera desde el dominio del estudio.
  const photos: GalleryPhoto[] = [];
  let numero = primerNumero;
  try {
    for (const file of files) {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const kind = sniffImageKind(bytes);
      if (!kind) {
        await deshacer();
        return { ok: false, status: 400, error: `"${file.name}" no es una imagen JPG, PNG, WEBP o AVIF real.` };
      }
      // EL TOPE DE TAMAÑO DE FICHERO NO DETECTA UNA BOMBA DE DESCOMPRESIÓN:
      // mide el fichero comprimido, que es justo lo que la bomba deja pequeño.
      // Un PNG de menos de un mega puede declarar 30.000 x 30.000 píxeles, que
      // son 3,6 GB de RAM al decodificarlo. Se pregunta por la cabecera --que no
      // decodifica nada-- antes de escribir, para que la bomba no llegue
      // siquiera al disco: guardada, reventaría después en cada visita que
      // intentara generar su miniatura.
      if (await excedeElTechoDePixeles(bytes)) {
        await deshacer();
        return {
          ok: false,
          status: 400,
          error: `"${file.name}" declara más de ${Math.round(MAX_PIXELES / 1_000_000)} megapíxeles. Exporta a una resolución normal antes de subirla.`,
        };
      }

      // LOS METADATOS SE QUITAN ANTES DE TOCAR EL DISCO, no después: lo que se
      // guarda es ya lo limpio, así que no queda ni un instante en el que el
      // fichero con las coordenadas GPS del sitio de la boda exista en el
      // servidor. Ver lib/image-metadata.ts para qué se quita y por qué no se
      // reencodan los píxeles.
      const limpios = await limpiarMetadatos(bytes, kind);
      const id = crypto.randomUUID();
      const filename = `${id}.${kind}`;
      // `turbopackIgnore` NO es silenciar un aviso incómodo: es decirle al
      // compilador algo que él no puede deducir y nosotros sí.
      //
      // Turbopack ve un `path.join` cuyo primer trozo sale de una llamada a
      // función y, al no poder seguirla, se pone en lo peor: da por hecho que
      // esta ruta puede leer cualquier cosa del proyecto y mete el proyecto
      // ENTERO --incluida la carpeta `public`, que son cientos de MB de
      // fotografías-- dentro del paquete del servidor.
      //
      // Lo que él no puede ver: `photosDir` sale de `galleryPhotosDir(slug)`,
      // que se construye desde `path.join(process.cwd(), 'data', 'galleries')`,
      // y `slug` ha pasado por `isValidSlug` --minúsculas, dígitos y guiones, ni
      // barras ni puntos--. La ruta está acotada a data/galleries/<slug>/photos
      // y no hay forma de que apunte a otro sitio.
      await fs.writeFile(path.join(/* turbopackIgnore: true */ photosDir, filename), limpios, { mode: 0o600 });
      escritas.push(filename);
      photos.push({ id, filename, alt: `Foto ${numero} de la boda de ${clientName}` });
      numero += 1;
    }
  } catch (err) {
    await deshacer();
    throw err;
  }
  return { ok: true, photos };
}
