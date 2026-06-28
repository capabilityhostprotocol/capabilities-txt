import type { Metadata } from 'next';
import Nav from '../../components/Nav';

const PUBLISHED = '2026-06-28';
const TLDR =
  'To make your API agent-ready, publish a /capabilities.txt at your site root that declares what your API can do, allow the AI crawlers in robots.txt, and point the file at your existing API or MCP server for invocation. An agent then discovers your capabilities with a single static fetch — no bespoke integration. You can do it in about ten minutes: generate the file from your OpenAPI, publish it, and check it for conformance.';

export const metadata: Metadata = {
  title: 'Make your API agent-ready in 10 minutes',
  description: TLDR,
  alternates: { canonical: '/guides/agent-ready-api' },
};

const FAQ = [
  {
    q: 'What does "agent-ready" mean for an API?',
    a: 'An agent-ready API is one an AI agent can discover and call without a custom, per-vendor integration. Concretely: there is a static, crawlable declaration of what the API can do (a /capabilities.txt), the AI crawlers are allowed to read it, and it points at a real invocation endpoint (your HTTP API or an MCP server). The agent reads the declaration, picks a capability, and calls it.',
  },
  {
    q: 'How long does it actually take?',
    a: 'About ten minutes if you already have an OpenAPI description: generate the capabilities.txt from it, commit the file at your web root, add the AI crawlers to robots.txt, and run a conformance check. No OpenAPI? Hand the implement prompt to your coding agent and it writes the file from your real routes.',
  },
  {
    q: 'Do I need to build an MCP server first?',
    a: 'No. capabilities.txt is invocation-agnostic — it can point at a plain REST API, a gRPC service, or an MCP server. Most sites have an HTTP API and no MCP server, and capabilities.txt works for them today. MCP is one of the endpoints you can hand off to, not a prerequisite.',
  },
  {
    q: 'Does declaring capabilities expose my API to abuse?',
    a: 'No. capabilities.txt only advertises what you already expose; it grants nothing. Authentication, rate limits, and authorization stay on your invocation endpoint. Declaring a capability is not the same as leaving it open — it is the equivalent of a menu, not an unlocked door.',
  },
  {
    q: 'How is this different from just publishing my OpenAPI spec?',
    a: 'OpenAPI describes the full shape of an HTTP API in detail, for developers. capabilities.txt is a one-screen, human- and agent-readable advertisement of what you can do, published at a well-known path, framework-agnostic, and able to point at any invocation method. You generate the capabilities.txt from your OpenAPI — they compose.',
  },
];

const STEPS = [
  ['1', 'Generate', 'Turn your OpenAPI description into a capabilities.txt (or hand the implement prompt to your coding agent).'],
  ['2', 'Publish', 'Commit the file at https://yoursite.com/capabilities.txt — sibling to robots.txt and llms.txt.'],
  ['3', 'Allow', 'Welcome the AI crawlers (GPTBot, ClaudeBot, PerplexityBot, CCBot) in robots.txt so they can read it.'],
  ['4', 'Point', 'Make sure the file references your real invocation endpoint — your API base URL or MCP server.'],
  ['5', 'Check', 'Run a conformance check for a grade + badge, and list it so agents can discover it.'],
];

