'use client';
import { Fragment, useEffect, useRef, useState, useSyncExternalStore, type ChangeEvent, type DragEvent, type FormEvent } from 'react';
import Link from 'next/link';
import { UploadIcon, TrashIcon } from '@/components/ui/Icon';
import { MIN_PASSWORD_LENGTH, generarPassword, mensajeParaLaPareja, motivoPasswordDebil } from '@/lib/gallery-credentials';
import { LADO_LARGO } from '@/lib/reducir-foto';
import { MAX_FOTOS_POR_GALERIA } from '@/lib/gallery-limits';
import { enviarConProgreso, subirEnTandas, type Avance } from '@/lib/subir-por-tandas';
import { AnadirFotos, ProgresoSubida } from '../[slug]/AnadirFotos';
import styles from './NewGalleryForm.module.css';

/**
 * CUÁNTAS FOTOS ADMITE UNA GALERÍA: las de una boda entera para que la pareja
 * elija, 1.200 o más. Antes eran 200 y viajaban todas en una sola petición;
 * ahora se suben por tandas (lib/subir-por-tandas.ts) y el tope está en
 * lib/gallery-limits.ts, compartido con el servidor.
 */
const MAX_FILES = MAX_FOTOS_POR_GALERIA;
/** El tope de lo que se ACEPTA del disco, no de lo que se sube: un JPEG recién
 *  exportado a 45 megapíxeles pasa de 25 MB sin esfuerzo, y lo que acaba
 *  saliendo de aquí ronda los 600 KB. */
const MAX_FILE_BYTES = 120 * 1024 * 1024;
/**
 * CUÁNTAS MINIATURAS SE PINTAN MIENTRAS SE PREPARA LA SUBIDA.
 *
 * Cada miniatura es el ORIGINAL, que el navegador decodifica entero para
 * dibujarlo pequeño: con mil doscientas en pantalla la pestaña se queda sin
 * memoria antes de empezar a subir. Se enseñan las primeras, que bastan para
 * comprobar que es la carpeta buena, y una línea dice cuántas más van.
 */
const MINIATURAS_VISIBLES = 60;

function mb(bytes: number): string {
  return `${(bytes / 1024 / 1024).toFixed(bytes > 10 * 1024 * 1024 ? 0 : 1)} MB`;
}

const ALLOWED_TYPES = new Set(['image/webp', 'image/jpeg', 'image/png', 'image/avif']);

function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function usernameSuggestion(value: string): string {
  return slugify(value);
}


// Same useSyncExternalStore pattern as lib/hooks/useReducedMotion.ts --
// the idiomatic way in this codebase to read a browser-only value with
// no hydration mismatch (server and the client's first paint both get
// getServerSnapshot's '', then the real origin appears once mounted).
// window.location.origin never changes during the component's life, so
// subscribe has nothing to listen for.
/**
 * LA CONTRASEÑA VIENE YA GENERADA, no en blanco.
 *
 * En la primera galería real creada desde el panel, el campo vacío se
 * rellenó a mano con «12345678». Un campo vacío pregunta «¿qué contraseña
 * quieres?» y la respuesta rápida siempre es la misma; un campo que ya
 * trae diez caracteres al azar solo pide copiarlos. El botón «Generar»
 * sigue estando para sacar otra, y el campo se puede sobrescribir.
 *
 * La primera se calcula una sola vez y se guarda aquí fuera para que
 * getSnapshot devuelva siempre el mismo valor (si cambiara en cada llamada,
 * React entraría en un bucle de renders).
 *
 * Y SE TIRA EN CUANTO SE USA. Si no, dos galerías creadas seguidas sin
 * recargar la página --volver al formulario desde la pantalla de
 * confirmación, o con el botón atrás-- llegarían con la MISMA contraseña
 * sugerida. Y como viene rellenada, nadie la mira: es justo el gesto que este
 * campo relleno explota a su favor, vuelto en contra.
 */
let passwordSugerida = '';
function getPasswordSnapshot() {
  if (!passwordSugerida) passwordSugerida = generarPassword();
  return passwordSugerida;
}
function getServerPasswordSnapshot() {
  return '';
}

/** La tira, para que la siguiente galería reciba otra. Va aquí y no dentro
 *  del componente porque la variable vive en el módulo. */
function olvidarLaSugerida() {
  passwordSugerida = '';
}

function subscribeNever() {
  return () => {};
}
function getOriginSnapshot() {
  return window.location.origin;
}
function getServerOriginSnapshot() {
  return '';
}

interface StagedFile {
  id: string;
  file: File;
  previewUrl: string;
}

