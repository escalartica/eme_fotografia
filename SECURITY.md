# Security Policy / Política de seguridad

## Reporting a vulnerability

Email **info@emefotografiasevilla.com** with `SECURITY` in the subject line. Please do not open
a public issue for anything that could expose client material.

Include what you can: the affected URL or file, the steps to reproduce, and what an attacker
would get. A proof of concept helps, but a clear description is enough to start.

You can expect a first reply within 5 working days. If you do not hear back, assume the mail
was lost and send it again rather than publishing.

### What is in scope

- `https://www.emefotografiasevilla.com` and its subdomains.
- The code in this repository: the admin panel, the client galleries, the API routes under
  `app/api/`, the auth modules in `lib/auth/`, the security headers in `next.config.mjs`.

### What is out of scope

- Anything requiring physical access to the studio's devices, or social engineering of its staff.
- Automated scanner output with no demonstrated impact.
- Missing headers on paths that serve no content and set no cookie.
- Denial of service through raw traffic volume.
- The clone size of this repository. It is known and documented in
  [docs/PLAN-MEDIA-FUERA-DE-GIT.md](docs/PLAN-MEDIA-FUERA-DE-GIT.md).

### Please do not

- Access, download or modify any real client gallery. If you find a way in, stop and report it.
- Run brute force against the login rate limiter beyond what is needed to show it fails.
- Send test mail through the contact form in volume.

### Before you report

Much of the obvious surface is already tested. Run the project's own harness first:

```bash
npm run pentest -- https://www.emefotografiasevilla.com
```

61 checks, all passing as of the last run against the published domain. If your finding is one
of those checks reporting a failure, say so, that is useful too.

---

## Cómo informar de una vulnerabilidad

Escribe a **info@emefotografiasevilla.com** con `SECURITY` en el asunto. No abras una issue
pública si lo que has encontrado puede exponer material de clientes.

Incluye lo que puedas: la URL o el fichero afectado, cómo reproducirlo y qué conseguiría quien
lo explotara. Una prueba de concepto ayuda, pero con una descripción clara basta para empezar.

Habrá una primera respuesta en 5 días laborables. Si no la recibes, da por hecho que el correo
se perdió y vuelve a enviarlo antes de publicar nada.

### Dentro del alcance

- `https://www.emefotografiasevilla.com` y sus subdominios.
- El código de este repositorio: el panel, las galerías de cliente, las rutas de `app/api/`, los
  módulos de `lib/auth/` y las cabeceras de `next.config.mjs`.

### Fuera del alcance

- Todo lo que requiera acceso físico a los equipos del estudio o engañar a su personal.
- Salida de un escáner automático sin impacto demostrado.
- Cabeceras que faltan en rutas que no sirven contenido ni ponen cookies.
- Denegación de servicio por volumen bruto de tráfico.
- El peso del clon de este repositorio. Está documentado en
  [docs/PLAN-MEDIA-FUERA-DE-GIT.md](docs/PLAN-MEDIA-FUERA-DE-GIT.md).

### Por favor, no

- No entres, descargues ni modifiques ninguna galería real de cliente. Si encuentras la forma,
  para e infórmalo.
- No castigues el limitador de intentos más allá de lo necesario para demostrar que falla.
- No envíes correo de prueba en volumen por el formulario de contacto.
