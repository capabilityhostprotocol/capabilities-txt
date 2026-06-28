import type { Metadata } from 'next';
import Nav from '../components/Nav';

const PUBLISHED = '2026-06-28';
const TLDR =
  'AI agents discover what a website can do through well-known files and structured data: robots.txt (crawl rules), sitemap.xml (pages), llms.txt (what to read), capabilities.txt (what the site can do), schema.org potentialAction (page-embedded actions), and MCP (live invocation). capabilities.txt is the static, crawlable layer that declares a site’s invocable capabilities and hands off to an API or MCP server for the actual call.';

export const metadata: Metadata = {
  title: 'How AI agents discover what a website can do',
  description: TLDR,
  alternates: { canonical: '/how-agents-discover' },
};

const FAQ = [
  {
    q: 'How does an AI agent know what actions a website supports?',
    a: 'Today, mostly through bespoke per-vendor integrations. The emerging standard way is a capabilities.txt file at the site root that declares the invocable capabilities, optionally a structured /.well-known/capabilities.json, schema.org potentialAction markup on pages, and — for live invocation — an MCP server. An agent reads the static declarations to discover, then calls the API/MCP to act.',
  },
  {
    q: 'What is capabilities.txt?',
    a: 'An open convention: a /capabilities.txt file (markdown — categories and capability ids with descriptions) where a site declares what it can do, sibling to robots.txt and llms.txt. It is the discovery layer before invocation; it points at your MCP server or API for the actual call.',
  },
  {
    q: 'Is capabilities.txt the same as MCP or schema.org Action?',
    a: 'No — they compose. MCP invokes tools over a live connection; schema.org potentialAction embeds actions in page markup; capabilities.txt is a static, crawlable, well-known file that catalogs capabilities and points to either of them for invocation. A site can publish all three.',
  },
  {
    q: 'How do I make my site discoverable to AI agents?',
    a: 'Publish a /capabilities.txt (generate it from your OpenAPI in seconds), optionally emit schema.org potentialAction on key pages, expose an MCP server or API for invocation, and allow the AI crawlers (GPTBot, ClaudeBot, PerplexityBot, CCBot) in robots.txt. Then check it for conformance and list it so agents can find it.',
  },
];

const ROWS = [
  ['robots.txt', 'What may a crawler access?', 'Static file'],
  ['sitemap.xml', 'What pages exist?', 'Static file'],
  ['llms.txt', 'What content is worth reading?', 'Static file'],
  ['capabilities.txt', 'What can this site do?', 'Static file'],
  ['schema.org potentialAction', 'What actions can run on this page?', 'Page markup'],
  ['MCP', 'Invoke a tool (live)', 'Live connection'],
];

export default function HowAgentsDiscoverPage() {
  const ld = [
    {
      '@context': 'https://schema.org',
      '@type': 'TechArticle',
      headline: 'How AI agents discover what a website can do',
      description: TLDR,
      datePublished: PUBLISHED,
      dateModified: PUBLISHED,
      author: { '@type': 'Organization', name: 'Project Auxo, Inc.', url: 'https://capabilityhostprotocol.com' },
      publisher: { '@type': 'Organization', name: 'capabilities.txt' },
      url: 'https://capabilitiestxt.org/how-agents-discover',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: FAQ.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    },
  ];

  return (
    <div className="wrap">
      {ld.map((x, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(x) }} />
      ))}
      <Nav />
      <header style={{ padding: '56px 0 14px' }}>
        <div className="mark">explainer</div>
        <h1 style={{ fontSize: 'clamp(28px,5vw,42px)' }}>How AI agents discover what a website can do</h1>
        <p className="muted" style={{ fontSize: 13 }}>By Project Auxo · {PUBLISHED}</p>
      </header>

      <div className="next">
        <p style={{ margin: 0 }}>
          <strong>TL;DR.</strong> {TLDR}
        </p>
      </div>

      <section>
        <h2>The gap</h2>
        <p>
          AI agents can already <em>read</em> a site (via <code>llms.txt</code>) and respect its crawl rules (via{' '}
          <code>robots.txt</code>). What they have had no standard way to discover is what a site can <strong>do</strong>{' '}
          — check inventory, start a return, open a ticket — and how to call it. That discovery has happened through
          bespoke, one-vendor-at-a-time integrations, which doesn’t scale to a web where the fastest-growing visitor is
          software acting on a user’s behalf.
        </p>
      </section>

      <section>
        <h2>The layers an agent uses</h2>
        <table>
          <tbody>
            <tr>
              <th>Mechanism</th>
              <th>Answers</th>
              <th>Type</th>
            </tr>
            {ROWS.map((r) => (
              <tr key={r[0]}>
                <td className={r[0] === 'capabilities.txt' ? 'accent' : undefined}><code>{r[0]}</code></td>
                <td className={r[0] === 'capabilities.txt' ? 'accent' : undefined}>{r[1]}</td>
                <td>{r[2]}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="muted">
          They compose. <code>capabilities.txt</code> is the static, crawlable catalog of <em>what you can do</em>; it
          hands off to schema.org Action (page-level) or an API/MCP server (live) for the actual invocation.
        </p>
      </section>

      <section>
        <h2>How an agent does it, step by step</h2>
        <ol style={{ color: '#c7ccd1', paddingLeft: 22 }}>
          <li><strong>Discover</strong> — fetch <code>https://site/capabilities.txt</code> (or query the registry: <code>GET /api/discover?q=…</code>, or the registry MCP).</li>
          <li><strong>Choose</strong> — pick a capability by id and read its description.</li>
          <li><strong>Invoke</strong> — call it via the endpoint the file points to (MCP server, HTTP API, or a schema.org <code>potentialAction</code> EntryPoint).</li>
        </ol>
      </section>

      {FAQ.map((f) => (
        <section key={f.q}>
          <h2 style={{ textTransform: 'none', fontSize: 18, color: 'var(--ink)', letterSpacing: 0 }}>{f.q}</h2>
          <p className="muted">{f.a}</p>
        </section>
      ))}

      <section>
        <h2>Make your site discoverable</h2>
        <p>
          <a className="cta primary" href="/generate">Generate your capabilities.txt</a>
          <a className="cta" href="/connect">Use the registry in your agent</a>
          <a className="cta" href="/compare">Compare the standards</a>
        </p>
      </section>
    </div>
  );
}
