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

1. ~~`/api/galeria/[slug]/seleccion` sin tope de elementos, sin deduplicar y
   sin limitador~~ — **HECHO**. La ruta lleva limitador por sesión, tope de
   entradas contra la lista real de fotos de la galería, una entrada por foto
   y escritura atómica. El 13/09 se subió el limitador de 30 a 240 envíos por
   diez minutos: desde que la galería guarda sola, cada corazón acaba en una
   petición, y treinta corazones dejaban a la pareja el resto de la tarde con
   «No hemos podido guardar». Y el guardado automático ahora **reintenta de
   verdad** a los quince segundos, que el aviso decía que lo hacía y no era
   cierto.

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
6. **`client_max_body_size` de nginx sigue en 64 MB** y la aplicación anuncia
   400 MB por galería. Mitigado el 13/09: el formulario ahora suma el peso de
   las fotos, avisa ANTES de subir si se pasa de 64 MB y traduce el 413 de
   nginx a un mensaje que dice qué hacer. Pero el arreglo de verdad es subir
   el límite de nginx, porque cuarenta fotos de boda pasan de 64 MB sin
   esfuerzo y partir la subida en dos tandas es una molestia recurrente:

   ```
   # /etc/nginx/sites-available/eme, dentro del server
   client_max_body_size 420M;
   ```
   Y después `nginx -t && systemctl reload nginx`. Si se cambia, hay que
   cambiar también `LIMITE_SERVIDOR_BYTES` en
   app/admin/galerias/nueva/NewGalleryForm.tsx, que es de donde sale el aviso.
   Añadir de paso `proxy_set_header X-Forwarded-Host $host;`.

**Maquetación — todo esto se hizo el 13/09:**

7. ~~Dos bandas de anchura donde la página queda a medias~~ — los nueve
   `min-width: 960px` de `/trabajos` y `/contacto` bajados a 900, que es donde
   cambia todo lo demás, y los `max-width: 700px` pasados a `699.98px` para
   que a 700 exactos no se apliquen las dos reglas a la vez.
8. ~~Los nombres del equipo al 42 % de opacidad~~ — a 0,62 (4,6:1). El
   comentario que decía que 0,42 cumplía la norma estaba mal y se ha
   corregido con los números medidos.
9. ~~El aviso de cookies tapa los dos botones flotantes~~ — el aviso pone
   `data-aviso-cookies` en el `body` mientras está a la vista y los dos
   botones se apartan. Un atributo distinto del `data-capa-completa` del menú
   a propósito: ese lo lee el propio aviso para apartarse él.
10. ~~El foco de los campos del formulario no se distinguía del `:hover`~~ —
    ahora llevan el mismo anillo que el panel y la galería privada.

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

### 13. Lo que enseñó la primera galería creada de verdad — 13/09/2026

El estudio creó `jesusyandrea` desde su móvil, sin nadie al lado. Cuatro cosas
que no se ven mirando el código:

- **La contraseña que se escribió fue `12345678`.** El campo estaba vacío, el
  mínimo eran ocho caracteres, y eso fue lo que se tecleó. No es descuido: un
  campo vacío pregunta «¿qué contraseña quieres?» con cuarenta fotos
  esperando a subirse. Ahora el campo **viene relleno** con diez caracteres al
  azar (`lib/gallery-credentials.ts`), el mínimo son diez, y se rechaza lo que
  solo son números, una secuencia del teclado o dos caracteres repetidos —
  también en las dos rutas del API, que un POST puede no pasar por el
  formulario.
- **El mensaje de WhatsApp llegaba con los saltos en mitad de la frase.** El
  texto estaba partido a mano al ancho del editor. Un test lo impide ahora:
  una línea larga que no acabe en punto o dos puntos es una frase partida.
- **El enlace se rompía por la mitad del dominio** en la pantalla de
  confirmación (`emefot / ografiasevilla.com`). Un `<wbr>` antes de cada barra
  le da al navegador sitios mejores por donde cortar, y en móvil el botón de
  copiar baja a su propia línea para dejarle el ancho entero.
- **Los tres botones de esa pantalla salían con tres anchos distintos** en un
  móvil, cada uno el de su texto. Apilados y a la misma anchura.