/**
 * El enlace, con los puntos de corte donde los pondría una persona.
 *
 * En un móvil no cabe entero, y sin ayuda el navegador lo parte por donde
 * se queda sin ancho: «https://www.emefot / ografiasevilla.com». Un <wbr>
 * antes de cada barra le ofrece sitios mejores por los que cortar, así
 * que el dominio queda de una pieza.
 */
function EnlacePartible({ url }: { url: string }) {
  const trozos = url.split(/(?=\/)/g);
  return (
    <>
      {trozos.map((trozo, i) => (
        <Fragment key={i}>
          {i > 0 && <wbr />}
          {trozo}
        </Fragment>
      ))}
    </>
  );
}

interface CreatedGallery {
  slug: string;
  clientName: string;
  username: string;
  password: string;
  shareUrl: string;
  /** Cuántas fotos han entrado, de cuántas se eligieron. */
  subidas: number;
  /** Las que no llegaron a subir si la subida se cortó a medias. */
  faltan: File[];
  avisoFaltan: string | null;
}

/**
 * The admin's "upload a new session" form. Everything the server route
 * (app/api/admin/galerias/route.ts) validates is checked here first too
 * -- not as a substitute for the server check (a client can always be
 * bypassed) but so a photographer uploading 60 RAW-adjacent exports from
 * their phone gets an immediate, specific error instead of a failed
 * request after a slow upload.
 */
