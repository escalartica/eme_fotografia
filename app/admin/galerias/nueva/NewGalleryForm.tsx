'use client';
import { Fragment, useEffect, useRef, useState, useSyncExternalStore, type ChangeEvent, type DragEvent, type FormEvent } from 'react';
import Link from 'next/link';
import { UploadIcon, TrashIcon } from '@/components/ui/Icon';
import { MIN_PASSWORD_LENGTH, generarPassword, mensajeParaLaPareja, motivoPasswordDebil } from '@/lib/gallery-credentials';
import { LADO_LARGO, reducirFoto } from '@/lib/reducir-foto';
import styles from './NewGalleryForm.module.css';

/** Una boda entera de una vez. Antes eran 60 y había que partirla en tandas;
 *  desde que las fotos se encogen en el navegador antes de salir
 *  (lib/reducir-foto.ts), doscientas pesan menos que las sesenta de antes. */
const MAX_FILES = 200;
/** El tope de lo que se ACEPTA del disco, no de lo que se sube: un JPEG recién
 *  exportado a 45 megapíxeles pasa de 25 MB sin esfuerzo, y lo que acaba
 *  saliendo de aquí ronda los 600 KB. */
const MAX_FILE_BYTES = 120 * 1024 * 1024;
/**
 * LO QUE SE PUEDE SUBIR DE UNA SOLA VEZ.
 *
 * nginx acepta 420 MB (`client_max_body_size`, docs/DESPLIEGUE.md §7) y la
 * propia aplicación corta en 400 (`MAX_TOTAL_BYTES` en
 * app/api/admin/galerias/route.ts). Manda el más bajo de los dos, que es este.
 *
 * Con las fotos ya encogidas es un techo que no se toca ni con doscientas,
 * pero sigue puesto: alguien puede arrastrar una carpeta de TIFF, o fallar el
 * encogido y subirse los originales.
 *
 * Importa porque quien lo supera NO ve un error de esta aplicación: ve una
 * página 413 de nginx, en inglés y sin ninguna pista de qué hacer, después de
 * haber estado subiendo varios minutos. Avisar antes de empezar cuesta una
 * suma y ahorra esa subida entera.
 */
const LIMITE_SERVIDOR_BYTES = 400 * 1024 * 1024;

function mb(bytes: number): string {
  return `${(bytes / 1024 / 1024).toFixed(bytes > 10 * 1024 * 1024 ? 0 : 1)} MB`;
}

/**
 * Sube con barra de progreso, que `fetch` todavía no sabe hacer.
 *
 * No es un adorno: cuarenta fotos de boda son varios cientos de megas y
 * pueden tardar minutos. Con un botón que solo decía «Creando galería…», lo
 * razonable desde el otro lado de la pantalla es pensar que se ha colgado,
 * recargar, y perder la subida entera -- que es justo lo que no puede pasar
 * cuando lo que se está subiendo es la boda de alguien.
 */
