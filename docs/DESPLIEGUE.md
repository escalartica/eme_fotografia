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
40 GB) el que encaja exactamente es el **VPS Linux M+** de IONOS: 4 vCPU, 4 GB
de RAM, 120 GB NVMe, tráfico ilimitado, Ubuntu y acceso root.

Precio a fecha de septiembre de 2026, **sin IVA**: 3 €/mes los tres primeros
meses, **9 €/mes después**, más 10 € de alta. Con el 21% son unos **10,90 €/mes**
reales. Hay 30 días de prueba gratis, que dan de sobra para montarlo y
comprobarlo antes de pagar nada.

El siguiente escalón, **L+** (6 vCPU, 8 GB, 240 GB), cuesta 18 €/mes sin IVA:
el doble por recursos que esta web no usa. El sitio son 56 rutas y unos cientos
de visitas al mes; el cuello de botella nunca va a ser la CPU.

Las copias de seguridad de IONOS (Acronis) van aparte, a 0,05 €/GB al mes sin
IVA. Son una alternativa al tar del §10, no un sustituto: lo que hay que
proteger de verdad es `data/`, y ésa es una carpeta pequeña.

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
resultado (ver §9). Con 4 GB justos, añadir swap (§2).

**El disco es lo único que crece.** El código, `public/` y el repositorio suman
unos 4 GB y ahí se quedan. Lo que sube es `data/galleries/`: cada galería
privada son las fotos originales de una boda más sus copias reducidas, entre 1
y 2 GB. Con 120 GB caben del orden de setenta bodas, y una galería se puede
borrar desde el panel en cuanto la pareja ha enviado su selección. Vigilar con
`df -h` una vez al año.

> **Alternativa sin administrar servidor:** Vercel ejecuta esta web tal cual,
> sin tocar una línea, y el plan gratuito da para el tráfico de un estudio.
> El único punto a resolver es `data/`: en Vercel el disco no persiste entre
> despliegues, así que las galerías privadas y los mensajes habría que moverlos
> a almacenamiento externo. **En un VPS no hay que cambiar nada.**

---

## 2. Preparar el servidor

Conectado por SSH como root:

**Al crear el VPS, elegir Ubuntu**, no AlmaLinux ni Rocky: el configurador de
IONOS viene con «Alma 9 (latest)» puesto por defecto y todos los comandos de
esta guía son de Debian/Ubuntu. Ubicación del centro de datos: **UE**.

Lo primero, **espacio de intercambio**. Es el fallo clásico de una máquina de
4 GB: `next build` se come casi toda la memoria y, si además está el servidor
corriendo, el kernel mata la compilación a la mitad con un mensaje que no
explica nada. Cuatro gigas de swap lo evitan y cuestan cuatro líneas:

```bash
fallocate -l 4G /swapfile && chmod 600 /swapfile
mkswap /swapfile && swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
free -h   # debe mostrar 4,0Gi en la fila Swap
```

```bash
# Node 22 LTS. Next 16 exige >= 20.9; el proyecto se desarrolla y compila
# en Node 22, o sea que el servidor lleva la misma y no hay sorpresas.
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt-get install -y nodejs nginx git

# Usuario sin privilegios para el proceso web. NUNCA ejecutar Next como root.
adduser --system --group --home /var/www/eme eme
```


## 2 bis. Cerrar el servidor antes de poner nada dentro

Un VPS recién creado tiene una IP pública y acepta entrar por contraseña. Los
escaneos automáticos lo encuentran en cuestión de horas y empiezan a probar
contraseñas de root a miles por minuto. Esto se hace **antes** de subir el
código, no después.

### Clave SSH en vez de contraseña

**En el Mac**, si no tienes clave todavía:

```bash
ssh-keygen -t ed25519 -f ~/.ssh/eme -C "eme" -N ""
ssh-copy-id -i ~/.ssh/eme.pub root@IP_DEL_SERVIDOR   # la contraseña de root, una única vez
```

