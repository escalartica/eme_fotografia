'use client';
import { useEffect, useRef, useState, useSyncExternalStore, type ChangeEvent, type DragEvent, type FormEvent } from 'react';
import Link from 'next/link';
import { UploadIcon, TrashIcon } from '@/components/ui/Icon';
import styles from './NewGalleryForm.module.css';

const MAX_FILES = 60;
const MAX_FILE_BYTES = 25 * 1024 * 1024;
const ALLOWED_TYPES = new Set(['image/webp', 'image/jpeg', 'image/png', 'image/avif']);
const PASSWORD_ALPHABET = 'abcdefghjkmnpqrstuvwxyz23456789'; // no 0/O/1/l/i -- read aloud or typed from a note without ambiguity

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

function generatePassword(): string {
  const bytes = new Uint32Array(10);
  window.crypto.getRandomValues(bytes);
  let out = '';
  for (const n of bytes) out += PASSWORD_ALPHABET[n % PASSWORD_ALPHABET.length];
  return out;
}

// Same useSyncExternalStore pattern as lib/hooks/useReducedMotion.ts --
// the idiomatic way in this codebase to read a browser-only value with
// no hydration mismatch (server and the client's first paint both get
// getServerSnapshot's '', then the real origin appears once mounted).
// window.location.origin never changes during the component's life, so
// subscribe has nothing to listen for.
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

  const effectiveSlug = slugTouched ? slug : slugify(clientName);
  const effectiveUsername = usernameTouched ? username : usernameSuggestion(clientName);

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
        setError(`"${file.name}" supera el tamaño máximo de 25MB.`);
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

    if (!clientName.trim()) { setError('Indica el nombre del cliente.'); return; }
    if (!effectiveSlug.trim()) { setError('Indica el enlace de la galería.'); return; }
    if (!effectiveUsername.trim()) { setError('Indica el usuario de acceso.'); return; }
    if (password.length < 8) { setError('La contraseña debe tener al menos 8 caracteres.'); return; }
    if (files.length === 0) { setError('Sube al menos una foto.'); return; }

    setIsSubmitting(true);
    try {
      const form = new FormData();
      form.set('slug', effectiveSlug.trim());
      form.set('clientName', clientName.trim());
      form.set('weddingDate', weddingDate);
      form.set('username', effectiveUsername.trim());
      form.set('password', password);
      for (const staged of files) form.append('photos', staged.file);

      const res = await fetch('/api/admin/galerias', { method: 'POST', body: form });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error ?? 'No se pudo crear la galería.');
        return;
      }
      setCreated({
        slug: data.slug as string,
        clientName: clientName.trim(),
        username: effectiveUsername.trim(),
        password,
        shareUrl: `${shareOrigin}/${data.slug}`,
      });
    } catch {
      setError('No se pudo conectar. Comprueba tu conexión e inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
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
          <div className={styles.credentialRow}>
            <dt>Enlace</dt>
            <dd>
              <code>{created.shareUrl}</code>
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
              minLength={8}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="button" onClick={() => setShowPassword((v) => !v)}>
              {showPassword ? 'Ocultar' : 'Ver'}
            </button>
            <button type="button" onClick={() => setPassword(generatePassword())}>
              Generar
            </button>
          </div>
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
            onChange={handleFileInputChange}
          />
        </div>

        {files.length > 0 && (
          <>
            <p className={styles.fileCount}>{files.length} foto{files.length === 1 ? '' : 's'} lista{files.length === 1 ? '' : 's'} para subir</p>
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

      <div className={styles.actions}>
        <Link href="/admin" className={styles.secondaryButton}>Cancelar</Link>
        <button type="submit" className={styles.primaryButton} disabled={isSubmitting}>
          {isSubmitting ? 'Creando galería…' : 'Crear galería'}
        </button>
      </div>
    </form>
  );
}