export function NewGalleryForm() {
  const [clientName, setClientName] = useState('');
  const [weddingDate, setWeddingDate] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [username, setUsername] = useState('');
  const [usernameTouched, setUsernameTouched] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [avance, setAvance] = useState<Avance | null>(null);
  const [showPassword, setShowPassword] = useState(true);
  const [files, setFiles] = useState<StagedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [created, setCreated] = useState<CreatedGallery | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const filesRef = useRef<StagedFile[]>([]);

  // Ref only ever needs the LATEST files array at unmount time (to revoke
  // every staged preview's object URL, wherever the form ends up: submitted,
  // abandoned, or reset) -- keeping the assignment inside its own effect
  // (rather than in the render body) is what the value is for a ref.
  useEffect(() => {
    filesRef.current = files;
  }, [files]);

  useEffect(() => {
    return () => {
      for (const staged of filesRef.current) URL.revokeObjectURL(staged.previewUrl);
    };
  }, []);

  // Slug/username auto-suggestions are DERIVED from clientName, not
  // synchronized into state via an effect -- computed straight in the
  // render body below (effectiveSlug/effectiveUsername) once the user
  // hasn't overridden them by hand (slugTouched/usernameTouched).

  const shareOrigin = useSyncExternalStore(subscribeNever, getOriginSnapshot, getServerOriginSnapshot);
  const passwordPropuesta = useSyncExternalStore(subscribeNever, getPasswordSnapshot, getServerPasswordSnapshot);

  const effectiveSlug = slugTouched ? slug : slugify(clientName);
  const pesoTotal = files.reduce((suma, f) => suma + f.file.size, 0);
  const effectiveUsername = usernameTouched ? username : usernameSuggestion(clientName);
  const effectivePassword = passwordTouched ? password : passwordPropuesta;

  function addFiles(list: FileList | File[]) {
    setError(null);
    const incoming = Array.from(list);
    const combined = [...files];
    for (const file of incoming) {
      if (combined.length >= MAX_FILES) {
        setError(`Máximo ${MAX_FILES.toLocaleString('es-ES')} fotos por galería.`);
        break;
      }
      if (!ALLOWED_TYPES.has(file.type)) {
        setError(`"${file.name}" no es un formato admitido (usa JPG, PNG, WEBP o AVIF).`);
        continue;
      }
      if (file.size > MAX_FILE_BYTES) {
        setError(`"${file.name}" es enorme (${mb(file.size)}). ¿Seguro que es una foto?`);
        continue;
      }
      combined.push({ id: `${file.name}-${file.lastModified}-${file.size}-${combined.length}`, file, previewUrl: URL.createObjectURL(file) });
    }
    setFiles(combined);
  }

  function handleFileInputChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) addFiles(e.target.files);
    e.target.value = '';
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) addFiles(e.dataTransfer.files);
  }

  function removeFile(id: string) {
    setFiles((prev) => {
      const target = prev.find((f) => f.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((f) => f.id !== id);
    });
  }

  function quitarTodas() {
    for (const staged of files) URL.revokeObjectURL(staged.previewUrl);
    setFiles([]);
    setError(null);
  }

  async function copyValue(field: string, value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(field);
      window.setTimeout(() => setCopiedField((current) => (current === field ? null : current)), 1800);
    } catch {
      // Clipboard API can be unavailable (older browser, insecure context) --
      // the value is still shown as selectable text, so this is a
      // convenience, not the only way to get it.
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!clientName.trim()) { setError('Indica el nombre del cliente.'); return; }
    if (!effectiveSlug.trim()) { setError('Indica el enlace de la galería.'); return; }
    if (!effectiveUsername.trim()) { setError('Indica el usuario de acceso.'); return; }
    const passwordFloja = motivoPasswordDebil(effectivePassword);
    if (passwordFloja) { setError(passwordFloja); return; }
    if (files.length === 0) { setError('Sube al menos una foto.'); return; }

    setIsSubmitting(true);
    const originales = files.map((f) => f.file);
    try {
      /**
       * LA GALERÍA SE CREA CON LA PRIMERA TANDA Y LAS DEMÁS SE AÑADEN DETRÁS.
       *
       * Las fotos se encogen y se mandan de cuarenta en cuarenta
       * (lib/subir-por-tandas.ts): mil doscientas fotos no caben en una sola
       * petición. La primera tanda viaja con los datos de la pareja y crea la
       * galería; las siguientes van a /api/admin/galerias/<slug>/fotos.
       */
      let slugCreado = '';
      const r = await subirEnTandas({
        fotos: originales,
        alAvanzar: setAvance,
        enviarTanda: async (tanda, indice, alProgresar, idTanda) => {
          const form = new FormData();
          form.set('tanda', idTanda);
          for (const f of tanda) form.append('photos', f);
          if (indice > 0) {
            return enviarConProgreso(`/api/admin/galerias/${slugCreado}/fotos`, form, alProgresar);
          }
          form.set('slug', effectiveSlug.trim());
          form.set('clientName', clientName.trim());
          form.set('weddingDate', weddingDate);
          form.set('username', effectiveUsername.trim());
          form.set('password', effectivePassword);
          const res = await enviarConProgreso('/api/admin/galerias', form, alProgresar);
          if (!res.ok) return res;
          // Una respuesta 2xx sin `slug` no debería existir, pero si llegara,
          // seguir adelante dejaría a la vista un enlace roto para el cliente.
          const slugDevuelto = typeof res.data?.slug === 'string' ? res.data.slug : '';
          if (!slugDevuelto) {
            return {
              ok: false,
              status: 400,
              data: { error: 'La galería se ha creado pero el servidor no ha devuelto su enlace. Míralo en el panel.' },
            };
          }
          slugCreado = slugDevuelto;
          return res;
        },
      });

      if (!slugCreado) {
        // Ni siquiera la primera tanda entró: no hay galería.
        setError(r.ok ? 'No se pudo crear la galería.' : r.error);
        return;
      }
      // La sugerida ya ha viajado a una galería: la siguiente tiene que ser
      // otra. Ver el comentario de `passwordSugerida`.
      olvidarLaSugerida();

      setCreated({
        slug: slugCreado,
        clientName: clientName.trim(),
        username: effectiveUsername.trim(),
        password: effectivePassword,
        shareUrl: `${shareOrigin}/${slugCreado}`,
        subidas: r.subidas,
        faltan: r.ok ? [] : originales.slice(r.subidas),
        avisoFaltan: r.ok ? null : r.error,
      });
    } catch {
      setError('No se pudo conectar. Comprueba tu conexión e inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
      setAvance(null);
    }
  }

  if (created) {
    return (
      <div className={styles.confirm}>
        <p className={styles.eyebrow}>Galería creada</p>
        <h1 className={styles.heading}>Todo listo para {created.clientName}</h1>
        <p className={styles.confirmHint}>
          Comparte estos datos con tu cliente por el canal que prefieras (WhatsApp, email...). La
          contraseña no volverá a mostrarse en texto plano después de salir de esta página.
        </p>

        {/* LA GALERÍA EXISTE AUNQUE NO HAYAN ENTRADO TODAS. Con treinta
            tandas seguidas, que la conexión se caiga a mitad es posible, y
            empezar de cero sería volver a subir lo que ya está. Las que
            faltan se quedan aquí listas para un segundo intento. */}
        {created.faltan.length > 0 && (
          <>
            <p className={styles.avisoPeso} role="alert">
              Se han subido {created.subidas.toLocaleString('es-ES')} de{' '}
              {(created.subidas + created.faltan.length).toLocaleString('es-ES')} fotos. {created.avisoFaltan}{' '}
              No compartas el enlace todavía: sube las que faltan.
            </p>
            <AnadirFotos
              slug={created.slug}
              fotosActuales={created.subidas}
              fotosIniciales={created.faltan}
              titulo="Fotos que faltan por subir"
            />
          </>
        )}

        <dl className={styles.credentialList}>
          <div className={`${styles.credentialRow} ${styles.filaEnlace}`}>
            <dt>Enlace</dt>
            <dd>
              <code><EnlacePartible url={created.shareUrl} /></code>
              <button type="button" onClick={() => copyValue('url', created.shareUrl)}>
                {copiedField === 'url' ? 'Copiado' : 'Copiar'}
              </button>
              <span className="sr-only" role="status">{copiedField === 'url' ? 'Enlace copiado al portapapeles' : ''}</span>
            </dd>
          </div>
          <div className={styles.credentialRow}>
            <dt>Usuario</dt>
            <dd>
              <code>{created.username}</code>
              <button type="button" onClick={() => copyValue('username', created.username)}>
                {copiedField === 'username' ? 'Copiado' : 'Copiar'}
              </button>
              <span className="sr-only" role="status">{copiedField === 'username' ? 'Usuario copiado al portapapeles' : ''}</span>
            </dd>
          </div>
          <div className={styles.credentialRow}>
            <dt>Contraseña</dt>
            <dd>
              <code>{created.password}</code>
              <button type="button" onClick={() => copyValue('password', created.password)}>
                {copiedField === 'password' ? 'Copiado' : 'Copiar'}
              </button>
              <span className="sr-only" role="status">{copiedField === 'password' ? 'Contraseña copiada al portapapeles' : ''}</span>
            </dd>
          </div>
        </dl>

        {/* UN BOTÓN QUE COPIA EL MENSAJE ENTERO, no tres campos sueltos.
            Lo que el estudio hace después de esta pantalla es abrir WhatsApp
            y escribirle a la pareja; copiar tres cosas de una en una y
            redactar el texto alrededor es el trabajo que esta pantalla puede
            ahorrarle, y de paso el mensaje explica qué van a encontrar
            dentro, que es lo que hace que entren. */}
        <button
          type="button"
          className={styles.primaryButton}
          onClick={() => copyValue('mensaje', mensajeParaLaPareja(created))}
        >
          {copiedField === 'mensaje' ? 'Mensaje copiado' : 'Copiar el mensaje para la pareja'}
        </button>
        <span className="sr-only" role="status">
          {copiedField === 'mensaje' ? 'Mensaje copiado al portapapeles' : ''}
        </span>

        <div className={styles.confirmActions}>
          <Link href={`/admin/galerias/${created.slug}`} className={styles.primaryButton}>
            Ver galería en el panel
          </Link>
          <Link href="/admin" className={styles.secondaryButton}>
            Volver al panel
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <p className={styles.eyebrow}>Nueva galería privada</p>
      <h1 className={styles.heading}>Sube una nueva sesión de fotos</h1>
      <p className={styles.hint}>
        Crea el acceso privado de tu cliente y sube las fotos de su sesión. Podrás compartir el
        enlace, usuario y contraseña con él en cuanto termines.
      </p>

      <div className={styles.field}>
        <label htmlFor="clientName" className={styles.label}>Nombre del cliente</label>
        <input
          id="clientName"
          required
          placeholder="Ej. Lucía y Marcos"
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
        />
      </div>

      <div className={styles.fieldRow}>
        <div className={styles.field}>
          <label htmlFor="weddingDate" className={styles.label}>Fecha de la boda (opcional)</label>
          <input
            id="weddingDate"
            type="date"
            value={weddingDate}
            onChange={(e) => setWeddingDate(e.target.value)}
          />
        </div>
        <div className={styles.field}>
          <label htmlFor="slug" className={styles.label}>Enlace de la galería</label>
          <div className={styles.slugField}>
            <span className={styles.slugPrefix}>{shareOrigin}/</span>
            <input
              id="slug"
              required
              value={effectiveSlug}
              onChange={(e) => { setSlugTouched(true); setSlug(slugify(e.target.value)); }}
            />
          </div>
        </div>
      </div>

      <div className={styles.fieldRow}>
        <div className={styles.field}>
          <label htmlFor="username" className={styles.label}>Usuario de acceso</label>
          <input
            id="username"
            required
            autoComplete="off"
            value={effectiveUsername}
            onChange={(e) => { setUsernameTouched(true); setUsername(e.target.value); }}
          />
        </div>
        <div className={styles.field}>
          <label htmlFor="password" className={styles.label}>Contraseña de acceso</label>
          <div className={styles.passwordField}>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="off"
              minLength={MIN_PASSWORD_LENGTH}
              required
              value={effectivePassword}
              onChange={(e) => { setPasswordTouched(true); setPassword(e.target.value); }}
            />
            <button type="button" onClick={() => setShowPassword((v) => !v)}>
              {showPassword ? 'Ocultar' : 'Ver'}
            </button>
            <button type="button" onClick={() => { setPasswordTouched(true); setPassword(generarPassword()); }}>
              Generar
            </button>
          </div>
          <p className={styles.ayudaCampo}>
            Viene generada al azar. Puedes cambiarla por otra, pero es la llave de las fotos de
            tus clientes.
          </p>
        </div>
      </div>

      <div className={styles.field}>
        {/* <label> de verdad, no un <span> decorativo: el input de ficheros
            (abajo, oculto a la vista pero enfocable) no tenía ningún nombre
            accesible propio -- WCAG 1.3.1 / 4.1.2. */}
        <label htmlFor="fotos" className={styles.label}>Fotos de la sesión</label>
        {/* Era un <div role="button" tabIndex={0}> con su propio manejador de
            teclado, y con un <input type="file"> dentro: un control anidado
            en algo que dice ser un botón, lo que ARIA prohíbe. Además la
            barra espaciadora no llamaba a preventDefault, así que abría el
            selector Y desplazaba la página. Y el aria-label repetía el texto
            que ya está escrito debajo.

            Ahora el <div> es solo la zona de arrastre (mejora para ratón: el
            clic en cualquier parte sigue funcionando) y quien abre el
            selector es un <button> de verdad. El arrastre no es la única
            forma de hacerlo, que es lo que pide WCAG 2.5.7. */}
        <div
          className={styles.dropzone}
          data-dragging={isDragging ? 'true' : 'false'}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <UploadIcon size={28} />
          <p>
            Arrastra tus fotos aquí o{' '}
            <button
              type="button"
              className={styles.dropzoneLink}
              /* El clic del <div> de fuera abre el mismo selector: sin esto
                 el evento burbujea y se abre dos veces. */
              onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
            >
              selecciónalas
            </button>
          </p>
          <p className={styles.dropzoneHint}>JPG, PNG, WEBP o AVIF · hasta {MAX_FILES.toLocaleString('es-ES')} fotos por galería</p>
          <input
            id="fotos"
            ref={fileInputRef}
            type="file"
            accept="image/webp,image/jpeg,image/png,image/avif"
            multiple
            className={styles.hiddenInput}
            // Fuera del recorrido del tabulador. Está oculto con `clip`, que
            // NO quita el foco, así que quien navega con teclado se
            // encontraba dos paradas para la misma acción -- esta, invisible,
            // y el botón «selecciónalas» que abre el mismo diálogo.
            tabIndex={-1}
            onChange={handleFileInputChange}
          />
        </div>

        {files.length > 0 && (
          <>
            <p className={styles.fileCount}>
              {files.length} foto{files.length === 1 ? '' : 's'} lista{files.length === 1 ? '' : 's'} para subir ·{' '}
              {mb(pesoTotal)}
            </p>
            <p className={styles.notaPeso}>
              Se envían encogidas a {LADO_LARGO} px de lado largo, que es lo que va a ver la pareja en su
              pantalla. Tus originales no se tocan.
            </p>
            <ul className={styles.previewGrid}>
              {files.slice(0, MINIATURAS_VISIBLES).map((staged) => (
                <li key={staged.id} className={styles.previewItem}>
                  <img src={staged.previewUrl} alt="" loading="lazy" decoding="async" className={styles.previewImage} />
                  <button
                    type="button"
                    className={styles.previewRemove}
                    aria-label={`Quitar ${staged.file.name}`}
                    onClick={() => removeFile(staged.id)}
                  >
                    <TrashIcon size={16} />
                  </button>
                </li>
              ))}
            </ul>
            <p className={styles.previewMas}>
              {files.length > MINIATURAS_VISIBLES && (
                <span>
                  Y {(files.length - MINIATURAS_VISIBLES).toLocaleString('es-ES')} fotos más que no se muestran aquí.
                </span>
              )}
              <button type="button" onClick={quitarTodas} disabled={isSubmitting}>
                Quitar todas
              </button>
            </p>
          </>
        )}
      </div>

      {error && <p className={styles.error} role="alert">{error}</p>}

      {avance && <ProgresoSubida avance={avance} />}

      <div className={styles.actions}>
        <Link href="/admin" className={styles.secondaryButton}>Cancelar</Link>
        <button type="submit" className={styles.primaryButton} disabled={isSubmitting}>
          {isSubmitting ? 'Creando galería…' : 'Crear galería'}
        </button>
      </div>
    </form>
  );
}