El `-N ""` fija «sin frase de paso» y hace que no pregunte nada. Es deliberado,
y va contra el consejo de manual. La primera vez se hizo con frase de paso y
pasó lo siguiente: `ssh-keygen` pregunta la ruta y, si en vez de pulsar Enter se
escribe un nombre, deja la clave en el directorio actual --que era el
repositorio--; y la frase de paso se olvidó a los diez minutos, dejando una
clave válida e inservible en el servidor. Una frase que no se recuerda no
protege: deja fuera. El fichero queda en `~/.ssh` con permisos 600, dentro de un
Mac con su propia contraseña y el disco cifrado.

**EL SERVIDOR CONCEDE DOS MINUTOS** para completar el acceso (`LoginGraceTime`).
Buscar la contraseña de root mientras el reloj corre acaba en
`Connection closed by <IP> port 22`, sin ninguna explicación y sin que sea un
rechazo. Hay que tener la contraseña copiada en el portapapeles ANTES de lanzar
`ssh-copy-id`, y pegarla de golpe.

Tres contraseñas distintas que conviene no cruzar: la de la cuenta de IONOS
(entrar en ionos.es), la de root (entrar en esta máquina; sale del panel, en
«Contraseña inicial → Mostrar contraseña», y se puede restablecer desde ahí), y
la del panel de la web, que se crea en el §4.

Un atajo que ahorra errores, en `~/.ssh/config` del Mac:

```
Host eme
  HostName IP_DEL_SERVIDOR
  User root
  IdentityFile ~/.ssh/eme
  IdentitiesOnly yes
```

A partir de ahí se entra con `ssh eme`.

**Y SIEMPRE CON `ssh eme`, NUNCA CON `ssh root@LA_IP`.** No son lo mismo: el
bloque de arriba lleva `IdentitiesOnly yes`, que significa «para este host,
ofrece ESTA clave y ninguna otra», y ese bloque solo se aplica cuando se
escribe el nombre `eme`. Con la IP a pelo, SSH no encuentra ninguna clave que
ofrecer --si no hay una `id_ed25519` o `id_rsa`, que aquí no la hay-- y
responde `Permission denied (publickey)`, que parece un problema del servidor
y no lo es. Costó un despliegue entero el 13/09/2026.

Ahora, **sin cerrar esa sesión**, abre una segunda terminal y comprueba que
entras sin contraseña:

```bash
ssh eme
```

Solo cuando la segunda entre sola, en el servidor:

```bash
cat > /etc/ssh/sshd_config.d/01-eme-hardening.conf <<'EOF'
PasswordAuthentication no
KbdInteractiveAuthentication no
PermitRootLogin prohibit-password
EOF
sshd -t && systemctl restart ssh          # -t valida ANTES de reiniciar
sshd -T | grep -E "^(passwordauthentication|permitrootlogin)"
```

**En un fichero propio, y con el prefijo `01`.** La imagen de IONOS trae dos
ficheros que se contradicen:

```
/etc/ssh/sshd_config.d/50-cloud-init.conf:        PasswordAuthentication yes
/etc/ssh/sshd_config.d/60-cloudimg-settings.conf: PasswordAuthentication no
```

En SSH **gana el primer valor que se lee**, y `50` va antes que `60`, así que
manda el `yes`. Un fichero `01` se lee antes que los dos y gana sin tocar
ninguno, que importa porque `cloud-init` reescribe los suyos por su cuenta.

`sshd -T` no lee ficheros: le pregunta a SSH qué está aplicando de verdad. Debe
responder `passwordauthentication no` y `permitrootlogin without-password`
--este último es el nombre antiguo de `prohibit-password`, lo mismo.

El orden importa y la sesión abierta es el seguro: si te equivocas al copiar la
clave y ya has desactivado la contraseña, te quedas fuera de tu propio servidor
y hay que reinstalarlo entero desde el panel de IONOS. Mientras la primera
sesión siga abierta, siempre puedes deshacerlo.

