<!--
Gracias por la aportación. El título de la PR sigue la misma norma que los commits de este
repositorio: dice qué cambia para quien usa la web, no qué función se tocó.

PR titles follow the same rule as this repository's commits: say what changed for the person
using the site, not which function was touched.
-->

## Qué cambia / What changes

<!-- Una o dos frases. Si arregla una issue, pon "Cierra #N". -->

## Por qué / Why

<!-- El problema que había. Si hay una decisión discutible, explícala aquí y no solo en el código. -->

## Qué se descartó / What was ruled out

<!-- Opcional, pero es la parte más útil de una PR en este repositorio. -->

## Comprobado / Verified

- [ ] `npm test` en verde (687 tests)
- [ ] `npm run lint` sin errores
- [ ] `npx next typegen && npx tsc --noEmit` limpio
- [ ] `npm run pentest` si toca auth, cabeceras o rutas de `app/api/`
- [ ] Revisado a 375 px de ancho si cambia algo visible
- [ ] Probado con `prefers-reduced-motion: reduce` si toca movimiento

## Notas

- [ ] No añade dependencias nuevas, o explico arriba por qué hace falta
- [ ] No mete ficheros de imagen ni de vídeo en git
- [ ] No incluye credenciales, claves ni datos de clientes
