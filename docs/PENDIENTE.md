# Lo que queda pendiente

Todo lo que se ha ido dejando para después, en un solo sitio. Cada punto dice
**quién** tiene que hacerlo, porque la mitad no depende del código.

Última revisión: 12 de septiembre de 2026.

> **La web se publicó el 12/09/2026** en un VPS Linux M+ de IONOS (Ubuntu 24.04,
> centro de datos de España), con certificado de Let's Encrypt y renovación
> automática. El pentest contra el dominio publicado pasó **61 de 61, sin
> pendientes**. El paso a paso quedó en `DESPLIEGUE.md`.

> El bloque «Próximamente» de /sobre-nosotros lo confirmó el estudio ese
> mismo día: los formatos existen y se publica tal cual. Queda una nota en el
> código para retirarlo cuando dejen de ser una novedad.

---

## Antes de publicar

### 1. `emebodas.com` se renueva solo — IONOS, y no depende de nada

Caduca el **20/07/2027** y la renovación automática está desactivada. Un
dominio que expira lo puede registrar cualquiera al día siguiente, incluido
alguien que quiera aprovechar el nombre. Es un clic en el panel y conviene
darlo hoy, aunque el dominio vaya a dejar de usarse: mientras siga apuntando a
cosas del estudio, perderlo es peor que mantenerlo.

### 2. Protección de dominio — IONOS

Está **contratada** en el 97181010 (01/09/2026 – 02/09/2027) y **desactivada**
en los dos dominios. Se paga y no se usa.

### 3. ~~Pasar los tests y el pentest~~ — HECHO

564 tests en verde y el pentest contra el dominio publicado: **61 bien, 0 mal,
0 por comprobar**. Las cuatro comprobaciones que en desarrollo se quedaban
pendientes (CSP, HSTS y las dos cabeceras de caché del panel) están confirmadas
contra el servidor real.

Conviene repetirlo después de cada despliegue:

```bash
npx vitest run
npm run pentest -- https://www.emefotografiasevilla.com
```

### 4. Faltan fotos en cuatro reportajes — SOLO PUEDE HACERLO EL ESTUDIO

La mediana de los 30 reportajes publicados es de **18 fotos**. Estos cuatro se
quedan muy por debajo y se nota al abrirlos:

| Reportaje | Fotos | Faltan para la mediana |
|---|---|---|
| `rocio-y-juanje` | 3 | 15 |
| `maria-y-francisco-manuel` | 5 | 13 |
| `marta-y-alvaro` | 7 | 11 |
| `andrea-y-enrique` | 9 | 9 |

**Ya se ha buscado en todo lo que hay conectado, y no hay más. 12/09/2026.**
Se recorrieron una a una: `development/eme_fotografia/fotos eme/`, el DISCO
DURO entero (BODAS DEFINITIVAS, PRE BODAS DEFINITIVAS, WEB-EME 26) y la
tarjeta EOS_DIGITAL. Resultados:

- Las siete carpetas de `fotos eme/` son EXACTAMENTE el origen de estas
  galerías y están agotadas: 4 originales para Rocío y Juanje, 6 para María y
  Francisco Manuel, 8 para Marta y Álvaro, 10 para Andrea y Enrique. Todos
  publicados ya (comprobado foto a foto con huella perceptual, no por nombre
  de fichero).
- En «BODAS DEFINITIVAS» hay carpeta para diecisiete bodas, pero NINGUNA de
  estas cuatro parejas.
- La tarjeta EOS_DIGITAL tiene 485 RAW sin revelar (JD6A0001–0499) que no son
  de ninguna boda publicada, más la carpeta «ISA YJOSE», de la que se
  sacaron dos fotos más para esa galería.

O sea que esto NO es una tarea de desarrollo pendiente: hasta que el estudio
no traiga más copias etalonadas de esas cuatro bodas, no hay nada que
subir. No hace falta llegar a 18: con doce ya dejan de parecer fichas a medio
hacer.

Y un aviso para cuando lleguen: **no vale con mandar más fotogramas del mismo
momento.** En la última revisión se descartaron cuatro candidatas por eso
mismo --eran el mismo encuadre movido unos centímetros de fotos que ya
estaban publicadas--, que es justo lo que el estudio pidió quitar.

### 4 bis. Lo que dejaron las dos auditorías del 12/09/2026 — desarrollo

