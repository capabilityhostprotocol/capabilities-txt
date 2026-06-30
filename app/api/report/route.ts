import { NextResponse } from 'next/server';
import { gradeAgentReadiness } from '../../lib/agentReadiness';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

// JSON bridge for the agent-readiness grade — the single source of truth reused by the
// /report pages, the MCP, and the Growth pipeline runner. GET /api/report?domain=example.com
export async function GET(req: Request) {
  const domain = new URL(req.url).searchParams.get('domain')?.trim();
  if (!domain) {
    return NextResponse.json({ error: 'Provide ?domain=example.com' }, { status: 400 });
  }
  try {
    const report = await gradeAgentReadiness(domain);
    return NextResponse.json(report, {
      headers: { 'cache-control': 'public, s-maxage=3600, stale-while-revalidate=86400' },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Grading failed.';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
