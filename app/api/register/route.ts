import { NextResponse } from 'next/server';
import { dbEnabled } from '../../lib/db';
import { registerSite } from '../../lib/registry';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  if (!dbEnabled) {
    return NextResponse.json({ error: 'The directory isn’t open yet — the registry database is being connected.' }, { status: 503 });
  }
  let body: { url?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }
  const input = String(body?.url ?? '').trim();
  if (!input) return NextResponse.json({ error: 'Provide a url.' }, { status: 400 });

  try {
    const result = await registerSite(input);
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Registration failed.' }, { status: 422 });
  }
}
