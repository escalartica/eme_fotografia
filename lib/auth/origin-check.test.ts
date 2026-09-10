// @vitest-environment node
import { describe, it, expect, afterEach, vi } from 'vitest';
import { isSameOriginRequest } from './origin-check';

const URL_PROPIA = 'http://localhost:3000/api/admin/login';

function post(headers: Record<string, string> = {}, url: string = URL_PROPIA): Request {
  return new Request(url, { method: 'POST', headers, body: '{}' });
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('isSameOriginRequest', () => {
  it('accepts a request whose Origin is the host the server itself sees', () => {
    expect(isSameOriginRequest(post({ origin: 'http://localhost:3000' }))).toBe(true);
  });

  it('accepts the host the visitor really typed, reported by X-Forwarded-Host', () => {
    // En producción esto va detrás de un proxy inverso: el proceso Node ve
    // `localhost:3000` y el visitante ha escrito el dominio real. Quedarse solo
    // con el primero rompería todos los formularios del sitio publicado.
    expect(
      isSameOriginRequest(post({ origin: 'https://emefotografia.es', 'x-forwarded-host': 'emefotografia.es' }))
    ).toBe(true);
  });

  it('accepts the canonical deployment host from NEXT_PUBLIC_SITE_URL', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://emefotografia.es');
    expect(isSameOriginRequest(post({ origin: 'https://emefotografia.es' }))).toBe(true);
  });

  it('still accepts its own origin when NEXT_PUBLIC_SITE_URL is misconfigured', () => {
    // Una variable mal puesta no puede tumbar el login del estudio.
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'esto-no-es-una-url');
    expect(isSameOriginRequest(post({ origin: 'http://localhost:3000' }))).toBe(true);
  });

  it('rejects a request coming from another site', () => {
    // Este es el caso CSRF: otra web haciendo que el navegador del estudio, con
    // su cookie de sesión puesta, borre mensajes o cree galerías.
    expect(isSameOriginRequest(post({ origin: 'https://sitio-de-otro.example' }))).toBe(false);
    expect(isSameOriginRequest(post({ origin: 'http://localhost:3001' }))).toBe(false);
  });

  it('rejects an Origin that is not a URL at all, including the literal "null"', () => {
    // Los navegadores mandan `Origin: null` desde un iframe con sandbox o desde
    // file://, que es justo desde donde no se quiere aceptar nada.
    expect(isSameOriginRequest(post({ origin: 'null' }))).toBe(false);
    expect(isSameOriginRequest(post({ origin: 'basura' }))).toBe(false);
  });

  it('rejects a request with no Origin when Sec-Fetch-Site says it is cross-site', () => {
    // Sec-Fetch-Site lo pone el navegador y el JavaScript de una página no lo
    // puede falsificar, así que aquí sí es una señal fiable.
    expect(isSameOriginRequest(post({ 'sec-fetch-site': 'cross-site' }))).toBe(false);
    expect(isSameOriginRequest(post({ 'sec-fetch-site': 'same-site' }))).toBe(false);
  });

  it('accepts a request with no Origin when Sec-Fetch-Site says it is our own', () => {
    expect(isSameOriginRequest(post({ 'sec-fetch-site': 'same-origin' }))).toBe(true);
    expect(isSameOriginRequest(post({ 'sec-fetch-site': 'none' }))).toBe(true);
  });

  it('accepts a request with neither header, on purpose', () => {
    // Un cliente que no es un navegador (curl, un navegador viejo) no manda
    // ninguna de las dos. Bloquearlo aquí dejaría fuera a navegadores legítimos;
    // a ese caso le corresponde el limitador de peticiones, no esta comprobación.
    expect(isSameOriginRequest(post())).toBe(true);
  });
});
