import { NextResponse } from 'next/server';
import { recheckAll } from '../../../lib/registry';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// Daily re-check of listed sites (Vercel Cron — see vercel.json). When CRON_SECRET
// is set, Vercel sends it as a Bearer token; we require it so the endpoint isn't open.
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const result = await recheckAll();
  return NextResponse.json({ ok: true, ...result });
}