export default function AgentReadyApiPage() {
  const ld = [
    {
      '@context': 'https://schema.org',
      '@type': 'TechArticle',
      headline: 'Make your API agent-ready in 10 minutes',
      description: TLDR,
      datePublished: PUBLISHED,
      dateModified: PUBLISHED,
      author: { '@type': 'Organization', name: 'Project Auxo, Inc.', url: 'https://capabilityhostprotocol.com' },
      publisher: { '@type': 'Organization', name: 'capabilities.txt' },
      url: 'https://capabilitiestxt.org/guides/agent-ready-api',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      name: 'Make your API agent-ready',
      description: 'Publish a capabilities.txt, allow the AI crawlers, and point it at your invocation endpoint.',
      step: STEPS.map((s) => ({ '@type': 'HowToStep', position: Number(s[0]), name: s[1], text: s[2] })),
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
        <h1 style={{ fontSize: 'clamp(28px,5vw,42px)' }}>Make your API agent-ready in 10 minutes</h1>
        <p className="muted" style={{ fontSize: 13 }}>By Project Auxo · {PUBLISHED}</p>
      </header>

      <div className="next">
        <p style={{ margin: 0 }}>
          <strong>TL;DR.</strong> {TLDR}
        </p>
      </div>

      <section>
        <h2>The problem</h2>
        <p>
          AI agents are the fastest-growing visitors to most APIs, and they arrive with no standard way to learn what
          your API can <em>do</em>. Today that gap is filled by bespoke, one-vendor-at-a-time integrations — someone
          hand-writes a wrapper for your API inside each agent platform. That does not scale, and it means your API is
          invisible to every agent nobody has hand-wired yet.
        </p>
        <p>
          Being <strong>agent-ready</strong> closes that gap with static files an agent already knows how to fetch — the
          same cheap infrastructure that made <code>robots.txt</code> and <code>llms.txt</code> universal.
        </p>
      </section>

      <section>
        <h2>Five steps</h2>
        <table>
          <tbody>
            <tr>
              <th style={{ width: 40 }}>#</th>
              <th>Step</th>
              <th>What you do</th>
            </tr>
            {STEPS.map((s) => (
              <tr key={s[0]}>
                <td className="accent">{s[0]}</td>
                <td className="accent">{s[1]}</td>
                <td>{s[2]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h2>Step 1 — Generate</h2>
        <p>
          If you publish an OpenAPI description, you already have everything needed. Point the generator at it and get a
          conformant <code>capabilities.txt</code> back in seconds:
        </p>
        <pre><code># hosted: paste your OpenAPI URL at capabilitiestxt.org/generate
# or from the command line:
python tools/from_openapi.py https://api.yoursite.com/openapi.json &gt; capabilities.txt</code></pre>
        <p className="muted">
          No OpenAPI? <a href="/implement">Copy the implement prompt</a> and hand it to your AI coding agent — it reads
          your real routes and writes the file, finding the consequential actions (place order, start a return, open a
          ticket), not just the read-only endpoints.
        </p>
      </section>

      <section>
        <h2>Step 2 — Publish at the well-known path</h2>
        <p>
          Commit the file so it is served at <code>https://yoursite.com/capabilities.txt</code> — a sibling to
          <code>robots.txt</code>. Optionally also publish the structured form at
          <code>/.well-known/capabilities.json</code> for agents that want machine-resolvable descriptors.
        </p>
      </section>

      <section>
        <h2>Step 3 — Allow the AI crawlers</h2>
        <p>
          A declaration nobody can read is useless. Explicitly welcome both the training and search crawlers in
          <code>robots.txt</code> so your capabilities are discoverable and citable:
        </p>
        <pre><code>User-agent: GPTBot
Allow: /
User-agent: ClaudeBot
Allow: /
User-agent: PerplexityBot
Allow: /
User-agent: CCBot
Allow: /</code></pre>
      </section>

      <section>
        <h2>Step 4 — Point at your invocation endpoint</h2>
        <p>
          capabilities.txt does <em>discovery</em>; it hands off <em>invocation</em>. The summary blockquote and each
          capability should make clear where the actual call goes — your HTTP API base URL, or an MCP server if you run
          one. The agent reads the file with no connection, then calls the endpoint to act.
        </p>
      </section>

      <section>
        <h2>Step 5 — Check and list it</h2>
        <p>
          <a href="/submit">Run a conformance check</a> for a grade (A–F), a fix list, and a badge for your README. A
          passing file is automatically discoverable in the <a href="/directory">directory</a> and
          <a href="/map"> capability map</a>, so agents can find you.
        </p>
      </section>

      {FAQ.map((f) => (
        <section key={f.q}>
          <h2 style={{ textTransform: 'none', fontSize: 18, color: 'var(--ink)', letterSpacing: 0 }}>{f.q}</h2>
          <p className="muted">{f.a}</p>
        </section>
      ))}

      <section>
        <h2>What comes after discovery</h2>
        <p>
          Once an agent knows <em>what</em> your API can do, the next questions for any consequential action are{' '}
          <em>may I</em>, <em>what happened</em>, and <em>can I prove it</em>. Those are governance and evidence — defined
          by the <a href="https://capabilityhostprotocol.com">Capability Host Protocol</a>. If your API touches money,
          health, or other regulated decisions, see how CHP turns an action into{' '}
          <a href="https://capabilityhostprotocol.com/ai-agent-audit-trail">a provable audit trail</a>. capabilities.txt
          is the public front door; CHP is where it leads.
        </p>
        <p style={{ marginTop: 18 }}>
          <a className="cta primary" href="/generate">Generate your capabilities.txt</a>
          <a className="cta" href="/guides/capabilities-txt-from-openapi">From OpenAPI, step by step</a>
          <a className="cta" href="/compare">Compare the standards</a>
        </p>
      </section>
    </div>
  );
}