Se pasaron dos auditorías completas sobre el código ya publicado: una de
seguridad y backend y otra de responsive y accesibilidad. Lo que se arregló
ese mismo día está en el historial; esto es lo que queda, por orden.

**Disponibilidad (lo más serio que queda):**

1. `/api/galeria/[slug]/seleccion` no limita CUÁNTOS elementos acepta ni
   deduplica, y es la única ruta que cambia estado sin limitador de
   peticiones. Quien tenga la contraseña de una galería --o a quien la pareja
   le haya reenviado el enlace-- puede escribir un `selection.json` de cientos
   de MB en bucle, y el panel lee esos ficheros para pintar el listado.
   Además `saveSelection` escribe sin el patrón temporal+rename que sí usa
   `escribirMetaAtomico` doce líneas más arriba: si el proceso muere a media
   escritura, la selección entera de la pareja desaparece EN SILENCIO --el
   panel dice «El cliente todavía no ha enviado su selección».
2. Cualquiera puede dejar al estudio sin poder entrar en `/admin` durante
   quince minutos, en bucle, saturando el cubo global con contraseñas
   equivocadas. El cubo global existe justamente para no fiarse de la IP, así
   que el remedio no es de código: una celda de **fail2ban** que banee a quien
   machaca `/api/admin/login`. fail2ban ya está instalado en el servidor.
3. Lo mismo con el formulario de contacto: sesenta envíos dejan a todas las
   parejas reales sin poder escribir durante una hora. Subir bastante el techo
   global (600/hora sigue frenando el llenado de disco).
4. `data/analytics/` crece sin rotación ni purga, y `/admin/estadisticas`
   carga noventa ficheros enteros en memoria en cada visita. Falta un borrado
   de lo que pase de 90 días, y una frase en el §3 de `/privacidad` diciendo
   cuánto se conserva.

**Servidor:**

5. La copia de seguridad diaria (`docs/DESPLIEGUE.md` §10) genera el tar como
   root con umask 022, o sea **0644, legible por cualquier cuenta de la
   máquina**, y dentro van los hashes de contraseña de cada galería, las fotos
   y los datos de las parejas. Poner `umask 077` al principio del script. De
   paso, excluir `data/galleries/*/derivados/`, que es caché regenerable.
6. `client_max_body_size` de nginx (64 MB) contradice lo que la aplicación
   anuncia (400 MB por galería): el fotógrafo recibe un 413 de nginx en vez
   del mensaje cuidado de la aplicación. Decidir un número y ponerlo en los
   dos sitios. Y añadir `proxy_set_header X-Forwarded-Host $host;`.

**Maquetación (nadie se ha quejado todavía, pero está medido):**

7. **Dos bandas de anchura donde la página queda a medias.** A 700 px exactos
   conviven reglas `max-width: 700` y `min-width: 700` de módulos distintos.
   Y entre 900 y 959 px la cabecera ya es de escritorio mientras `/trabajos` y
   `/contacto` siguen pintando la versión de teléfono, porque esos dos cambian
   en 960 y todo lo demás en 900. Se ve en un iPad en apaisado con Split View.
   Arreglo: bajar los nueve `960` a `900` y pasar los `max-width: 700` a
   `699.98px`.
8. Los nombres del equipo en `/sobre-nosotros` se pintan al 42 % de opacidad
   en REPOSO, que sobre papel da 2,8:1 contra los 4,5:1 que pide la norma. Es
   sólo escritorio. 0,62 da 4,6:1.
9. El aviso de cookies tapa los dos botones flotantes en un teléfono: mide
   unos 170 px de alto y ocupa justo su franja. Sólo en la primera visita.
10. El único indicador de foco de los campos del formulario es un filete que
    pasa de 1 px a 2 px, y el `:hover` pinta ese mismo filete: con ratón,
    «encima» y «enfocado» no se distinguen.

### 5. Retratos del equipo — estudio

Los de `public/images/equipo/` están a 900×1200, que es poco para un retrato a
tamaño grande. Si existen los originales, se rehacen.

### 6. Cuatro preguntas del FAQ sin confirmar — estudio

Llevan `isPendingConfirmation: true` en `content/faq.ts`. **Se muestran en la
web**, pero quedan fuera de los datos estructurados y de `/llms.txt`: un
resultado enriquecido en Google es una promesa pública, y publicar una sobre
una condición comercial que el estudio no ha firmado es lo que se gana una
penalización manual.