function subirConProgreso(
  form: FormData,
  alProgresar: (enviados: number, total: number) => void
): Promise<{ ok: boolean; status: number; data: Record<string, unknown> | null }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/admin/galerias');
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) alProgresar(e.loaded, e.total);
    });
    xhr.addEventListener('load', () => {
      let data: Record<string, unknown> | null = null;
      try {
        data = JSON.parse(xhr.responseText) as Record<string, unknown>;
      } catch {
        // Un 413 de nginx llega como HTML, no como JSON. Que el `catch` lo
        // deje en null es correcto: el mensaje lo pone quien llama.
      }
      resolve({ ok: xhr.status >= 200 && xhr.status < 300, status: xhr.status, data });
    });
    xhr.addEventListener('error', () => reject(new Error('red')));
    xhr.send(form);
  });
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
  const [progreso, setProgreso] = useState<{ enviados: number; total: number } | null>(null);
  const [preparando, setPreparando] = useState<{ hechas: number; total: number } | null>(null);
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
  const sePasaDelLimite = pesoTotal > LIMITE_SERVIDOR_BYTES;
  const effectiveUsername = usernameTouched ? username : usernameSuggestion(clientName);
  const effectivePassword = passwordTouched ? password : passwordPropuesta;

  function addFiles(list: FileList | File[]) {
    setError(null);
    const incoming = Array.from(list);
    const combined = [...files];
    for (const file of incoming) {
      if (combined.length >= MAX_FILES) {
        setError(`Máximo ${MAX_FILES} fotos por galería.`);
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
    setProgreso(null);

    if (!clientName.trim()) { setError('Indica el nombre del cliente.'); return; }
    if (!effectiveSlug.trim()) { setError('Indica el enlace de la galería.'); return; }
    if (!effectiveUsername.trim()) { setError('Indica el usuario de acceso.'); return; }
    const passwordFloja = motivoPasswordDebil(effectivePassword);
    if (passwordFloja) { setError(passwordFloja); return; }
    if (files.length === 0) { setError('Sube al menos una foto.'); return; }

    setIsSubmitting(true);
    try {
      /**
       * PRIMERO SE ENCOGEN, DESPUÉS SE SUBEN. Una a una y no todas a la vez:
       * cada foto ocupa su tamaño descomprimido en memoria mientras se dibuja
       * --una de 45 megapíxeles son 180 MB-- y hacerlo en paralelo tumba la
       * pestaña. De una en una son unas décimas de segundo cada una, y la
       * cuenta va a la vista.
       */
      setPreparando({ hechas: 0, total: files.length });
      const listas: File[] = [];
      for (const staged of files) {
        listas.push(await reducirFoto(staged.file));
        setPreparando({ hechas: listas.length, total: files.length });
      }
      setPreparando(null);

      const pesoQueSale = listas.reduce((suma, f) => suma + f.size, 0);
      if (pesoQueSale > LIMITE_SERVIDOR_BYTES) {
        setError(
          `Aun encogidas siguen siendo ${mb(pesoQueSale)}, y el servidor no admite tanto de una vez. ` +
            'Crea la galería con una parte y añade el resto en una segunda tanda.'
        );
        return;
      }

      const form = new FormData();
      form.set('slug', effectiveSlug.trim());
      form.set('clientName', clientName.trim());
      form.set('weddingDate', weddingDate);
      form.set('username', effectiveUsername.trim());
      form.set('password', effectivePassword);
      for (const lista of listas) form.append('photos', lista);

      const res = await subirConProgreso(form, (enviados, total) => setProgreso({ enviados, total }));
      const data = res.data;
      if (!res.ok) {
        if (res.status === 413) {
          setError(
            `El servidor no admite una subida tan grande de una vez (${mb(pesoTotal)}). ` +
              'Crea la galería con una parte de las fotos y añade el resto en una segunda tanda.'
          );
        } else {
          setError((data?.error as string) ?? 'No se pudo crear la galería.');
        }
        return;
      }
      // Una respuesta 2xx sin `slug` no debería existir, pero si llegara,
      // seguir adelante dejaría a la vista un enlace roto para el cliente.
      const slugCreado = typeof data?.slug === 'string' ? data.slug : '';
      if (!slugCreado) {
        setError('La galería se ha creado pero el servidor no ha devuelto su enlace. Míralo en el panel.');
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
      });
    } catch {
      setError('No se pudo conectar. Comprueba tu conexión e inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
      setProgreso(null);
      setPreparando(null);
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
          <p className={styles.dropzoneHint}>JPG, PNG, WEBP o AVIF · hasta 25MB por foto · máximo {MAX_FILES} fotos</p>
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
            {/* El aviso llega ANTES de subir, no después de cinco minutos de
                barra de progreso y un 413 en inglés. Con las fotos encogidas
                casi no se llega nunca, pero una carpeta de TIFF sí. */}
            {sePasaDelLimite && (
              <p className={styles.avisoPeso} role="status">
                Son {mb(pesoTotal)} en el disco. Si al encogerlas siguen pasando de{' '}
                {mb(LIMITE_SERVIDOR_BYTES)}, habrá que subirlas en dos tandas.
              </p>
            )}
            <ul className={styles.previewGrid}>
              {files.map((staged) => (
                <li key={staged.id} className={styles.previewItem}>
                  <img src={staged.previewUrl} alt="" className={styles.previewImage} />
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
          </>
        )}
      </div>

      {error && <p className={styles.error} role="alert">{error}</p>}

      {preparando && (
        <div className={styles.progreso}>
          <progress
            className={styles.progresoBarra}
            value={preparando.hechas}
            max={preparando.total}
            aria-label="Preparando las fotos"
          />
          <p className={styles.progresoTexto} aria-live="polite">
            Preparando las fotos… {preparando.hechas} de {preparando.total}
          </p>
          <p className={styles.progresoAviso}>No cierres esta pestaña hasta que termine.</p>
        </div>
      )}

      {progreso && (
        <div className={styles.progreso}>
          {/* `<progress>` nativo: el lector de pantalla lo anuncia solo y el
              navegador lo pinta aunque falle el CSS. */}
          <progress
            className={styles.progresoBarra}
            value={progreso.enviados}
            max={progreso.total}
            aria-label="Progreso de la subida"
          />
          <p className={styles.progresoTexto} aria-live="polite">
            {progreso.enviados >= progreso.total
              ? 'Fotos subidas. Preparando la galería…'
              : `Subiendo… ${Math.round((progreso.enviados / progreso.total) * 100)} % · ${mb(progreso.enviados)} de ${mb(progreso.total)}`}
          </p>
          <p className={styles.progresoAviso}>No cierres esta pestaña hasta que termine.</p>
        </div>
      )}

      <div className={styles.actions}>
        <Link href="/admin" className={styles.secondaryButton}>Cancelar</Link>
        <button type="submit" className={styles.primaryButton} disabled={isSubmitting}>
          {isSubmitting ? 'Creando galería…' : 'Crear galería'}
        </button>
      </div>
    </form>
  );
}