### Cortafuegos

Tres puertos y ni uno más. El 3000 **no** se abre: a Next se llega por el
nginx del §7, nunca desde fuera.

```bash
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
ufw status verbose        # comprobar que 22, 80 y 443 son los únicos
```

Los puertos a mano, no `ufw allow 'Nginx Full'`: ese perfil lo instala nginx, y
aquí nginx todavía no está.

**El orden no es negociable.** Abrir el 22 ANTES de activar el cortafuegos. Al
revés, la sesión se corta en el acto y hay que entrar por la consola web del
panel de IONOS.

### Lo que se mantiene solo

```bash
apt-get install -y fail2ban
systemctl enable --now fail2ban
fail2ban-client status        # debe listar la jaula "sshd"

cat > /etc/apt/apt.conf.d/20auto-upgrades <<'EOF'
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Unattended-Upgrade "1";
EOF
```

Y las actualizaciones pendientes, **antes de instalar nada encima**:

```bash
apt-get update
DEBIAN_FRONTEND=noninteractive apt-get full-upgrade -y
ls /var/run/reboot-required >/dev/null 2>&1 && reboot
```

`full-upgrade`, no `upgrade`: el segundo deja fuera («kept back») los paquetes
que arrastran dependencias nuevas, y un kernel nuevo siempre las arrastra. O
sea que `upgrade` se salta justo los parches de kernel. Con el servidor todavía
vacío, reiniciar no cuesta nada; dentro de un mes, con la web publicada, sí.

Al volver del reinicio conviene comprobar que todo persiste solo -- si algo se
configuró sin persistencia, se ve aquí y no dentro de tres meses en el peor
momento:

```bash
ufw status | head -2; systemctl is-active fail2ban; swapon --show
```

`fail2ban` bloquea la IP que falla varias veces seguidas al entrar;
`unattended-upgrades` instala los parches de seguridad de Ubuntu sin que nadie
se acuerde de hacerlo. Los dos existen precisamente porque un servidor de un
estudio pequeño no tiene a nadie mirándolo a diario.

## 3. Traer el código

```bash
sudo -u eme -H git clone --depth 1 --branch worktree-eme-fotografia-build \
  https://github.com/escalartica/eme_fotografia.git /var/www/eme/app
cd /var/www/eme/app
sudo -u eme -H npm ci
```

Todo con `sudo -u eme`, incluido el clonado y el `npm`. Compilar como root deja
`.next` y `node_modules` siendo de root, y luego el servicio --que corre como
`eme`-- arranca y falla a medias. Es uno de los fallos que más se tarda en
diagnosticar.

`--depth 1`: solo la versión actual, no los 130 commits de historia. Unos
575 MB en vez de 811, y al servidor la historia no le sirve de nada; para eso
está GitHub. (Para actualizar después, ver §11: con un clon superficial no vale
`git pull` a secas.)

**`npm ci` COMPLETO, sin `--omit=dev`.** Aquí decía `--omit=dev` y el build
fallaba: `typescript`, `eslint` y los `@types` son devDependencies, y
`next build` los necesita porque comprueba los tipos y pasa el linter. Las de
desarrollo se quitan DESPUÉS de compilar (§5).

## 4. Variables de entorno

Copiar `.env.example` a `.env.production.local` y rellenarlo. Los cuatro
valores que no pueden quedarse vacíos:

```bash
NEXT_PUBLIC_SITE_URL=https://www.emefotografiasevilla.com
ADMIN_USERNAME=...
ADMIN_PASSWORD_HASH=...
SMTP_HOST=smtp.ionos.es
SMTP_PORT=465
SMTP_USER=info@emefotografiasevilla.com
SMTP_PASS=...
CONTACT_TO=info@emefotografiasevilla.com
CONTACT_FROM="EME Fotografía Sevilla <info@emefotografiasevilla.com>"
```

