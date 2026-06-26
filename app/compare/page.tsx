import type { Metadata } from 'next';
import Nav from '../components/Nav';

export const metadata: Metadata = {
  title: 'capabilities.txt vs llms.txt, mcp.json & OpenAPI',
  description:
    'How capabilities.txt compares to robots.txt, sitemap.xml, llms.txt, mcp.json, and OpenAPI — and why they compose rather than compete. capabilities.txt is the static discovery layer for what a site can do; it hands off to invocation.',
  alternates: { canonical: '/compare' },
};

const ROWS = [
  ['robots.txt', 'What may a crawler access?', 'Crawlers', 'Yes', 'Access control'],
  ['sitemap.xml', 'What pages exist?', 'Search engines', 'Yes', 'Indexing'],
  ['llms.txt', "What's worth reading?", 'LLMs reading', 'Yes', 'Curated content for models'],
  ['OpenAPI', 'Exact shape of an HTTP API', 'Developers / clients', 'Yes', 'Full API contract'],
  ['mcp.json', 'I run an MCP server', 'MCP clients', 'Yes (points to a server)', 'Advertise an MCP endpoint'],
  ['capabilities.txt', 'What can this host DO?', 'Agents acting', 'Yes', 'Discover invocable capabilities'],
];

const FAQ = [
  {
    q: 'capabilities.txt vs llms.txt',
    a: 'llms.txt says what content is worth reading; capabilities.txt says what you can do. Same spirit and format conventions, the next layer — reading vs. acting.',
  },
  {
    q: 'capabilities.txt vs mcp.json',
    a: 'mcp.json advertises that you run an MCP server, so discovery is connection-first (a client connects to learn the tools). capabilities.txt is invocation-agnostic and static — readable with no connection and no MCP client, and it can point at an MCP server, a plain HTTP API, anything. Most sites have a REST API and no MCP server. They compose: capabilities.txt is the catalog; mcp.json is one endpoint it hands off to.',
  },
  {
    q: 'capabilities.txt vs OpenAPI',
    a: 'OpenAPI is the detailed contract for an HTTP API. capabilities.txt is a one-screen, well-known, framework-agnostic advertisement of what you can do that can point at any invocation method. You generate a capabilities.txt from your OpenAPI — they are different altitudes of the same goal.',
  },
  {
    q: 'capabilities.txt vs MCP',
    a: 'MCP is how an agent invokes a tool over a live connection. capabilities.txt is the static, crawlable discovery layer before invocation; it points at your MCP server (or API) for the actual call. Complementary, not competing.',
  },
];

export default function ComparePage() {
  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  return (
    <div className="wrap">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <Nav />
      <header style={{ padding: '56px 0 16px' }}>
        <div className="mark">compare</div>
        <h1 style={{ fontSize: 'clamp(28px,5vw,42px)' }}>capabilities.txt vs llms.txt, mcp.json &amp; OpenAPI</h1>
        <p className="lede">
          The short version: they <em>compose</em>, they don’t compete. Each well-known file answers one question;
          capabilities.txt answers the one none of the others do — <strong>what can this host actually do?</strong>
        </p>
      </header>

      <section>
        <h2>Where each one sits</h2>
        <table>
          <tbody>
            <tr>
              <th>File</th>
              <th>Answers</th>
              <th>For</th>
              <th>Static?</th>
              <th>Job</th>
            </tr>
            {ROWS.map((r) => (
              <tr key={r[0]}>
                <td className={r[0] === 'capabilities.txt' ? 'accent' : undefined}>
                  <code>{r[0]}</code>
                </td>
                <td className={r[0] === 'capabilities.txt' ? 'accent' : undefined}>{r[1]}</td>
                <td>{r[2]}</td>
                <td>{r[3]}</td>
                <td>{r[4]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {FAQ.map((f) => (
        <section key={f.q}>
          <h2 style={{ textTransform: 'none', fontSize: 18, color: 'var(--ink)', letterSpacing: 0 }}>{f.q}</h2>
          <p className="muted">{f.a}</p>
        </section>
      ))}

      <section>
        <h2>Use them together</h2>
        <p className="muted">
          A site can publish all of them: <code>robots.txt</code> (crawl rules), <code>llms.txt</code> (what to read),
          and <code>capabilities.txt</code> (what to do) — which points at your OpenAPI or MCP server for invocation, and
          at <a href="https://capabilityhostprotocol.com">CHP</a> if you need governance and provable evidence for the
          actions. Discovery, invocation, and evidence are different jobs.
        </p>
        <p style={{ marginTop: 18 }}>
          <a className="cta primary" href="/generate">Generate your capabilities.txt</a>
          <a className="cta" href="/">Read the proposal</a>
        </p>
      </section>
    </div>
  );
}
