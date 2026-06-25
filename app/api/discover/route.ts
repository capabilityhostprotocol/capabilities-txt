import { NextResponse } from 'next/server';
import { dbEnabled } from '../../lib/db';
import { discover, stats } from '../../lib/registry';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Agent-queryable discovery over the whole registry: "who across the web can do X".
const CORS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

export async function GET(req: Request) {
  if (!dbEnabled) {
    return NextResponse.json({ error: 'The registry is not configured yet.' }, { status: 503, headers: CORS });
  }
  const q = new URL(req.url).searchParams.get('q')?.trim() ?? '';
  if (!q) {
    return NextResponse.json(
      {
        stats: await stats(),
        hint: 'Query the registry: /api/discover?q=<capability or keyword>, e.g. ?q=check_stock. Each result names the site and how it grades; fetch that site\'s /capabilities.txt to see how to invoke it.',
      },
      { headers: CORS },
    );
  }
  const results = await discover(q);
  return NextResponse.json({ query: q, count: results.length, results }, { headers: CORS });
}

export async function OPTIONS() {
  return new Response(null, { headers: CORS });
}
