import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { destroySession } from '@/lib/auth/session';
import { CLIENT_COOKIE, cookieOptions } from '@/lib/auth/cookies';
import { isSameOriginRequest } from '@/lib/auth/origin-check';

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: 'Solicitud no permitida.' }, { status: 403 });
  }
  const jar = await cookies();
  const token = jar.get(CLIENT_COOKIE)?.value;
  await destroySession(token);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(CLIENT_COOKIE, '', { ...cookieOptions(0), maxAge: 0 });
  return response;
}
