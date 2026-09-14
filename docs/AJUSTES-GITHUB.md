# Ajustes de GitHub que no están en el código

Hay cosas de un repositorio que no viven en ningún fichero: se configuran en la web de GitHub y
no se pueden commitear. Esta es la lista, en el orden en que conviene hacerla. Son diez minutos
y es lo que separa un repositorio que parece abandonado de uno que parece cuidado.

Todo se hace en **Settings** del repositorio, salvo lo que se indique.

## 1. Descripción, web y topics

Arriba a la derecha de la portada del repositorio, en el engranaje junto a "About".

**Description** (esto es lo que se lee en las búsquedas de GitHub y en las tarjetas que se
comparten):

```
Production source of a wedding photography studio's website in Seville. Next.js 16, private client galleries, cookie-less analytics, GDPR by default.
```

**Website:**

```
https://www.emefotografiasevilla.com
```

**Topics** (son el principal descubrimiento dentro de GitHub; pon los diez):

```
nextjs  react  typescript  photography  wedding-photography
private-gallery  gdpr  privacy-first  cookieless-analytics  gsap
```

Marca también **Releases** y **Packages** como ocultos si no se van a usar, y deja visible
**Use your GitHub Pages website** desmarcado.

## 2. Vista previa social

**Settings → General → Social preview → Upload an image.**

Sube `.github/assets/social-preview.jpg`, que ya está en el repositorio. Es la imagen que
aparece cuando alguien pega el enlace en LinkedIn, Twitter, Slack o WhatsApp. Sin ella, GitHub
pone un recuadro gris con el nombre del repositorio, que en una charla se nota.

## 3. Activar Discussions

**Settings → General → Features → Discussions.**

La plantilla de issues ya enlaza ahí para las preguntas que no son bugs
(`.github/ISSUE_TEMPLATE/config.yml`). Si no se activa, ese enlace lleva a un 404.

## 4. Comprobar que la CI arranca

Después del primer push, entra en la pestaña **Actions**. La primera ejecución de
`.github/workflows/ci.yml` tiene que quedar en verde. La insignia del README lee de ahí: si la
CI falla, en la portada aparece un "failing" en rojo, que es peor que no tener insignia.

Si algo falla, casi siempre es el sparse-checkout. Está explicado en los comentarios del propio
fichero.

## 5. Protección de la rama

**Settings → Rules → Rulesets → New branch ruleset**, sobre `worktree-eme-fotografia-build`:

- Require a pull request before merging: **no** por ahora. Es un repositorio de una persona y
  esto solo añade fricción.
- Require status checks to pass: **sí**, con `quality`. Así una PR de fuera no se puede fusionar
  con los tests en rojo.
- Block force pushes: **sí**, con una excepción: **desactívalo** el día que se ejecute el paso 4
  de `PLAN-MEDIA-FUERA-DE-GIT.md`, que necesita un force-push, y vuelve a activarlo después.

## 6. Seguridad

**Settings → Code security:**

- **Private vulnerability reporting: sí.** Da un canal privado sin depender solo del correo de
  `SECURITY.md`.
- **Dependabot alerts: sí.**
- **Dependabot security updates: sí.** Nueve dependencias de producción, así que el ruido va a
  ser poco.
- **Secret scanning y push protection: sí.** Es gratis en repositorios públicos y corta el día
  que a alguien se le cuele una clave en un commit.

## 7. Lo que NO hay que tocar todavía

- **No renombrar la rama por defecto.** El servidor de producción clona
  `worktree-eme-fotografia-build` por su nombre exacto. Va en el paso 5 de
  `PLAN-MEDIA-FUERA-DE-GIT.md`, junto al resto.
- **No borrar la rama `master`.** Está 235 commits por detrás y no la usa nadie, pero borrarla
  no aporta nada hoy y confunde a quien mire el historial esperando encontrarla.

## 8. Para que lo vea gente (y esto es lo que de verdad trae estrellas)

El README es condición necesaria y no suficiente: un repositorio sin visitas no consigue
estrellas por muy bueno que sea. Lo que sí funciona, por orden de esfuerzo:

1. **El paquete de galerías privadas.** Es lo único aquí que resuelve un problema que tiene
   mucha gente. El plan está en `PAQUETE-GALERIAS.md`. Un paquete pequeño y útil con un README
   de cinco minutos consigue más estrellas en un mes que este repositorio en un año.
2. **Escribir el caso, no anunciar el repositorio.** Un artículo del tipo "cómo se sirven fotos
   privadas sin que acaben en Google" o "analítica que la AEPD acepta sin banner", con el enlace
   al código dentro, funciona. Un "mirad mi repo" no.
3. **Las charlas de congreso.** Enlaza el repositorio en la última diapositiva y en la
   descripción del vídeo si se graba. Ahí sí hay público que clona.
4. **Awwwards y los premios de web juzgan el sitio publicado, no el repositorio.** Se presenta
   `emefotografiasevilla.com`. El repositorio suma como prueba del trabajo, no como candidatura.
