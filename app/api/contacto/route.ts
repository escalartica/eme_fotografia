import { saveContactSubmission, ContactValidationError } from '@/lib/contact-store';

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: 'El cuerpo de la petición no es JSON válido.' }, { status: 400 });
  }

  try {
    const { id } = await saveContactSubmission(payload as Parameters<typeof saveContactSubmission>[0]);
    return Response.json({ id }, { status: 200 });
  } catch (err) {
    if (err instanceof ContactValidationError) {
      return Response.json({ error: err.message }, { status: 400 });
    }
    // Unexpected error (e.g. filesystem failure) — never leak internal details to the client.
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