El hash del panel se genera **pidiendo la contraseña UNA sola vez** y usándola
para generar y verificar en el mismo paso. Dos lecturas a ciegas de una frase
larga divergen --pasó: dos hashes distintos en el fichero y ninguna certeza de
cuál contraseña quedaba activa:

```bash
cd /var/www/eme/app
read -rsp 'Contraseña del panel (12 caracteres o más): ' P; echo
if [ ${#P} -ge 12 ]; then
  sed -i '/^ADMIN_PASSWORD_HASH=/d' .env.production.local
  node scripts/hash-admin-password.mjs "$P" >> .env.production.local
  node -e '
  const c = require("node:crypto"), fs = require("node:fs");
  const l = fs.readFileSync(".env.production.local","utf8").split("\n")
    .find(x => x.startsWith("ADMIN_PASSWORD_HASH="));
  const [, salt, hash] = l.slice(20).split(":");
  const d = c.scryptSync(process.argv[1], Buffer.from(salt,"hex"), 64, {N:16384,r:8,p:1}).toString("hex");
  console.log(d === hash ? "COINCIDE" : "NO COINCIDE");
  ' "$P"
else echo "DEMASIADO CORTA, no se ha tocado nada"; fi
unset P
```

Esa verificación hace la misma cuenta que hará el servidor al recibir un intento
de acceso: `COINCIDE` demuestra que el panel aceptará esa contraseña, antes de
que la web exista. `read -rsp` además no deja la contraseña en el historial.

**Escribir la contraseña en el gestor ANTES de teclearla**, y pegarla con ⌘V.
Teclear a ciegas una frase de veinte caracteres falla; pegar, no.

Y que el usuario NO sea `admin`: los escaneos automáticos lo prueban primero,
siempre. Con otro nombre fallan en el usuario y `fail2ban` los echa.

El fichero debe quedar ilegible para el resto de cuentas de la máquina:

```bash
chown eme:eme .env.production.local && chmod 600 .env.production.local
```

`instrumentation.ts` comprueba esto al arrancar: si el panel está mal
configurado, **el servidor no se levanta**. Es deliberado — un panel mal
configurado no debe quedarse en pie fingiendo que todo va bien.

## 5. Compilar

```bash
npm run build
npm prune --omit=dev
```

El `prune` va DESPUÉS y no antes: `next build` comprueba los tipos y pasa el
linter, o sea que necesita `typescript`, `eslint` y los `@types`, que son
dependencias de desarrollo (§3). Una vez compilado ya no hacen falta, y
quitarlas deja `node_modules` en algo más de un tercio.

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
ExecStart=/var/www/eme/app/node_modules/.bin/next start -p 3000
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

`ExecStart` llama a `next` directamente y no a `npm run start`: un proceso
menos, y `npm` quiere escribir su caché en el directorio personal, que con
`ProtectSystem=strict` es de solo lectura y da avisos sin motivo.

`ReadWritePaths` exige que las rutas **ya existan**, o el servicio no arranca:

```bash
sudo -u eme -H mkdir -p /var/www/eme/app/data
systemctl daemon-reload && systemctl enable --now eme
sleep 4 && systemctl status eme --no-pager | head -14
curl -sI http://127.0.0.1:3000 | head -3      # debe dar 200
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
ssh eme 'systemctl restart eme'
```

Tiene que compilarse con la **misma versión de Node** que corre en el servidor.

## 10. Copias de seguridad

`data/` es lo único irrecuperable de toda la máquina: los mensajes de las
parejas, las galerías privadas y las selecciones que han enviado. No está en
git (y no debe estarlo). `public/` sí está en git; el código también.

