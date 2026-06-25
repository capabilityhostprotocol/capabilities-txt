import type { Metadata } from 'next';
import Nav from '../components/Nav';
import { dbEnabled } from '../lib/db';
import { listSites, searchSites } from '../lib/registry';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Directory — capabilities.txt',
  description: 'Sites that publish a conformant capabilities.txt — a growing map of what the web can do.',
  alternates: { canonical: '/directory' },
};

export default async function DirectoryPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const query = (q ?? '').trim();
  const sites = dbEnabled ? (query ? await searchSites(query) : await listSites()) : [];

  return (
    <div className="wrap">
      <Nav />
      <header style={{ padding: '56px 0 16px' }}>
        <div className="mark">
          directory{dbEnabled ? ` · ${sites.length} ${sites.length === 1 ? 'site' : 'sites'}` : ''}
        </div>
        <h1 style={{ fontSize: 'clamp(30px,5vw,44px)' }}>The capabilities.txt directory</h1>
        <p className="lede">Sites that publish a conformant capabilities.txt — the start of a map of what the web can do.</p>
      </header>

      <form className="field" method="get">
        <input type="text" name="q" defaultValue={query} placeholder="Search domains or capabilities (e.g. check_stock)" aria-label="Search the directory" />
        <button className="cta primary" type="submit" style={{ margin: 0 }}>Search</button>
      </form>

      {!dbEnabled && (
        <p className="rec warn">
          The directory is being connected to its database — check back shortly. In the meantime,{' '}
          <a href="/submit">check your file</a> or <a href="/implement">generate one</a>.
        </p>
      )}

      {dbEnabled && sites.length === 0 && (
        <p className="muted">
          {query ? 'No matches. ' : 'No sites listed yet — '}
          <a href="/submit">{query ? 'Add yours' : 'be the first'}</a>.
        </p>
      )}

      {sites.length > 0 && (
        <table>
          <tbody>
            <tr>
              <th>Site</th>
              <th>Grade</th>
              <th>Capabilities</th>
            </tr>
            {sites.map((s) => (
              <tr key={s.domain}>
                <td>
                  <a href={`https://${s.domain}/capabilities.txt`}>{s.domain}</a>{' '}
                  <a href={`/check/${s.domain}`} className="muted" style={{ fontSize: 12 }}>report →</a>
                </td>
                <td>
                  <span className={`g g-${s.grade}`} style={{ fontWeight: 700, fontFamily: 'var(--mono, monospace)' }}>{s.grade}</span>
                </td>
                <td>{s.cap_count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <section style={{ marginTop: 40 }}>
        <p className="muted">
          Listed sites are re-checked regularly. <a href="/submit">Add yours</a> · <a href="/implement">generate one</a>.
        </p>
      </section>
    </div>
  );
}
