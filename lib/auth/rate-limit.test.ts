// @vitest-environment node
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { checkRateLimit, recordAttempt, consume, clientKeyFrom, __resetRateLimits } from './rate-limit';

const WINDOW = 1000;

beforeEach(() => {
  // Los contadores viven en un Map de módulo, compartido por todos los tests
  // del proceso: sin este reset el orden de ejecución decidiría cuál se come el
  // límite, y el fallo aparecería en un test que no tiene nada que ver.
  __resetRateLimits();
});

afterEach(() => {
  vi.useRealTimers();
  __resetRateLimits();
});

/** Un intento completo tal y como lo hacen las rutas de login: comprobar y, pase
 * o no, contar. */
function attempt(key: string, max: number, windowMs: number = WINDOW): boolean {
  const allowed = checkRateLimit(key, max, windowMs);
  recordAttempt(key, windowMs);
  return allowed;
}

describe('checkRateLimit / recordAttempt', () => {
  it('lets exactly `max` attempts through and then cuts off', () => {
    const results = [attempt('k', 3), attempt('k', 3), attempt('k', 3), attempt('k', 3)];
    expect(results).toEqual([true, true, true, false]);
  });

  it('keeps refusing while the window is still open', () => {
    for (let i = 0; i < 3; i++) attempt('k', 3);
    expect(attempt('k', 3)).toBe(false);
    expect(attempt('k', 3)).toBe(false);
  });

  it('lets attempts through again once the window has expired', () => {
    vi.useFakeTimers();
    for (let i = 0; i < 3; i++) attempt('k', 3);
    expect(attempt('k', 3)).toBe(false);
    vi.advanceTimersByTime(WINDOW + 1);
    expect(attempt('k', 3)).toBe(true);
  });

  it('does not expire the window early', () => {
    // Si la ventana caducase antes de tiempo, el límite no frenaría nada: basta
    // con esperar un poco menos entre tandas.
    vi.useFakeTimers();
    for (let i = 0; i < 3; i++) attempt('k', 3);
    vi.advanceTimersByTime(WINDOW - 1);
    expect(attempt('k', 3)).toBe(false);
  });

  it('counts each key separately', () => {
    for (let i = 0; i < 3; i++) attempt('galeria:boda-ana', 3);
    expect(attempt('galeria:boda-ana', 3)).toBe(false);
    // Que una pareja agote sus intentos no puede dejar fuera a otra.
    expect(attempt('galeria:boda-eva', 3)).toBe(true);
  });

  it('uses the caller-supplied max instead of a single global one', () => {
    expect(attempt('generosa', 5)).toBe(true);
    for (let i = 0; i < 4; i++) attempt('generosa', 5);
    expect(attempt('generosa', 5)).toBe(false);
  });
});

describe('el tope global no se puede saltar cambiando de IP', () => {
  it('still cuts off after `max` attempts even when every attempt comes from a new IP', () => {
    // X-Forwarded-For lo pone quien llama: un atacante se da una IP nueva en
    // cada petición y el cubo por IP no frena nada. Por eso todas las rutas de
    // login combinan ese cubo con otro global que no depende de ninguna
    // cabecera. Este test es esa garantía.
    const perIp: boolean[] = [];
    const global: boolean[] = [];
    for (let i = 0; i < 6; i++) {
      perIp.push(checkRateLimit(`admin:ip:10.0.0.${i}`, 8, WINDOW));
      global.push(checkRateLimit('admin:cuenta', 5, WINDOW));
      recordAttempt(`admin:ip:10.0.0.${i}`, WINDOW);
      recordAttempt('admin:cuenta', WINDOW);
    }
    expect(perIp).toEqual([true, true, true, true, true, true]);
    expect(global).toEqual([true, true, true, true, true, false]);
  });
});

describe('consume', () => {
  it('checks and counts in one call, for routes where every request counts', () => {
    expect([consume('c', 3, WINDOW), consume('c', 3, WINDOW), consume('c', 3, WINDOW), consume('c', 3, WINDOW)]).toEqual(
      [true, true, true, false]
    );
  });

  it('reopens after the window expires', () => {
    vi.useFakeTimers();
    for (let i = 0; i < 3; i++) consume('c', 3, WINDOW);
    expect(consume('c', 3, WINDOW)).toBe(false);
    vi.advanceTimersByTime(WINDOW + 1);
    expect(consume('c', 3, WINDOW)).toBe(true);
  });
});

describe('clientKeyFrom', () => {
  it('uses the first entry of X-Forwarded-For, which is the original client', () => {
    const request = new Request('http://localhost/', { headers: { 'x-forwarded-for': '1.2.3.4, 5.6.7.8' } });
    expect(clientKeyFrom(request)).toBe('1.2.3.4');
  });

  it('falls back to X-Real-IP, trimmed', () => {
    const request = new Request('http://localhost/', { headers: { 'x-real-ip': ' 9.9.9.9 ' } });
    expect(clientKeyFrom(request)).toBe('9.9.9.9');
  });

  it('returns a constant key when there is no hint at all', () => {
    // Todas las peticiones sin cabeceras comparten cubo: no es identidad, es lo
    // único que se puede saber, y comparten el límite a propósito.
    expect(clientKeyFrom(new Request('http://localhost/'))).toBe('unknown');
  });

  it('does not let an empty header produce an empty key', () => {
    const request = new Request('http://localhost/', { headers: { 'x-forwarded-for': '' } });
    expect(clientKeyFrom(request)).toBe('unknown');
  });
});

describe('__resetRateLimits', () => {
  it('clears every counter', () => {
    for (let i = 0; i < 3; i++) attempt('k', 3);
    expect(attempt('k', 3)).toBe(false);
    __resetRateLimits();
    expect(attempt('k', 3)).toBe(true);
  });
});