Queda sin tocar, porque no es un fallo: el enlace se escribió a mano sin
guiones (`jesusyandrea`) mientras el usuario los conservaba
(`jesus-y-andrea`). Los dos campos se sugieren igual; cambiar uno no cambia el
otro, y así debe seguir.

**Borrar la galería de prueba `jesusyandrea` cuando termine el test.**

### 14. La galería privada, después de la primera prueba con una pareja — 13/09/2026

Se probó entera desde un iPhone. Lo que salió:

1. **El teclado se cerraba con cada letra al comentar una foto desde el
   visor.** El efecto que monta la trampa de foco (`components/motion/Lightbox.tsx`)
   dependía de `onClose`, que se escribe en el JSX y por tanto es una función
   nueva en cada renderizado: cada tecla la desmontaba y la volvía a montar, y
   `focus-trap` al activarse mueve el foco. Nueve montajes para ocho letras.
   Ahora `onClose` vive en una referencia y el efecto sólo depende de `isOpen`.
   `components/motion/Lightbox.foco.test.tsx` cuenta los montajes.
2. **La barra fija de abajo se transparentaba por detrás del visor**: el telón
   es un negro al 92 %, no al 100 %. Con el visor abierto la barra ya no se
   puede usar, así que desaparece, y el campo de la nota del visor pasó de un
   relleno al 8 % a opaco. Como el «Guardado» vivía en esa barra, se ha metido
   también dentro del visor.
3. **Deslizar para pasar de foto**, sólo en horizontal; las flechas siguen.
4. **El visor tiene scroll propio**: con el teclado abierto la nota caía fuera
   de la pantalla. Va en `.visor` y no en `.content`, que recortaría el botón
   de cerrar.
5. **La foto anterior y la siguiente se piden por adelantado**, que son fotos
   a pantalla completa y cada flecha dejaba un hueco en blanco.
6. **El visor bloquea el scroll de la página de debajo** y avisa al resto del
   sitio de que hay una capa (lo mismo que ya hacía el menú): arrastrar sobre
   el telón movía la página del fondo, y los botones flotantes se pintaban por
   delante de la fotografía.
7. **«29 De Agosto De 2026»** → «29 de agosto de 2026». Sobraba un
   `text-transform: capitalize`.
8. **El anillo de foco del campo de notas de la cuadrícula** se dibujaba por
   fuera de un panel con `overflow: hidden` y lo que quedaba era media raya
   cruzando la etiqueta. Ahora va hacia dentro.

9. **Quitar el corazón desde el visor, con el filtro en «favoritas», cambiaba
   la foto debajo del dedo** -- y si era la última, cerraba el visor de golpe.
   El visor recorría la lista ya filtrada, que se recalcula al instante.
   Ahora la lista se congela al abrir el visor. Repasar las favoritas quitando
   corazones es justo lo que hace una pareja antes de enviar.
10. **El iPhone ponía en mayúscula la primera letra del usuario**, que es
    siempre un slug en minúsculas: la pareja no entraba y el mensaje --que a
    propósito no dice cuál de los dos datos está mal-- no daba ninguna pista.
    Al campo le faltaba el `autoCapitalize="none"` que el panel sí tenía, y
    de paso el servidor compara ya sin distinguir mayúsculas ni espacios de
    los bordes, para quien pega el dato desde el WhatsApp del estudio.
11. La galería de la pareja **no tenía ninguna prueba**:
    `app/[slug]/GalleryClient.test.tsx` cubre el contador, el filtro, el
    guardado automático y la regresión del punto 9.

### 15. Lo que se le añadió al panel el mismo día — 13/09/2026

No salió de un fallo, salió de mirar qué pasa DESPUÉS de que llegue una
selección.

- **Aviso por correo cuando una pareja envía su selección**
  (`avisarDeSeleccion` en lib/mail.ts). Antes la selección se quedaba
  esperando en el panel hasta que a alguien se le ocurría entrar a mirar, y al
  otro lado hay dos personas que pasan el día fuera, en bodas. **Del correo
  salen los números y el enlace al panel, nunca las notas**: lo que la pareja
  escribe en cada foto vive detrás de una contraseña y un correo se reenvía,
  se queda en el móvil y pasa por servidores que no son nuestros. Sólo se
  manda con el envío de verdad, no con cada guardado automático, y si el
  servidor de correo está caído la selección se guarda igual: el aviso va
  suelto, sin bloquear la respuesta.