```bash
#!/bin/sh
# /etc/cron.daily/eme-backup

# UMASK 077, Y ES LA LÍNEA MÁS IMPORTANTE DEL BLOQUE. Esto corre como root con
# el umask por defecto (022), así que el tar salía en 0644: legible por
# CUALQUIER cuenta de la máquina. Y dentro va todo lo que el código se cuida
# de escribir en 0600 -- los hashes de contraseña de cada galería, las fotos de
# las bodas, los datos personales de las parejas y las sesiones abiertas. Una
# sola línea deshacía ese trabajo entero.
umask 077

# Sin los derivados: son miniaturas regenerables y son lo que más pesa.
tar czf /var/backups/eme-data-$(date +%F).tar.gz \
  --exclude='derivados' \
  -C /var/www/eme/app data
find /var/backups -name 'eme-data-*.tar.gz' -mtime +30 -delete
```

Comprobar después de la primera ejecución que el fichero sale en `600`:

```bash
ls -l /var/backups/eme-data-*.tar.gz
```

Y sacar esa carpeta de la máquina periódicamente. Una copia que vive en el
mismo servidor que los datos no es una copia.

`data/galleries/*/derivados/` se puede borrar entera en caliente: es una caché
de miniaturas y se regenera sola con la siguiente visita.

## 10 bis. Si el estudio olvida la contraseña del panel

**Lo normal es que no haga falta esto.** Desde la propia pantalla de acceso hay
un «¿Has olvidado la contraseña?» que manda un enlace a `ADMIN_EMAIL` (por
defecto, `CONTACT_TO`), caduca a la media hora, sirve una sola vez y al usarlo
cierra todas las sesiones abiertas. Eso lo resuelve ella sola y sin llamar a
nadie, que es justo el objetivo.

Este apartado es para cuando ese camino no está disponible: porque el correo
de salida se ha caído, porque nadie tiene acceso al buzón, o porque hay que
dejar la cuenta en un estado conocido.

```bash
# 1. Generar el hash de la contraseña nueva. Se teclea sin que se vea y sin
#    que quede en el historial de la terminal.
cd /var/www/eme/app
read -rsp 'Contraseña nueva (mínimo 12 caracteres): ' NUEVA; echo
NUEVA="$NUEVA" sudo -u eme -H -E node scripts/hash-admin-password.mjs "$NUEVA"
unset NUEVA
```

Eso imprime una línea `ADMIN_PASSWORD_HASH=scrypt:...`. Hay que sustituir con
ella la que ya está en `.env.production.local` -- **sustituir, no añadir**: dos
líneas con la misma clave es la avería que ya costó una noche.

```bash
# 2. Y BORRAR LA CONTRASEÑA GUARDADA DESDE EL PANEL, si la hay. Manda sobre la
#    variable de entorno, así que sin este paso el cambio de arriba no tiene
#    ningún efecto y parece que el hash está mal.
rm -f /var/www/eme/app/data/admin/password.json
rm -f /var/www/eme/app/data/admin/reset.json

# 3. Reiniciar para que el proceso olvide el hash que tenía en memoria.
systemctl restart eme
```

## 11. Actualizar la web

Desde el Mac, de una sola vez (ver §4 sobre por qué `ssh eme` y no la IP):

```bash
ssh eme 'bash -s' << 'REMOTO'
sudo -u eme -H bash -c 'cd /var/www/eme/app \
  && git fetch --depth 1 origin worktree-eme-fotografia-build \
  && git reset --hard FETCH_HEAD \
  && npm ci \
  && npm run build \
  && npm prune --omit=dev' \
  && systemctl restart eme && echo "--- LISTO ---"
REMOTO
```

**Dos cosas de este bloque que aquí estaban mal escritas y rompen el
despliegue si se copian:**

1. **`git fetch --depth 1` + `reset --hard`, no `git pull`.** El clon del
   servidor es superficial (§3): no tiene historia con la que fusionar, y
   `git pull` a secas se queja o se trae los 130 commits que precisamente se
   evitaron. `reset --hard FETCH_HEAD` deja el árbol exactamente en lo que hay
   en GitHub, que es lo que se quiere en un servidor -- allí nadie edita nada.
2. **`npm ci` COMPLETO y el `prune` al final.** Aquí ponía `npm ci --omit=dev`
   y el build falla, por lo mismo que explica §3: `next build` necesita
   `typescript` y `eslint`.

