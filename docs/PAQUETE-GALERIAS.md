# Plan: extraer las galerías privadas como paquete

> **In English, in one paragraph.** The private client gallery is the only part of this project
> that solves a problem thousands of other photographers have, and the only part with a real
> chance of being used by strangers. This document is the plan to lift it out of this repository
> into a standalone, MIT-licensed package: what it would contain, what has to be decoupled
> first, and what it deliberately would not do. Nothing here is built yet.

Estado: **propuesta**. Nada de esto está hecho.

---

## Por qué este trozo y no otro

Un repositorio de web a medida no consigue estrellas por muy bueno que sea el README, porque
nadie tiene el problema que resuelve: nadie más necesita la web de Eme. Lo que sí tiene mucha
gente es este problema:

> Soy fotógrafo. Entrego doscientas fotos a una pareja. Necesito que las vean en privado, que me
> digan cuáles quieren, y que no acaben en Google.

Las opciones que hay hoy son SaaS de pago por galería (Pic-Time, Pixieset, CloudSpot) o montarlo
uno mismo. No hay una pieza pequeña, autoalojable y sin base de datos que haga solo eso. Este
proyecto ya la tiene funcionando en producción.

Lo demás que hay aquí es interesante de leer pero no reutilizable tal cual: la analítica sin
cookies compite con Plausible y Umami, que llevan años; el pentest está escrito contra las rutas
de esta web concreta.

## Qué contendría el paquete

Nombre de trabajo: **`galeria-privada`**. Un paquete para App Router de Next.js con cero
dependencias de runtime más allá de `sharp`.

```
galeria-privada/
  src/
    store.ts            galerías en disco: crear, leer, borrar, listar
    auth/
      password.ts       scrypt, formato versionado
      session.ts        tokens opacos, en disco solo el SHA-256
      rate-limit.ts     ventana deslizante con tope de claves vivas
      origin-check.ts
    photo-route.ts      el handler que sirve una foto revalidando la sesión
    derivatives.ts      copias reducidas con sharp, cacheadas
    selection.ts        me gusta y comentarios de la pareja
  ui/                   componentes sin estilos propios, opcionales
  cli/
    crear-galeria.ts    crear una galería desde la terminal
    hash.ts
```

Un fotógrafo con un Next.js monta la zona privada así:

```ts
// app/[slug]/photo/[filename]/route.ts
export { GET } from 'galeria-privada/photo-route';
```

```bash
npx galeria-privada nueva maria-y-juan ./fotos-boda
```

## Qué hay que desacoplar primero

Ninguna de estas es difícil. Todas son deuda de estar dentro de una web concreta.

| Acoplamiento | Dónde | Qué hacer |
|---|---|---|
| Rutas fijas bajo `process.cwd()/data` | `lib/gallery-store.ts`, `lib/auth/session.ts` | Un objeto de configuración con `dataRoot`, y que el paquete no decida dónde vive nada |
| Textos en español dentro de la lógica | `lib/analytics-store.ts` (`'móvil'`), mensajes de error, clases de dispositivo | Devolver identificadores (`mobile`, `tablet`, `desktop`) y dejar los textos fuera |
| Anchos fijos de miniatura | `lib/gallery-anchos.ts` | Que los ponga quien usa el paquete, manteniendo la validación de `?w=` |
| `@/` como alias de importación | Todo el paquete | Rutas relativas |
| El almacén de admin mezclado con el de cliente | `lib/admin-store.ts` y `lib/auth/session.ts` comparten el tipo `SessionRole` | El paquete solo debe saber de sesiones de cliente. Quien lo use pone su propio panel |
| Estilos en CSS Modules del proyecto | `app/[slug]/*.module.css` | Los componentes salen sin estilos, con clases que se puedan sustituir. O no salen: la parte que importa es el servidor |
| El limitador en memoria | `lib/auth/rate-limit.ts` | Se queda, pero documentado en el README del paquete como lo que es: válido para un proceso, e inservible detrás de un balanceador. Con un punto de extensión para enchufar Redis |

Los tests ya existen y se mueven con el código: `password.test.ts`, `session.test.ts`,
`rate-limit.test.ts`, `gallery-store.test.ts`, `gallery-credentials.test.ts` y el de la ruta de
fotos.

## Qué NO haría el paquete

Decirlo desde el principio evita la mitad de las issues:

- **No es un SaaS ni una aplicación completa.** No trae panel de administración, ni facturación,
  ni envío de correos, ni subida desde el navegador.
- **No tiene base de datos, ni la va a tener.** Carpetas en disco. Si alguien necesita Postgres,
  necesita otra cosa.
- **No escala horizontalmente.** Un proceso, un disco. Está escrito en la primera línea del
  README, no en una nota al pie.
- **No protege contra quien ya tiene la contraseña.** Una pareja puede compartir su enlace y su
  clave con quien quiera. Eso no es un fallo, es cómo funciona una galería de cliente.
- **No pone marcas de agua ni impide el clic derecho.** Si se puede ver, se puede guardar.

## Orden sugerido

1. Extraer `auth/` entero a un directorio nuevo dentro de este repositorio, con su configuración
   inyectada, y que esta web lo consuma desde ahí. Si la web sigue en verde con sus 687 tests,
   el desacoplamiento está bien hecho.
2. Lo mismo con `store.ts`, `derivatives.ts` y la ruta de fotos.
3. Sacarlo a su propio repositorio con el historial de esos ficheros
   (`git filter-repo --path ...`), no con un copiar y pegar: el historial es parte de lo que hace
   creíble al paquete.
4. README del paquete con un ejemplo mínimo que funcione en cinco minutos, y una demo pública con
   fotos de libre uso. **Nunca con fotos de clientes reales.**
5. Publicar en npm. Enlazarlo desde el README de aquí como el origen del código.

## Lo que hay que cuidar

- **El paquete no puede llevar ni una sola foto de un cliente real.** Ni en los tests, ni en la
  demo, ni en las capturas del README. Fotos de libre uso o generadas.
- **Ni la marca EME.** El paquete es código, y va con licencia MIT limpia, sin la reserva de
  derechos que este repositorio tiene sobre el material.
- **Un fallo de seguridad en el paquete es un fallo en la web de Eme.** Si esto se publica, el
  `SECURITY.md` del paquete apunta al mismo sitio y las actualizaciones se aplican aquí primero.
