import type { Metadata } from 'next';
import Nav from '../../components/Nav';

const PUBLISHED = '2026-06-28';
const TLDR =
  'Modern websites expose a small set of "well-known" files that automated readers fetch by convention: robots.txt (what a crawler may access), sitemap.xml (what pages exist), llms.txt (what is worth reading), and capabilities.txt (what the site can do). They compose rather than compete — robots and sitemap serve crawlers, llms.txt serves LLMs reading, and capabilities.txt serves agents acting. To be ready for AI agents, publish all four and allow the AI crawlers.';

export const metadata: Metadata = {
  title: 'The well-known files every site needs for AI agents',
  description: TLDR,
  alternates: { canonical: '/guides/well-known-files-for-ai-agents' },
};

const ROWS = [
  ['robots.txt', 'What may a crawler access?', 'Crawlers', '/robots.txt'],
  ['sitemap.xml', 'What pages exist?', 'Search engines', '/sitemap.xml'],
  ['llms.txt', "What's worth reading?", 'LLMs reading', '/llms.txt'],
  ['capabilities.txt', 'What can this site do?', 'Agents acting', '/capabilities.txt'],
];

const FAQ = [
  {
    q: 'What is a well-known file?',
    a: 'A file published at a predictable, conventional path (the site root or under /.well-known/) that automated clients fetch without being told where it is. robots.txt is the original example; sitemap.xml, llms.txt, and capabilities.txt follow the same idea. The value is zero-coordination discovery: any agent knows the path in advance.',
  },
  {
    q: 'Do these files replace each other?',
    a: 'No — they answer different questions and compose. robots.txt sets crawl permissions, sitemap.xml lists pages, llms.txt points at the content worth reading, and capabilities.txt declares what the site can do (its invocable capabilities). A complete site publishes all four; each serves a different automated reader.',
  },
  {
    q: 'Which ones do AI agents actually use?',
    a: 'Agentic and IDE tooling already fetches robots.txt and llms.txt at inference time because static files are more context-efficient than parsing HTML. capabilities.txt extends that same habit to action: it tells an agent what it can do and where to call, with no live connection required. As agents shift from reading to acting, capabilities.txt is the file that matters for invocation.',
  },
  {
    q: 'Where do I put capabilities.txt — root or /.well-known/?',
    a: 'Publish the human- and agent-readable markdown form at the root: /capabilities.txt, sibling to robots.txt and llms.txt. Optionally also publish the structured form at /.well-known/capabilities.json for agents that want machine-resolvable descriptors. Both are valid; the root file is the primary one.',
  },
  {
    q: 'How do I make sure AI crawlers can read them?',
    a: 'Explicitly allow both the training crawlers (GPTBot, Google-Extended, CCBot) and the search crawlers (OAI-SearchBot, PerplexityBot, ClaudeBot) in robots.txt. Files an agent or answer engine cannot fetch cannot be discovered or cited. Welcoming the AI crawlers is an adopter best-practice, not a risk — these files only advertise, they grant nothing.',
  },
];

export default function WellKnownFilesPage() {
  const ld = [
    {
      '@context': 'https://schema.org',
      '@type': 'TechArticle',
      headline: 'The well-known files every site needs for AI agents',
      description: TLDR,
      datePublished: PUBLISHED,
      dateModified: PUBLISHED,
      author: { '@type': 'Organization', name: 'Project Auxo, Inc.', url: 'https://capabilityhostprotocol.com' },
      publisher: { '@type': 'Organization', name: 'capabilities.txt' },
      url: 'https://capabilitiestxt.org/guides/well-known-files-for-ai-agents',
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
        <div className="mark">guide</div>
        <h1 style={{ fontSize: 'clamp(28px,5vw,42px)' }}>The well-known files every site needs for AI agents</h1>
        <p className="muted" style={{ fontSize: 13 }}>By Project Auxo · {PUBLISHED}</p>
      </header>

      <div className="next">
        <p style={{ margin: 0 }}>
          <strong>TL;DR.</strong> {TLDR}
        </p>
      </div>

      <section>
        <h2>The four files</h2>
        <table>
          <tbody>
            <tr>
              <th>File</th>
              <th>Answers</th>
              <th>For</th>
              <th>Path</th>
            </tr>
            {ROWS.map((r) => (
              <tr key={r[0]}>
                <td className={r[0] === 'capabilities.txt' ? 'accent' : undefined}><code>{r[0]}</code></td>
                <td className={r[0] === 'capabilities.txt' ? 'accent' : undefined}>{r[1]}</td>
                <td>{r[2]}</td>
                <td><code>{r[3]}</code></td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="muted">
          The web taught machines to read in layers. Each file answers one narrow question for an automated reader, and
          together they let an agent go from "may I look" to "what can I do" with nothing but static fetches.
        </p>
      </section>

      <section>
        <h2>robots.txt — permissions</h2>
        <p>
          The original well-known file. It tells crawlers what they may and may not access. For the agentic web, the
          important move is to <strong>explicitly allow the AI crawlers</strong> — both training (GPTBot,
          Google-Extended, CCBot) and search (OAI-SearchBot, PerplexityBot, ClaudeBot) — so the rest of your files are
          discoverable and citable.
        </p>
      </section>

      <section>
        <h2>sitemap.xml — inventory</h2>
        <p>
          A list of the pages that exist, for search engines and crawlers. It answers "what is here," not "what can I
          do." Reference it from robots.txt with a <code>Sitemap:</code> line.
        </p>
      </section>

      <section>
        <h2>llms.txt — what to read</h2>
        <p>
          A markdown file pointing an LLM at the content worth reading — docs, key pages, context — so it does not have
          to crawl and parse your whole HTML site. It spread because IDE agents fetch it at inference time: static and
          context-efficient. It is the <em>reading</em> sibling of capabilities.txt.
        </p>
      </section>

      <section>
        <h2>capabilities.txt — what you can do</h2>
        <p>
          The missing layer none of the others cover: a declaration of the capabilities an agent can <em>invoke</em>,
          with a pointer to where the call goes (your API or an MCP server). It is static and crawlable — an agent reads
          it with no live connection — and it hands off invocation to whatever you already run. This is the file that
          turns a readable site into an actionable one.
        </p>
        <p className="muted">
          New to it? Start with <a href="/guides/agent-ready-api">the 10-minute guide</a>, or read{' '}
          <a href="/how-agents-discover">how AI agents discover what a site can do</a>.
        </p>
      </section>

      {FAQ.map((f) => (
        <section key={f.q}>
          <h2 style={{ textTransform: 'none', fontSize: 18, color: 'var(--ink)', letterSpacing: 0 }}>{f.q}</h2>
          <p className="muted">{f.a}</p>
        </section>
      ))}

      <section>
        <h2>Publish all four</h2>
        <p>
          Beyond discovery, the next questions for any consequential action — <em>may I</em>, <em>what happened</em>,{' '}
          <em>can I prove it</em> — are governance and evidence, defined by the{' '}
          <a href="https://capabilityhostprotocol.com">Capability Host Protocol</a>. capabilities.txt is the public face
          of that stack.
        </p>
        <p style={{ marginTop: 18 }}>
          <a className="cta primary" href="/generate">Generate your capabilities.txt</a>
          <a className="cta" href="/guides/agent-ready-api">Make your API agent-ready</a>
          <a className="cta" href="/compare">Compare the standards</a>
        </p>
      </section>
    </div>
  );
}