- **Filtrar en la vista del panel**: Todas / Marcadas / Con nota, las mismas
  pastillas que ve la pareja. Una boda son ciento ochenta fotos y se marcan
  treinta; sin filtro hay que bajar por las ciento ochenta buscando corazones.
- **«Copiar los nombres de las marcadas»**, uno por línea. Lo siguiente que
  pasa después de mirar esa pantalla es abrir el revelador y buscar esas
  fotos en la tarjeta, y copiar treinta nombres a mano es donde se cuela el
  error que luego aparece en el álbum.
- `app/admin/galerias/[slug]/AdminGalleryView.test.tsx` es la primera prueba
  que tiene el panel.

### 16. Lo que sacó la revisión de todo lo anterior — 13/09/2026

Se pasó el diff entero por una revisión independiente. Lo que encontró, ya
arreglado:

1. **El aviso por correo era un amplificador.** El mismo cambio que subía el
   limitador de selecciones de 30 a 240 cada diez minutos --que tenía que
   subirlo: cada corazón que marca una pareja acaba en una petición-- añadía
   un correo por cada envío. Juntos: 240 correos en diez minutos al buzón del
   estudio, disparables por cualquiera con el enlace y la contraseña de una
   galería, y suficiente para quemar la cuota del proveedor y con ella el
   formulario de contacto. Ahora se avisa como mucho una vez por hora y por
   galería, contado desde el último envío ya guardado (`AVISO_MIN_MS`). Tres
   pruebas nuevas en la ruta.
2. **El guardado automático no abortaba la petición anterior.** Con una red
   lenta salían dos POST solapados con cuerpos distintos y podía ganar el
   estado viejo, con la pantalla diciendo «Guardado». `AbortController`.
3. **El reintento no crecía ni se rendía nunca**: 240 peticiones al día desde
   una pestaña olvidada, y contra un 429 sólo mantenía el cubo lleno. Ahora
   dobla la espera hasta cinco minutos y no reintenta un 4xx que no sea 408 o
   429. Cuatro pruebas con relojes falsos.
4. **La contraseña sugerida del panel se calculaba una vez por carga**: dos
   galerías creadas seguidas sin recargar habrían compartido contraseña, y
   como viene rellenada nadie la mira. Se tira en cuanto se usa.
5. **Hacer pinch para ampliar una foto pasaba de foto** (el gesto tomaba el
   primer dedo sin mirar cuántos había), y faltaba `onTouchCancel`. De paso,
   `touch-action: pan-y` a secas desactivaba el zoom de dos dedos: ahora es
   `pan-y pinch-zoom`.
6. **El `max-height: 100%` del visor no hacía nada**: un porcentaje sólo se
   resuelve contra un contenedor con altura definida, y `.content` sólo tiene
   `max-height`. O sea que el scroll que arreglaba lo de la nota bajo el
   teclado no existía. Ahora lleva el mismo `calc()` que `.content`.
7. **Abrir el visor movía la página del fondo ~10 px** al quitarle la barra de
   scroll. `scrollbar-gutter: stable` en la hoja global. Se notaba sobre todo
   en las galerías públicas, donde el visor se abre una vez por foto.
8. **El candado del scroll no contaba capas**: si dos coincidían, la primera
   en cerrarse se lo devolvía a una página todavía tapada. `bloquearElScroll`
   lleva un contador.
9. El aviso de cookies y los dos botones flotantes se entienden ahora por el
   mismo mecanismo que ya usaba el menú (un atributo en el `body` y un gancho)
   en vez de por una regla de CSS aparte.
10. **La prueba de privacidad del correo no podía fallar**: comprobaba que el
    texto contuviera una frase. Ahora se le pasan notas de verdad y se
    comprueba que NO salen. Y el nombre de la pareja se escapa en el HTML.
11. **`generarPassword` no se validaba contra sus propias reglas.** Una vez
    cada tres millones habría devuelto algo que el propio formulario rechaza.
    Se revisa antes de entregar, y hay mil tiradas que lo comprueban.
12. `ssh root@LA_IP` no es lo mismo que `ssh eme`: el `~/.ssh/config` del Mac
    lleva `IdentitiesOnly yes`, así que con la IP a pelo SSH no tiene ninguna
    clave que ofrecer. Corregido en `docs/DESPLIEGUE.md` §4 y §11, que es de
    donde salía el comando equivocado.
