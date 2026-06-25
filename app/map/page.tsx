import type { Metadata } from 'next';
import Nav from '../components/Nav';
import { dbEnabled } from '../lib/db';
import { discover, stats } from '../lib/registry';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'The capability map — capabilities.txt',
  description: 'Search capabilities across every site in the registry — discover who across the web can do what.',
  alternates: { canonical: '/map' },
};

export default async function MapPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const query = (q ?? '').trim();
  const s = dbEnabled ? await stats() : { sites: 0, capabilities: 0, categories: 0 };
  const hits = dbEnabled && query ? await discover(query) : [];

  return (
    <div className="wrap">
      <Nav />
      <header style={{ padding: '56px 0 14px' }}>
        <div className="mark">the capability map</div>
        <h1 style={{ fontSize: 'clamp(30px,5vw,44px)' }}>What can the web do?</h1>
        <p className="lede">Search capabilities across every site in the registry — discover who can do what.</p>
        <p className="muted" style={{ fontSize: 14 }}>
          {s.sites} sites · {s.capabilities} capabilities · {s.categories} categories indexed. Agents: query{' '}
          <a href="/api/discover">/api/discover</a> or connect the <a href="/api/mcp">registry MCP server</a>.
        </p>
      </header>

      <form className="field" method="get">
        <input type="text" name="q" defaultValue={query} placeholder="What do you need done? e.g. check_stock, refund, deploy" aria-label="Search capabilities" />
        <button className="cta primary" type="submit" style={{ margin: 0 }}>Discover</button>
      </form>

      {!dbEnabled && <p className="rec warn">The registry is being connected to its database — check back shortly.</p>}

      {dbEnabled && query && hits.length === 0 && (
        <p className="muted">No capabilities match “{query}” yet. <a href="/submit">Add a site</a> to the registry.</p>
      )}

      {hits.length > 0 && (
        <table>
          <tbody>
            <tr>
              <th>Capability</th>
              <th>Offered by</th>
              <th></th>
            </tr>
            {hits.map((h, i) => (
              <tr key={`${h.domain}-${h.id}-${i}`}>
                <td>
                  <code>{h.id}</code>
                  {h.version ? ` v${h.version}` : ''}
                  {h.description && <div className="muted" style={{ fontSize: 13, marginTop: 3 }}>{h.description}</div>}
                </td>
                <td>
                  <a href={`https://${h.domain}/capabilities.txt`}>{h.domain}</a>{' '}
                  <span className={`g g-${h.grade}`} style={{ fontWeight: 700 }}>{h.grade}</span>
                </td>
                <td><a href={`/check/${h.domain}`} className="muted" style={{ fontSize: 12 }}>report →</a></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {dbEnabled && !query && (
        <p className="muted" style={{ marginTop: 30 }}>
          Try a verb: <a href="/map?q=create">create</a> · <a href="/map?q=check">check</a> · <a href="/map?q=deny">deny</a> ·{' '}
          <a href="/map?q=evidence">evidence</a>. Or <a href="/submit">add a site</a> to grow the map.
        </p>
      )}
    </div>
  );
}
