# Despliegue de emefotografiasevilla.com

Guía operativa. Todo lo que hay aquí está comprobado contra el código de este
repositorio, no contra la documentación genérica de Next.js.

---

## 0. Tu situación en IONOS (septiembre 2026)

Lo contratado hoy, contrato **97181010**:

| | |
|---|---|
| **WordPress Hosting Expand** | alta 20/07/2023, renueva 31/08/2027 |
| Espacio web | 2,10 GB de 49 GB · MariaDB 10.6 · **PHP 8.0 administrado** |
| `emefotografiasevilla.com` | dominio adicional, renueva 01/09/2027 |
| `emebodas.com` | dominio adicional, **caduca 20/07/2027 sin renovación automática** |
| Correo | 3 buzones (`info@`, `contratos@`, `design@`), Correo Básico 3 de 5 |
| Certificado SSL | 1 disponible, 0 en uso |
| Proyecto WordPress | `bodas-zxuvb4ihmc.live-website.com`, sin dominio vinculado |

**El WordPress Hosting Expand no sirve para esta web.** Es alojamiento WordPress
administrado: PHP y MariaDB, sin runtime de Node. El acceso SFTP/SSH que aparece
en el panel es para gestionar ficheros y ejecutar WP-CLI, no para dejar un
proceso Node escuchando en un puerto con un proxy delante. Sirve el §1 entero.

**Lo que hay que añadir:** un VPS. Con los requisitos del §1 (2 vCPU, 4 GB,
40 GB) el que encaja es el **VPS M** de IONOS — 4 vCPU, 4 GB, 120 GB NVMe,
Ubuntu y acceso root. Ronda los 5-10 €/mes según promoción y permanencia;
mirar el precio del día en ionos.es.

**Lo que NO hay que tocar ni cancelar:**

- **Los dos dominios.** Están registrados en IONOS y ahí se quedan. Solo se
  cambian sus registros `A` para que apunten al VPS (§8). No hace falta
  transferirlos.
- **El contrato de hosting**, porque los tres buzones cuelgan de él y está
  pagado hasta el 31/08/2027. Confirmar con IONOS que el correo va dentro de
  ese contrato **antes** de cancelar nada.
- **Los registros MX** del dominio. El correo lo sigue sirviendo IONOS: se
  cambian los `A`, y los `MX` se dejan exactamente como están. Tocarlos deja
  al estudio sin correo.

### Orden del cambio

El proyecto WordPress está en un dominio del sistema y **no tiene el dominio
vinculado**, así que ahora mismo `emefotografiasevilla.com` no sirve nada
público. No hay web viva que romper: el cambio es limpio.

1. Dos arreglos que no dependen de nada y conviene hacer ya:
   - **Activar la renovación automática de `emebodas.com`.** Caduca el
     20/07/2027 y hoy no se renueva solo. Un dominio que expira lo puede
     registrar cualquiera al día siguiente.
   - **Activar la Protección de dominio** en los dos. Aparece como artículo
     contratado en el 97181010 (01/09/2026 → 02/09/2027) y en la lista de
     dominios sale «Desactivada»: está pagada y sin usar.
2. Contratar el VPS M con Ubuntu 24.04 y desplegar (§2 a §7), comprobando por
   la IP antes de tocar el DNS.
3. Apuntar los registros `A` de `@` y `www` a la IP del VPS (§8).
4. Cuando el DNS haya propagado, lanzar certbot (§7).
5. Pasar la lista del §12.
6. Solo entonces, borrar el proyecto WordPress. Corre sobre **PHP 8.0, que
   lleva sin soporte de seguridad desde finales de 2023**; mantenerlo en pie
   una vez que no sirve nada es superficie de ataque a cambio de nada.

### Sobre el certificado SSL que ya tienes

Hay uno sin usar en la cuenta, pero en el VPS la guía usa **Let's Encrypt con
certbot**: es gratis, se instala en un comando y se renueva solo. El de IONOS
habría que instalarlo y renovarlo a mano cada año. Déjalo para otra cosa.

### La alternativa, y por qué no la recomiendo aquí

Vercel ejecutaría esta web sin cambiar una línea de código y su plan gratuito
da de sobra para el tráfico de un estudio. El problema es `data/`: en Vercel el
disco no persiste entre despliegues, así que las galerías privadas, los
mensajes de contacto y las sesiones habría que reescribirlos contra
almacenamiento externo (Blob + una base de datos). Es trabajo de varios días
sobre código que ya está terminado y auditado. En un VPS no hay que cambiar
nada.

---

## 1. Qué hosting hace falta (y cuál no vale)

Esta web **no se puede exportar como sitio estático**. Cuatro cosas lo impiden,
y ninguna es opcional:

