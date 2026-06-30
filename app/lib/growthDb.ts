// Growth funnel + first-party analytics persistence. SEPARATE Neon DB from the public
// registry (db.ts) — outreach data and analytics live here, not in the registry. Degrades
// gracefully: with no GROWTH_DATABASE_URL these features are disabled and the site keeps working.
import { neon, type NeonQueryFunction } from '@neondatabase/serverless';

const url = process.env.GROWTH_DATABASE_URL || '';

export const growthEnabled = Boolean(url);
export const growthSql: NeonQueryFunction<false, false> | null = url ? neon(url) : null;

export type EventInput = {
  event: string;
  domain?: string | null;
  path?: string | null;
  props?: Record<string, unknown>;
  session?: string | null;
};

// Fire-and-forget first-party event capture. Never throws to the caller — analytics must
// not break a page render or an API response.
export async function recordEvent(e: EventInput): Promise<void> {
  if (!growthSql) return;
  try {
    await growthSql`
      insert into events (event, domain, path, props, session)
      values (${e.event}, ${e.domain ?? null}, ${e.path ?? null},
              ${JSON.stringify(e.props ?? {})}::jsonb, ${e.session ?? null})
    `;
  } catch {
    // analytics is best-effort
  }
}

// Funnel rollup for the kill-gate dashboard. Returns stage counts; empty when disabled.
export async function funnelStats(): Promise<Record<string, number>> {
  if (!growthSql) return {};
  try {
    const rows = (await growthSql`select status, count(*)::int as n from targets group by status`) as { status: string; n: number }[];
    const out: Record<string, number> = {};
    for (const r of rows) out[r.status] = r.n;
    return out;
  } catch {
    return {};
  }
}
