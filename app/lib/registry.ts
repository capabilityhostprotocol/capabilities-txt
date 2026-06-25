// Registry operations (Phase 2): register a conformant site, list/search the
// directory, and re-check freshness. All no-op-safe when the DB isn't configured.
import { sql, type SiteRow } from './db';
import { fetchCapabilities } from './fetchCapabilities';
import { analyze } from './conformance';

const MAX_CAPS_STORED = 1000;

function hostOf(u: string): string {
  try {
    return new URL(u).host;
  } catch {
    return '';
  }
}

export async function registerSite(input: string): Promise<{ domain: string; grade: string; count: number }> {
  if (!sql) throw new Error('The registry database isn’t connected yet.');
  const { sourceUrl, text } = await fetchCapabilities(input);
  const report = analyze(text);
  if (!report.ok) throw new Error('That isn’t a valid capabilities.txt yet — fix the conformance errors first.');
  const domain = hostOf(sourceUrl);
  if (!domain) throw new Error('Could not determine the domain.');

  await sql`
    insert into sites (domain, capabilities_url, grade, score, cap_count, status, last_checked)
    values (${domain}, ${sourceUrl}, ${report.grade}, ${report.score}, ${report.capabilities.length}, 'active', now())
    on conflict (domain) do update set
      capabilities_url = excluded.capabilities_url, grade = excluded.grade,
      score = excluded.score, cap_count = excluded.cap_count, status = 'active', last_checked = now()`;

  await sql`delete from capabilities where domain = ${domain}`;
  const caps = report.capabilities.slice(0, MAX_CAPS_STORED);
  if (caps.length) {
    await sql`
      insert into capabilities (domain, capability_id, version, description, category)
      select ${domain}, * from unnest(
        ${caps.map((c) => c.id)}::text[],
        ${caps.map((c) => c.version)}::text[],
        ${caps.map((c) => c.description)}::text[],
        ${caps.map((c) => c.category)}::text[]
      )
      on conflict (domain, capability_id) do nothing`;
  }
  return { domain, grade: report.grade, count: caps.length };
}

export async function listSites(): Promise<SiteRow[]> {
  if (!sql) return [];
  return (await sql`
    select * from sites where status = 'active'
    order by score desc, last_checked desc limit 500`) as SiteRow[];
}

export async function searchSites(q: string): Promise<SiteRow[]> {
  if (!sql) return [];
  const like = `%${q}%`;
  return (await sql`
    select distinct s.* from sites s
    left join capabilities c on c.domain = s.domain
    where s.status = 'active'
      and (s.domain ilike ${like} or c.capability_id ilike ${like} or c.description ilike ${like})
    order by s.score desc limit 200`) as SiteRow[];
}

export async function recheckAll(limit = 200): Promise<{ checked: number; dead: number }> {
  if (!sql) return { checked: 0, dead: 0 };
  const rows = (await sql`select domain from sites order by last_checked asc limit ${limit}`) as { domain: string }[];
  let dead = 0;
  for (const { domain } of rows) {
    try {
      const { text } = await fetchCapabilities(domain);
      const r = analyze(text);
      if (r.ok) {
        await sql`update sites set grade=${r.grade}, score=${r.score}, cap_count=${r.capabilities.length}, status='active', last_checked=now() where domain=${domain}`;
      } else {
        dead++;
        await sql`update sites set status='dead', last_checked=now() where domain=${domain}`;
      }
    } catch {
      dead++;
      await sql`update sites set status='dead', last_checked=now() where domain=${domain}`;
    }
  }
  return { checked: rows.length, dead };
}