| Lo que hace la web | Dónde está | Por qué necesita servidor |
|---|---|---|
| Panel de administración y galerías privadas | `app/admin/`, `app/[slug]/` | Lee la cookie de sesión en el servidor antes de pintar nada |
| Rutas de API | `app/api/**` | Login, logout, formulario de contacto, selección del cliente |
| Escritura en disco | `data/` | Mensajes, galerías, sesiones, estadísticas |
| Optimizador de imágenes | `next.config.mjs` → `images.formats` | Convierte a AVIF/WebP al vuelo con `sharp` |

De la oferta de IONOS:

- **Deploy Now — NO.** No ejecuta Node.js en el runtime; solo sirve ficheros
  estáticos ya generados. Sin export estático, no hay nada que servir.
- **Hosting Web / Alojamiento Web — NO.** Es PHP y MySQL. No hay proceso Node.
- **VPS o Cloud Server — SÍ.** Es un servidor Linux completo: se instala Node,
  se levanta el proceso y se pone un nginx delante.

**Mínimo recomendado:** 2 vCPU, 4 GB de RAM, 40 GB de disco, Ubuntu 24.04 LTS.

Los 4 GB son por el `next build`: con 2 GB el build se queda sin memoria a
mitad. Si el plan contratado tiene menos, se compila en el Mac y se sube el
resultado (ver §8). Los 40 GB son porque `public/` ya pesa 577 MB y el
repositorio con su historia otros 341 MB.

> **Alternativa sin administrar servidor:** Vercel ejecuta esta web tal cual,
> sin tocar una línea, y el plan gratuito da para el tráfico de un estudio.
> El único punto a resolver es `data/`: en Vercel el disco no persiste entre
> despliegues, así que las galerías privadas y los mensajes habría que moverlos
> a almacenamiento externo. **En un VPS no hay que cambiar nada.**

---

## 2. Preparar el servidor

Conectado por SSH como root:

```bash
# Node 22 LTS. Next 16 exige >= 20.9; el proyecto se desarrolla y compila
# en Node 22, o sea que el servidor lleva la misma y no hay sorpresas.
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt-get install -y nodejs nginx git

# Usuario sin privilegios para el proceso web. NUNCA ejecutar Next como root.
adduser --system --group --home /var/www/eme eme
```

## 3. Traer el código

```bash
sudo -u eme -H bash
cd /var/www/eme
git clone https://github.com/escalartica/eme_fotografia.git app
cd app
git checkout worktree-eme-fotografia-build   # o main, cuando esté fusionado
npm ci --omit=dev
```

`npm ci`, no `npm install`: instala exactamente lo que dice `package-lock.json`.
`--omit=dev` deja fuera vitest y compañía, que en el servidor no pintan nada.

## 4. Variables de entorno

Copiar `.env.example` a `.env.production.local` y rellenarlo. Los cuatro
valores que no pueden quedarse vacíos:

```bash
NEXT_PUBLIC_SITE_URL=https://www.emefotografiasevilla.com
ADMIN_USERNAME=...
ADMIN_PASSWORD_HASH=...
RESEND_API_KEY=...
```

El hash del panel se genera **en el Mac**, no en el servidor, y se pega aquí:

```bash
node scripts/hash-admin-password.mjs 'la contraseña que elijas'
```

Así la contraseña en claro no llega a existir en el servidor. El fichero debe
quedar ilegible para el resto de cuentas de la máquina:

```bash
chmod 600 .env.production.local
```

`instrumentation.ts` comprueba esto al arrancar: si el panel está mal
configurado, **el servidor no se levanta**. Es deliberado — un panel mal
configurado no debe quedarse en pie fingiendo que todo va bien.

## 5. Compilar

```bash
npm run build
```

## 6. Dejarlo levantado (systemd)

Como root, `/etc/systemd/system/eme.service`:

```ini
[Unit]
Description=EME Fotografia Sevilla
After=network.target

[Service]
Type=simple
User=eme
Group=eme
WorkingDirectory=/var/www/eme/app
Environment=NODE_ENV=production
Environment=PORT=3000
ExecStart=/usr/bin/npm run start
Restart=always
RestartSec=5

# La web escribe en data/ y en ningún otro sitio.
ProtectSystem=strict
ReadWritePaths=/var/www/eme/app/data /var/www/eme/app/.next
PrivateTmp=true
NoNewPrivileges=true

[Install]
WantedBy=multi-user.target
```

`WorkingDirectory` es obligatorio y tiene que ser exactamente ese: el código
resuelve `data/` contra el directorio de trabajo del proceso. Si se arranca
desde otro sitio, la web crea un `data/` vacío allí y las galerías "desaparecen".

```bash
systemctl daemon-reload && systemctl enable --now eme
systemctl status eme
```

