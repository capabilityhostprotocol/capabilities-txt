import { NextResponse } from 'next/server';
import { generateFromOpenApi } from '../../lib/fromOpenapi';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function fetchOpenApi(input: string): Promise<{ sourceUrl: string; doc: Record<string, unknown> }> {
  let raw = input.trim();
  if (!/^https?:\/\//i.test(raw)) raw = 'https://' + raw;
  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    throw new Error('That doesn’t look like a valid URL or domain.');
  }
  const looksLikeSpec = /openapi|swagger|\.json$/i.test(u.pathname);
  const candidates = looksLikeSpec
    ? [u.toString()]
    : [`${u.origin}/openapi.json`, `${u.origin}/.well-known/openapi.json`, `${u.origin}/swagger.json`, u.toString()];

  for (const c of candidates) {
    try {
      const res = await fetch(c, {
        headers: { 'User-Agent': 'capabilitiestxt.org-generator/0.1 (+https://capabilitiestxt.org)' },
        signal: AbortSignal.timeout(12000),
        redirect: 'follow',
      });
      if (res.ok) {
        const txt = (await res.text()).slice(0, 4_000_000);
        try {
          const doc = JSON.parse(txt);
          if (doc && (doc.openapi || doc.swagger || doc.paths)) return { sourceUrl: c, doc };
        } catch {
          /* not JSON — try next */
        }
      }
    } catch {
      /* try next candidate */
    }
  }
  throw new Error('Could not find an OpenAPI JSON there. Paste a direct link to your openapi.json (YAML isn’t supported yet).');
}

export async function POST(req: Request) {
  let body: { url?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }
  const input = String(body?.url ?? '').trim();
  if (!input) return NextResponse.json({ error: 'Provide an OpenAPI URL or a domain.' }, { status: 400 });

  try {
    const { sourceUrl, doc } = await fetchOpenApi(input);
    const capabilitiesTxt = generateFromOpenApi(doc);
    return NextResponse.json({ sourceUrl, capabilitiesTxt });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Generation failed.' }, { status: 422 });
  }
}
