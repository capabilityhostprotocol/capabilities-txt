import type { Metadata } from 'next';
import Nav from '../../components/Nav';

const PUBLISHED = '2026-06-28';
const TLDR =
  'If you already publish an OpenAPI description, you can generate a conformant capabilities.txt from it automatically. The generator groups your operations by tag into capability categories, derives a stable id for each from its operationId (or path + method), and writes a one-line description per capability. Paste your OpenAPI URL into the hosted generator, or run tools/from_openapi.py from the command line, then review, publish, and check it.';

export const metadata: Metadata = {
  title: 'Generate capabilities.txt from your OpenAPI',
  description: TLDR,
  alternates: { canonical: '/guides/capabilities-txt-from-openapi' },
};

const FAQ = [
  {
    q: 'What does the generator do with my OpenAPI spec?',
    a: 'It reads your OpenAPI 3.x document, groups operations by their tag into capability categories (## headings), and emits one capability per operation. Each capability gets a stable id derived from its operationId — or from the path and HTTP method when no operationId is present — plus the operation summary as its one-line description. The output is plain markdown that conforms to the capabilities.txt format.',
  },
  {
    q: 'My operations have no operationId — will it still work?',
    a: 'Yes. When an operationId is missing, the generator derives a readable id from the HTTP method and path (e.g. GET /orders/{id} becomes something like orders.get_orders_id). It is worth adding operationIds to your spec, though — they produce cleaner, more stable capability ids that will not churn if you reorganize routes.',
  },
  {
    q: 'Should I publish every operation as a capability?',
    a: 'Not necessarily. The generator gives you a complete first draft; then prune it. capabilities.txt is an advertisement of what an agent can usefully do, not an exhaustive route dump. Keep the consequential and commonly useful operations, drop internal or administrative endpoints you do not want agents reaching for.',
  },
  {
    q: 'How do I keep it in sync as my API changes?',
    a: 'Regenerate it in CI. Because the generator is deterministic and runs from your OpenAPI, you can wire it into your build (or the GitHub Action) so the capabilities.txt is regenerated whenever your spec changes — the same way you would regenerate client SDKs.',
  },
  {
    q: 'What if I do not have an OpenAPI spec at all?',
    a: 'Use the implement prompt instead: hand it to your AI coding agent and it reads your actual routes and writes the capabilities.txt directly. The OpenAPI path is the fastest when a spec exists; the prompt path covers everything else.',
  },
];

export default function FromOpenApiPage() {
  const ld = [
    {
      '@context': 'https://schema.org',
      '@type': 'TechArticle',
      headline: 'Generate capabilities.txt from your OpenAPI',
      description: TLDR,
      datePublished: PUBLISHED,
      dateModified: PUBLISHED,
      author: { '@type': 'Organization', name: 'Project Auxo, Inc.', url: 'https://capabilityhostprotocol.com' },
      publisher: { '@type': 'Organization', name: 'capabilities.txt' },
      url: 'https://capabilitiestxt.org/guides/capabilities-txt-from-openapi',
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
        <h1 style={{ fontSize: 'clamp(28px,5vw,42px)' }}>Generate capabilities.txt from your OpenAPI</h1>
        <p className="muted" style={{ fontSize: 13 }}>By Project Auxo · {PUBLISHED}</p>
      </header>

      <div className="next">
        <p style={{ margin: 0 }}>
          <strong>TL;DR.</strong> {TLDR}
        </p>
      </div>

      <section>
        <h2>Why generate, not hand-write</h2>
        <p>
          Your OpenAPI document already encodes the two things a capabilities.txt needs: a list of operations and a
          short description of each. Generating from it means your declaration starts complete and accurate, stays
          consistent with your real API, and can be regenerated whenever the API changes. Hand-writing is fine for a
          handful of capabilities; generation is how you keep it honest at scale.
        </p>
      </section>

      <section>
        <h2>Option A — the hosted generator</h2>
        <p>
          The fastest path. Open <a href="/generate">the generator</a>, paste your OpenAPI URL (or your domain — it will
          try the common locations), and it returns a ready capabilities.txt with a copy button and publish
          instructions. Nothing to install.
        </p>
      </section>

      <section>
        <h2>Option B — the command line</h2>
        <p>It is a single deterministic script — good for CI or local use:</p>
        <pre><code># from a hosted OpenAPI URL
python tools/from_openapi.py https://api.yoursite.com/openapi.json &gt; capabilities.txt

# from a local file
python tools/from_openapi.py ./openapi.json &gt; capabilities.txt

# or pipe it in
cat openapi.json | python tools/from_openapi.py - &gt; capabilities.txt</code></pre>
      </section>

      <section>
        <h2>What the output looks like</h2>
        <p>
          Operations grouped by tag become categories; each operation becomes a capability with a stable id and its
          summary:
        </p>
        <pre><code># capabilities.txt

&gt; One sentence: what this host is and the capabilities it offers.
&gt; Structured form: https://yoursite.com/.well-known/capabilities.json

## Orders

### Orders (orders)

- orders.create_order (v1.0.0) — Place a new order
- orders.get_status (v1.0.0) — Check an order's status

## Inventory

### Inventory (inventory)

- inventory.check_stock (v1.0.0) — Check availability for a SKU</code></pre>
        <p className="muted">
          The ids come from your <code>operationId</code>s (or path + method as a fallback); the descriptions come from
          each operation's <code>summary</code>. Cleaner OpenAPI in, cleaner capabilities.txt out.
        </p>
      </section>

      <section>
        <h2>Review, then publish</h2>
        <p>
          Treat the generated file as a first draft: prune internal endpoints, tidy descriptions, and confirm the
          summary blockquote points at your real invocation endpoint. Then publish at{' '}
          <code>https://yoursite.com/capabilities.txt</code> and <a href="/submit">run a conformance check</a> for a
          grade and a badge.
        </p>
      </section>

      <section>
        <h2>Keep it in sync</h2>
        <p>
          Because generation is deterministic, wire it into CI (or use the GitHub Action) to regenerate the file
          whenever your OpenAPI changes — the same discipline you already apply to generated SDKs and docs.
        </p>
      </section>

      {FAQ.map((f) => (
        <section key={f.q}>
          <h2 style={{ textTransform: 'none', fontSize: 18, color: 'var(--ink)', letterSpacing: 0 }}>{f.q}</h2>
          <p className="muted">{f.a}</p>
        </section>
      ))}

      <section>
        <h2>Next steps</h2>
        <p>
          <a className="cta primary" href="/generate">Open the generator</a>
          <a className="cta" href="/guides/agent-ready-api">The full 10-minute guide</a>
          <a className="cta" href="/guides/well-known-files-for-ai-agents">The well-known files explained</a>
        </p>
      </section>
    </div>
  );
}