## 7. nginx y certificado

`/etc/nginx/sites-available/eme`:

```nginx
server {
    listen 80;
    server_name emefotografiasevilla.com www.emefotografiasevilla.com;

    # Las fotos de boda pesan. Sin esto, subir una galería da un 413.
    client_max_body_size 64M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade           $http_upgrade;
        proxy_set_header Connection        'upgrade';
    }
}
```

`X-Forwarded-Proto` no es decorativo: sin él Next cree que la petición llegó por
HTTP y las cookies de sesión se emiten sin el atributo `Secure`.

**No añadir cabeceras de seguridad aquí.** Las emite `next.config.mjs` (CSP,
HSTS, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, y `no-store`
en `/admin/*` y `/api/*`). Duplicarlas en nginx no suma: el navegador aplica la
CSP **más restrictiva** de las dos, y la de nginx acabaría rompiendo la web.

```bash
ln -s /etc/nginx/sites-available/eme /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

apt-get install -y certbot python3-certbot-nginx
certbot --nginx -d emefotografiasevilla.com -d www.emefotografiasevilla.com
```

Certbot renueva solo. El HSTS de `next.config.mjs` obliga al navegador a usar
HTTPS durante meses: **el certificado tiene que estar puesto antes de anunciar
el dominio**, porque si caduca la web deja de ser alcanzable para quien ya la
visitó, no simplemente insegura.

## 8. DNS

En el panel de dominios de IONOS, dos registros `A` a la IP del servidor:

| Nombre | Tipo | Valor |
|---|---|---|
| `@` | A | IP del VPS |
| `www` | A | IP del VPS |

El `.es`, cuando se compre, apunta a la misma IP: `next.config.mjs` ya lo
redirige con un 308 al `.com` conservando la ruta. Ese 308 es permanente y los
navegadores lo cachean con ganas — si algún día se le da la vuelta al par de
dominios, hay que cambiar el código **antes** de mover el DNS.

Para Resend hay que añadir además los registros que te dé su panel (SPF, DKIM y
DMARC del dominio) o los correos del formulario acabarán en spam.

## 9. Compilar en el Mac (si el servidor tiene poca RAM)

```bash
npm run build
rsync -az --delete .next/ eme@IP:/var/www/eme/app/.next/
ssh root@IP 'systemctl restart eme'
```

Tiene que compilarse con la **misma versión de Node** que corre en el servidor.

## 10. Copias de seguridad

`data/` es lo único irrecuperable de toda la máquina: los mensajes de las
parejas, las galerías privadas y las selecciones que han enviado. No está en
git (y no debe estarlo). `public/` sí está en git; el código también.

```bash
# /etc/cron.daily/eme-backup
tar czf /var/backups/eme-data-$(date +%F).tar.gz -C /var/www/eme/app data
find /var/backups -name 'eme-data-*.tar.gz' -mtime +30 -delete
```

Y sacar esa carpeta de la máquina periódicamente. Una copia que vive en el
mismo servidor que los datos no es una copia.

`data/galleries/*/derivados/` se puede borrar entera en caliente: es una caché
de miniaturas y se regenera sola con la siguiente visita.

## 11. Actualizar la web

```bash
sudo -u eme -H bash -c 'cd /var/www/eme/app && git pull && npm ci --omit=dev && npm run build'
systemctl restart eme
```

Hay unos segundos de corte al reiniciar. Para un estudio es asumible; si algún
día molesta, se levantan dos procesos en puertos distintos y se alterna cuál
recibe el tráfico desde nginx.

## 12. Comprobar que ha salido bien

```bash
curl -sI https://www.emefotografiasevilla.com | head -20
curl -s  https://www.emefotografiasevilla.com/robots.txt
curl -sI https://emefotografiasevilla.com | grep -i location   # 308 al www
```

Y a mano, en el navegador:

- [ ] `/admin` pide contraseña y entra con la del hosting
- [ ] `/admin/galerias/nueva` crea una galería y sube una foto
- [ ] La galería se abre con usuario y contraseña, y **no** sin ellos
- [ ] El formulario de `/contacto` llega a los dos buzones del estudio
- [ ] El banner de cookies aparece y "Rechazar" no carga Analytics
- [ ] Modo oscuro y modo claro en móvil
- [ ] `npm run pentest -- https://www.emefotografiasevilla.com` desde el Mac

## 13. Lo que queda fuera de esta guía

- **Correo del dominio.** Los buzones `info@` y `contratos@` los sirve IONOS,
  no el servidor. El VPS solo manda a través de Resend.
- **Contraseñas.** Ni las de IONOS ni la de Resend pasan por el repositorio ni
  por el chat: se pegan directamente en el servidor.
