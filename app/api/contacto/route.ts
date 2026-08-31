import { saveContactSubmission } from '@/lib/contact-store';

export async function POST(request: Request) {
  const payload = await request.json();
  try {
    const { id } = await saveContactSubmission(payload);
    return Response.json({ id }, { status: 200 });
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 400 });
  }
}
