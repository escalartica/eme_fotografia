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

### 4. Faltan fotos en tres reportajes — estudio

La mediana de los 30 reportajes publicados es de **18 fotos**. Estos tres se
quedan muy por debajo y se nota al abrirlos:

| Reportaje | Fotos | Faltan para la mediana |
|---|---|---|
| `rocio-y-juanje` | 5 | 13 |
| `maria-y-francisco-manuel` | 6 | 12 |
| `marta-y-alvaro` | 8 | 10 |

Salen de «BODAS DEFINITIVAS» en el DISCO DURO. No hace falta llegar a 18: con
doce ya dejan de parecer fichas a medio hacer.

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