Y el orden importa: si el `build` falla, el `systemctl restart` NO llega a
ejecutarse (van encadenados con `&&` dentro del `bash -c`, y el `restart` está
fuera), así que el proceso viejo sigue sirviendo la versión anterior en vez de
dejar la web caída. Es la red de seguridad de este despliegue: comprobar
siempre que el bloque de arriba terminó sin error antes de reiniciar.

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


## 12 bis. La revisión del día después

El §12 comprueba que la web responde. Esto comprueba que está **bien**. Son
cosas que solo se pueden medir contra el dominio publicado: hasta que existe,
no hay nada que mirar.

### Lo primero, el pentest completo

```bash
npm run pentest -- https://www.emefotografiasevilla.com
```

Las 55 comprobaciones otra vez, pero ahora contra el servidor de verdad, más
las cuatro que en desarrollo quedaban pendientes: la CSP, el HSTS y las dos
cabeceras de caché del panel. **Esta pasada es la que cuenta.** Las otras eran
un ensayo.

### Herramientas externas, una vez cada una

Ninguna hace falta para que la web funcione. Hacen falta para saber si está a
la altura, que es otra cosa.

| Qué | Dónde | Qué pilla |
|---|---|---|
| Configuración TLS | ssllabs.com/ssltest | Protocolos viejos, cadena de certificados incompleta. Objetivo: **A** |
| Cabeceras | securityheaders.com | Lo mismo que el pentest, con otros ojos |
| Rendimiento real | PageSpeed Insights | Core Web Vitals medidos en móviles de verdad, no en tu Mac |
| Datos estructurados | Prueba de resultados enriquecidos de Google | Si el JSON-LD se entiende y qué ficha saldría |
| Entregabilidad del correo | mail-tester.com | **El más importante y el que más se olvida** |
| Indexación | Google Search Console | Qué páginas entran, cuáles se descartan y por qué |

Sobre el correo: un formulario de contacto que aterriza en la carpeta de spam
es un formulario roto, y no da ningún error. Se envía una consulta de prueba a
la dirección que da mail-tester y se mira la nota. Por debajo de 8/10 hay que
revisar los registros SPF, DKIM y DMARC del dominio, que es lo que Resend pide
configurar en el DNS.

### El recorrido a mano

Lo que ninguna herramienta ve:

- [ ] Crear una galería de prueba, subir tres fotos, abrirla como cliente,
      marcar favoritas, escribir un comentario y enviarlo. Comprobar que la
      selección aparece en el panel.
- [ ] Salir de la sesión y comprobar que la galería vuelve a pedir contraseña.
      Y que el botón «atrás» del navegador **no** repinta lo que había dentro.
- [ ] Enviar el formulario de verdad y comprobar que llega a los dos buzones.
- [ ] Rechazar las cookies y confirmar, en la pestaña de red del navegador, que
      no se carga nada de Google.
- [ ] Recorrer la web entera en un móvil real, no en el simulador: la portada,
      un reportaje, el formulario y el pie.
- [ ] Modo oscuro y modo claro.
- [ ] Borrar un mensaje desde el panel y comprobar que desaparece de verdad.

### Cada tanto, para siempre

- `npm audit` y actualizar. Next.js publica parches de seguridad y no avisan
  solos.
- `df -h` en el servidor una vez al año: lo que crece es `data/galleries/`.
- Comprobar que las copias de `data/` se están haciendo **y que se pueden
  restaurar**. Una copia que nadie ha probado a restaurar no es una copia.

## 13. Lo que queda fuera de esta guía

- **Correo del dominio.** Los buzones `info@` y `contratos@` los sirve IONOS,
  no el servidor. El VPS solo manda a través de Resend.
- **Contraseñas.** Ni las de IONOS ni la de Resend pasan por el repositorio ni
  por el chat: se pegan directamente en el servidor.