- ¿Con cuánta antelación hay que reservar un fotógrafo de bodas en Sevilla?
- ¿Cómo se reserva la fecha?
- ¿Quién tiene los derechos de las fotos y los vídeos?
- ¿Qué pasa si tenemos que cambiar la fecha?

Confirmadas, se les quita la marca y pasan a aparecer también en Google.

### 7. Maite y Nerea: qué sesión es — estudio

La ficha no dice «preboda» ni «postboda» porque nadie lo sabe, y decir
cualquiera de las dos sería inventarlo. Con la respuesta, la descripción gana
la palabra que le falta y la página, una búsqueda más por la que aparecer.

### 8. La música de los vídeos — estudio

Confirmar que la licencia cubre el uso en la web. No es una formalidad: una
reclamación de derechos sobre la música de un reportaje publicado se resuelve
retirando el vídeo.

---

## El día del cambio de servidor

Está todo en `DESPLIEGUE.md`. Los tres fallos que no avisan:

1. **No tocar los registros MX.** Se cambian los `A` y nada más, o el estudio
   se queda sin `info@` ni `contratos@`.
2. **`WorkingDirectory` en el servicio de systemd** tiene que ser el
   directorio de la aplicación. Si no, la web crea un `data/` vacío en otro
   sitio y las galerías «desaparecen».
3. **Ninguna cabecera de seguridad en nginx.** Las emite `next.config.mjs`;
   duplicarlas hace que el navegador aplique la CSP más restrictiva de las dos
   y rompe la web.

---

## Después de publicar

### 9. El peso del repositorio — ⚠️ esto es lo que no se puede pasar por alto

Hoy: **`.git` son 811 MB** y el árbol de trabajo otros 575. Un clon nuevo
descarga 811 MB. GitHub avisa a partir del giga y ya se está rozando.

Lo que engorda no son las fotos actuales sino la historia: cada recalibrado y
cada sustitución dejó dentro la versión vieja para siempre. Los diez objetos
más grandes del repositorio son vídeos, de 10 a 22 MB cada uno.

Se decidió **no tocarlo con el despliegue en marcha**, y hacerlo después en una
sesión dedicada. Son dos cosas distintas:

- **Sacar `public/videos` del repositorio** y sincronizarlo al servidor con
  rsync. Detiene el crecimiento desde ese día. 209 MB, y son lo que peor le
  sienta a git: binarios grandes que nunca se comparan línea a línea.
- **Reescribir la historia** para que `.git` adelgace de verdad. Obliga a
  forzar el push y a que cualquier copia del repositorio se vuelva a clonar.
  Por eso va después, con la web ya estable.

Git LFS se descartó: GitHub da 1 GB gratis y el repositorio ya está por encima,
así que sería de pago desde el primer día, y convertir la historia exige
igualmente reescribirla.

**Lo que NO hay que hacer:** bajar las fotos de 2560 a 2200 px. Se midió. A
calidad equivalente ahorra 63 MB —el 11 % de `public/`— y no acelera la web ni
un milisegundo, porque esos ficheros no los descarga nadie: las 21 pantallas
usan `next/image`, que genera al vuelo la versión del ancho que pide cada
pantalla. El de 2560 es el máster del que salen las demás. Encogerlo solo
rebaja el techo de calidad en pantallas retina, que en un portafolio de
fotografía es el escaparate.

### 10. Borrar el proyecto WordPress — IONOS

Corre sobre **PHP 8.0, sin soporte de seguridad desde finales de 2023**. En
cuanto la web nueva esté comprobada, sobra. **El contrato se queda**, que de él
cuelgan los tres buzones.

### 11. Comprar `emefotografiasevilla.es`

`next.config.mjs` ya lo redirige con un 308 al `.com` conservando la ruta. Solo
hay que registrarlo y apuntarlo a la misma IP.

### 12. La fecha real de publicación de cada vídeo — estudio

`videoUploadDate` en `content/types.ts`. Sin ella, la ficha de cada reportaje
se marca como `CreativeWork` en vez de `VideoObject` y el vídeo se descubre
solo por la extensión de vídeo del sitemap. Google exige `uploadDate` y no
acepta sustitutos; rellenarlo con un 1 de enero inventado fue exactamente lo
que se retiró. Con las fechas reales, los vídeos pueden aparecer en la búsqueda
de vídeo de Google.
