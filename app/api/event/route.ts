import { NextResponse } from 'next/server';
import { recordEvent } from '../../lib/growthDb';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// First-party analytics capture. POST { event, domain?, path?, props?, session? }.
// Best-effort: always returns ok, never blocks the client. No PII expected.
export async function POST(req: Request) {
  let body: { event?: string; domain?: string; path?: string; props?: Record<string, unknown>; session?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const event = String(body?.event ?? '').trim().slice(0, 64);
  if (!event) return NextResponse.json({ ok: false }, { status: 400 });

  await recordEvent({
    event,
    domain: body.domain ? String(body.domain).slice(0, 255) : null,
    path: body.path ? String(body.path).slice(0, 512) : null,
    props: body.props && typeof body.props === 'object' ? body.props : {},
    session: body.session ? String(body.session).slice(0, 64) : null,
  });
  return NextResponse.json({ ok: true });
}
