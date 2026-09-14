# Sacar las fotos y los vídeos de git

> **In English, in one paragraph.** This repository tracks roughly 626 MB of photographs and
> video, which makes a full clone around 830 MB. It is not an oversight: the production server
> gets `public/` by cloning this repository, so removing the media without changing the
> deployment would break the live site. This document is the migration plan, written to be run
> in an order where nothing is removed until its replacement is proven. It is deliberately **not
> executed** while the studio and its clients are working from the published site.

Última revisión: 14 de septiembre de 2026. **Estado: no ejecutado, a propósito.**

---

## El problema, con números

```
.git                        827 MB
árbol de trabajo            639 MB
  public/images             420 MB
  public/videos             209 MB
  todo lo demás              ~9 MB
```

Un clon completo son unos 830 MB para llegar a nueve megas de código. Efectos:

- Nadie clona esto en una charla, ni en una mesa de jurado, ni desde el móvil.
- La CI tiene que esquivarlo con un sparse-checkout (ver `.github/workflows/ci.yml`).
- Hay fotografías de personas identificables republicadas en un repositorio público, lo cual es
  un asunto distinto y peor que el peso. El consentimiento que firmaron es para que el estudio
  las use, no para que viajen dentro de un clon de git a cualquier disco del mundo.
- GitHub avisa a partir de 1 GB y empieza a poner pegas a partir de 5 GB. El margen que queda es
  de unas cuantas bodas más.

## Por qué no está hecho ya

Porque `public/` es carga útil del despliegue. El servidor hace, literalmente:

```bash
git clone --depth 1 --branch worktree-eme-fotografia-build \
  https://github.com/escalartica/eme_fotografia.git /var/www/eme/app
```

Si las fotos salen de git y no se cambia nada más, el siguiente despliegue deja la web sin
imágenes. La web está publicada desde el 12/09/2026, Eme trabaja desde ella y sus clientes
entran a sus galerías: no es el momento de mover el suelo.

## El orden, que es lo único que importa

La regla de este plan es que **nada se borra hasta que su sustituto está demostrado**. Los pasos
1 a 3 no tocan git para nada y son reversibles; el 4 es el que no tiene vuelta atrás.

### Paso 0. Copias de seguridad, antes de nada

```bash
# Espejo completo del repositorio, con todas las ramas y el historial entero.
git clone --mirror https://github.com/escalartica/eme_fotografia.git eme-espejo-2026-09-14.git
tar czf eme-espejo-2026-09-14.tar.gz eme-espejo-2026-09-14.git
```

Esa copia va al DISCO DURO externo, no al portátil. Y una segunda del `public/` que hay en el
servidor:

```bash
ssh eme@IP 'tar czf - -C /var/www/eme/app public' > public-vps-2026-09-14.tar.gz
```

Comprueba que las dos abren antes de seguir. Una copia que no se ha abierto nunca no es una
copia.

### Paso 1. Que el servidor reciba `public/` por rsync

Es exactamente lo que ya se hace con `.next/`, así que no es una técnica nueva en este
despliegue, solo una carpeta más:

```bash
rsync -az --delete public/ eme@IP:/var/www/eme/app/public/
```

Añádelo al procedimiento de actualización de `DESPLIEGUE.md` §11, **justo delante** del rsync de
`.next/`. Con el material todavía en git, esto es una operación que no cambia nada: rsync
sobrescribe los ficheros con los mismos ficheros.

### Paso 2. Demostrar que funciona

Despliega una vez con el paso 1 incluido y comprueba en el sitio publicado:

- La portada carga el vídeo del hero.
- Un reportaje de `/trabajos` muestra todas sus fotos.
- `npm run pentest -- https://www.emefotografiasevilla.com` sigue dando 61 correctas.

Hasta aquí todo es reversible sin tocar git.

### Paso 3. Quitarlas del árbol, no del historial

```bash
git rm -r --cached public/images public/videos
printf '\n# El material lo lleva rsync, no git (ver docs/PLAN-MEDIA-FUERA-DE-GIT.md)\npublic/images/\npublic/videos/\n' >> .gitignore
git commit -m "El material del estudio deja de viajar dentro del repositorio"
git push
```

Los ficheros siguen en el disco local y en el servidor. Lo que cambia es que dejan de entrar en
los commits nuevos. El clon sigue pesando 830 MB porque el historial no se ha tocado, pero a
partir de aquí ya no crece.

**Despliega otra vez y vuelve a comprobar la lista del paso 2.** Ahora el servidor depende de
verdad del rsync.

### Paso 4. Reescribir el historial

Este es el irreversible. No lo hagas el mismo día que el paso 3: deja pasar al menos una semana
de web publicada funcionando con el rsync.

```bash
pip install git-filter-repo
git clone https://github.com/escalartica/eme_fotografia.git eme-reescritura
cd eme-reescritura
git filter-repo --path public/images --path public/videos --invert-paths
git remote add origin https://github.com/escalartica/eme_fotografia.git
git push --force origin worktree-eme-fotografia-build
```

Lo que hay que saber antes de pulsar:

- **Todos los SHA cambian.** Cualquier clon anterior queda incompatible: hay que volver a clonar,
  incluido el del servidor y el del portátil. No intentes hacer `git pull` sobre uno viejo.
- **El clon del servidor.** `git fetch --depth 1` + `git reset --hard FETCH_HEAD` sigue
  funcionando después de un force-push porque baja la punta de la rama de cero. Aun así, lo
  limpio es volver a clonar en `/var/www/eme/app-nuevo`, hacer el rsync de `public/` y `.next/`
  ahí, y cambiar el enlace cuando arranque.
- **GitHub guarda los objetos sueltos un tiempo.** Para que el material deje de ser accesible de
  verdad por su SHA hay que pedirle a GitHub que recolecte la basura del repositorio (soporte).
  Mientras no lo hagan, el contenido antiguo sigue ahí para quien tenga el hash.
- **Quien ya haya clonado sigue teniéndolo.** Reescribir el historial no recupera lo que ya se
  ha repartido. Es una razón más para hacerlo pronto, no menos.

### Paso 5. Lo que se arrastra detrás

Una vez el repositorio es ligero, estas tres cosas dejan de tener excusa y van juntas:

1. **Renombrar la rama por defecto a `main`.** Producción clona
   `worktree-eme-fotografia-build` por su nombre exacto, así que el orden es: crear `main` desde
   ella, cambiar la rama por defecto en GitHub, actualizar el `--branch` de `DESPLIEGUE.md` §§7
   y 11, desplegar, comprobar, y solo entonces borrar la rama vieja.
2. **Añadir el trabajo de `next build` a la CI.** Ahora no está porque un build necesita
   `public/` entero, o sea el clon completo. Con el repositorio ligero, entra sin más.
3. **Quitar el sparse-checkout de `.github/workflows/ci.yml`**, que existe solo por esto.

## Cuánto queda después

```
.git                        ~12 MB
árbol de trabajo            ~9 MB de código + el material que traiga rsync
clon completo               segundos
```

## Lo que este plan NO hace

- **No toca la resolución ni la calidad de ninguna foto ni de ningún vídeo.** El material se
  mueve de sitio, no se reprocesa. Los entregables mantienen su calidad, que es un requisito del
  estudio y está también en `PENDIENTE.md`.
- **No cambia nada de lo que ve un visitante.** Las URLs de las imágenes son las mismas; lo único
  que cambia es cómo llegan al servidor.
- **No toca `data/`.** Las galerías privadas nunca han estado en git y no entran en esto.
