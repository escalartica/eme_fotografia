# Contributing / Cómo contribuir

**English below the Spanish text.**

---

## Español

Gracias por mirar el código. Antes de nada, una aclaración honesta sobre qué es este
repositorio: es la web en producción de un estudio real, no un proyecto comunitario. Las
decisiones de diseño, los textos y el material fotográfico los decide el estudio. Aun así, hay
mucho aquí que se puede mejorar y las aportaciones son bienvenidas.

### Qué encaja bien

- Correcciones de bugs, con un test que falle antes del arreglo.
- Mejoras de accesibilidad, sobre todo si vienen con la medición que las respalda.
- Mejoras de seguridad, o una comprobación nueva en `scripts/pentest.mjs`.
- Rendimiento, si traes el número de antes y el de después.
- Documentación: aclarar algo que te costó entender es una aportación de primera.
- Traducciones de la documentación pública.

### Qué probablemente no

- Cambios de diseño, de textos o de material fotográfico. Eso lo decide el estudio.
- Cambiar CSS Modules por un framework de utilidades, o los ficheros en disco por una base de
  datos. Ambas cosas están decididas y razonadas; el porqué está en el código y en `docs/`.
- Dependencias nuevas. El proyecto tiene nueve en producción y cada una está justificada. Si la
  tuya hace falta, explica en la PR por qué no se puede resolver con lo que ya hay.

### Antes de abrir una pull request

```bash
npm ci
npm test          # 687 tests, todos tienen que quedar en verde
npm run lint
npx next typegen && npx tsc --noEmit
npm run pentest   # si has tocado auth, cabeceras o rutas de API
```

### Estilo del proyecto

Está en [`CLAUDE.md`](CLAUDE.md) y se aplica también a las personas:

- Lee los ficheros antes de escribir. No adivines APIs, versiones ni nombres de paquetes.
- Comenta el **porqué**, no el qué. El código de este repositorio explica sus decisiones,
  incluidas las que se descartaron. Mantén esa costumbre.
- Sin emojis y sin rayas largas en el código ni en la documentación.
- Conciso.

### Mensajes de commit

En español, y dicen qué cambia para quien usa la web, no qué función se tocó. Del historial
real:

```
El teclado se cerraba con cada letra, y la barra de abajo se veía a través del visor
Un aviso por correo cada hora, no doscientos cuarenta cada diez minutos
El perro deja de abrir el carrete, y cuatro titulares que decían poco
```

No `fix: resolve keyboard focus bug`. Escribe lo que le pasaba a la persona.

### Un aviso sobre el peso

Un clon completo son unos 830 MB, porque las fotos y los vídeos están dentro de git. Para
trabajar solo en el código:

```bash
git clone --filter=blob:none --no-checkout https://github.com/escalartica/eme_fotografia.git
cd eme_fotografia
git sparse-checkout set --no-cone '/*' '!/public/images' '!/public/videos'
git checkout
```

El plan para arreglarlo de raíz está en [docs/PLAN-MEDIA-FUERA-DE-GIT.md](docs/PLAN-MEDIA-FUERA-DE-GIT.md).

---

## English

Thanks for looking at the code. One honest clarification first: this is a real studio's
production website, not a community project. Design decisions, copy and photographic material
are the studio's call. Plenty here can still be improved, and contributions are welcome.

### Good fits

- Bug fixes, with a test that fails before the fix.
- Accessibility improvements, especially with the measurement that backs them.
- Security improvements, or a new check in `scripts/pentest.mjs`.
- Performance, if you bring the before and after numbers.
- Documentation. Clarifying something that cost you time is a first-class contribution.
- Translations of the public documentation.

### Probably not

- Changes to design, copy or photographic material. That is the studio's call.
- Swapping CSS Modules for a utility framework, or the on-disk files for a database. Both are
  settled and reasoned; the why is in the code and in `docs/`.
- New dependencies. The project has nine in production and each one is justified. If yours is
  needed, explain in the PR why it cannot be done with what is already there.

### Before opening a pull request

```bash
npm ci
npm test          # 687 tests, all of them must stay green
npm run lint
npx next typegen && npx tsc --noEmit
npm run pentest   # if you touched auth, headers or API routes
```

### House style

It lives in [`CLAUDE.md`](CLAUDE.md) and applies to people too:

- Read files before writing. Do not guess APIs, versions or package names.
- Comment the **why**, not the what. This codebase explains its decisions, including the
  rejected ones. Keep that habit.
- No emoji and no em dashes, in code or documentation.
- Concise.

### Commit messages

Written in Spanish, and they say what changed for the person using the site, not which function
was touched. From the real history:

```
El teclado se cerraba con cada letra, y la barra de abajo se veía a través del visor
Un aviso por correo cada hora, no doscientos cuarenta cada diez minutos
El perro deja de abrir el carrete, y cuatro titulares que decían poco
```

Not `fix: resolve keyboard focus bug`. Write what was happening to the person.

### A note on size

A full clone is around 830 MB, because the photographs and video are tracked in git. To work on
the code alone:

```bash
git clone --filter=blob:none --no-checkout https://github.com/escalartica/eme_fotografia.git
cd eme_fotografia
git sparse-checkout set --no-cone '/*' '!/public/images' '!/public/videos'
git checkout
```

The plan to fix it properly is in [docs/PLAN-MEDIA-FUERA-DE-GIT.md](docs/PLAN-MEDIA-FUERA-DE-GIT.md).
