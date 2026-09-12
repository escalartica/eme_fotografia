/**
 * EL TECHO DE PÍXELES QUE SE LE PONE A SHARP, en un solo sitio.
 *
 * EL ATAQUE QUE ESTO PARA se llama bomba de descompresión, y con imágenes es
 * más barato de lo que parece: un PNG de menos de un megabyte puede
 * declararse de 30.000 x 30.000 píxeles, porque lo que ocupa en disco es la
 * versión comprimida y lo que ocupa en memoria es ancho x alto x 4 bytes. Esos
 * 30.000 cuadrados son 3,6 GB de RAM en una sola petición. El tope de tamaño
 * de fichero --25 MB por foto en la subida-- no lo detecta: mide el fichero
 * comprimido, que es justo lo que la bomba deja pequeño.
 *
 * Y aquí se multiplica por dos motivos: la subida acepta hasta 60 fotos en una
 * petición, y este sitio se despliega como UN SOLO proceso Node, así que
 * agotar su memoria es tirar la web entera, no una petición.
 *
 * 120 MEGAPÍXELES, y el número sale del oficio, no de una regla general. La
 * cámara de mayor resolución que se usa en bodas es una GFX de 102 MP; una R5
 * son 45 y una A7 IV, 33. 120 deja sitio de sobra para cualquier cámara que
 * este estudio pueda comprar y para un panorama cosido, y sigue estando cinco
 * veces por debajo del valor por defecto de sharp (0x3FFF x 0x3FFF, unos 268
 * MP, que son 1 GB de RAM por foto).
 *
 * Al superarlo, sharp LANZA. Quien lo llama decide qué hacer: la subida
 * rechaza el fichero con un mensaje claro, y la generación de miniaturas cae
 * al original (ver app/[slug]/photo/[filename]/route.ts).
 */
export const MAX_PIXELES = 120_000_000;

/** Las opciones que TODA llamada a sharp de este proyecto tiene que pasar. */
export const OPCIONES_SHARP = { limitInputPixels: MAX_PIXELES } as const;

/**
 * ¿Esta imagen declara más píxeles de los que estamos dispuestos a decodificar?
 *
 * Se pregunta ANTES de escribir nada en disco, y por eso mira los metadatos y
 * no la imagen: `metadata()` lee sólo la cabecera --unos cientos de bytes-- y
 * no decodifica, así que preguntarle el tamaño a una bomba de descompresión no
 * la detona. `limitInputPixels` protege el decodificado; esto protege el
 * ALMACENAMIENTO, que es la otra mitad: sin esta comprobación la bomba se
 * guardaba igual y reventaba después, en cada visita que intentara generar su
 * miniatura.
 *
 * Devuelve `false` cuando no se puede saber. Es deliberado: sharp no está en
 * todos los entornos --es un binario nativo-- y un limpiador que rechaza todas
 * las fotos porque no puede medirlas es peor que uno que deja pasar una rara.
 * El resto de topes (25 MB por fichero, 400 MB por galería) siguen puestos.
 */
export async function excedeElTechoDePixeles(bytes: Uint8Array): Promise<boolean> {
  try {
    const sharp = (await import('sharp')).default;
    // `limitInputPixels: false` AQUÍ, Y SÓLO AQUÍ. Parece lo contrario de lo
    // que este fichero hace, y es justo lo que lo hace funcionar.
    //
    // El fallo que esto arregla lo encontró la prueba de la bomba de 900
    // megapíxeles: con las opciones normales, `sharp()` aplica su propio tope
    // y LANZA al abrir la imagen. El `catch` de abajo devolvía entonces
    // `false` --que significa "déjala pasar"-- así que el guardián fallaba
    // abierto precisamente con las bombas más grandes, que son las únicas que
    // importan. Una bomba de 200 MP se rechazaba y una de 900 entraba.
    //
    // Quitar el tope para MEDIR no abre nada: `metadata()` lee la cabecera
    // --unos cientos de bytes-- y no decodifica ni un píxel, así que
    // preguntarle el tamaño a una bomba no la detona. El tope de decodificado
    // sigue puesto en todas las demás llamadas del proyecto (OPCIONES_SHARP);
    // esta es la única que pregunta, y para poder rechazar algo primero hay
    // que poder medirlo.
    const { width, height } = await sharp(bytes, { limitInputPixels: false }).metadata();
    if (!width || !height) return false;
    return width * height > MAX_PIXELES;
  } catch {
    return false;
  }
}
