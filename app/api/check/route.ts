import { NextResponse } from 'next/server';
import { analyze } from '../../lib/conformance';
import { fetchCapabilities } from '../../lib/fetchCapabilities';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  let body: { url?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }
  const input = String(body?.url ?? '').trim();
  if (!input) return NextResponse.json({ error: 'Provide a url.' }, { status: 400 });

  try {
    const { sourceUrl, text } = await fetchCapabilities(input);
    const report = analyze(text);
    return NextResponse.json({ sourceUrl, ...report });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Check failed.';
    return NextResponse.json({ error: message }, { status: 422 });
  }
}
