import type { Metadata } from 'next';
import Nav from '../components/Nav';

const PUBLISHED = '2026-06-29';
const TLDR =
  'Agent-readiness is how prepared a website or API is for AI agents to discover, invoke, trust, and be held accountable for actions on it. We score it across four categories — Discoverable, Invocable, Identifiable & Trusted, and Provable — from public, well-known signals (robots.txt AI-crawler rules, sitemap.xml, llms.txt, schema.org, capabilities.txt, OpenAPI, MCP, A2A agent cards, and evidence/governance). This is the open rubric behind the agent-readiness report card; stable signals are weighted, emerging ones count as bonus.';

export const metadata: Metadata = {
  title: 'The Agent-Readiness Rubric',
  description: TLDR,
  alternates: { canonical: '/rubric' },
};

const CATEGORIES = [
  {
    name: 'Discoverable',
    weight: '50',
    q: 'Can an agent find you and what you offer?',
    signals: [
      ['robots.txt', 'Present', '5'],
      ['AI crawlers allowed', 'GPTBot, ClaudeBot, PerplexityBot, CCBot, Google-Extended not blocked', '10'],
      ['sitemap.xml', 'Present or referenced in robots.txt', '5'],
      ['llms.txt', 'Present — what is worth reading', '10'],
      ['schema.org JSON-LD', 'Structured data on the homepage', '8'],
      ['capabilities.txt', 'Present + conformance grade', '12'],
    ],
  },
  {
    name: 'Invocable',
    weight: '30',
    q: 'Can an agent actually act?',
    signals: [
      ['OpenAPI discoverable', 'A spec at a common path agents can map', '18'],
      ['MCP advertised', 'mcp.json / a live MCP server (optional)', '12'],
    ],
  },
  {
    name: 'Identifiable & Trusted',
    weight: '15',
    q: 'Can an agent recognize your identity?',
    signals: [['A2A agent card', '/.well-known/agent-card.json', '15']],
  },
  {
    name: 'Provable',
    weight: '5',
    q: 'Can you prove what agents did?',
    signals: [['Governed, replayable evidence', 'The frontier — almost no one has this yet', '5']],
  },
];

const FAQ = [
  {
    q: 'What is agent-readiness?',
    a: 'How prepared a website or API is for AI agents to discover what it can do, invoke it, recognize its identity, and be held accountable for consequential actions. It is the agentic-web analogue of mobile-readiness or accessibility — a measurable property of a site, not a product you buy.',
  },
  {
    q: 'How is the score calculated?',
    a: 'From public, deterministic signals at well-known locations — robots.txt AI-crawler rules, sitemap.xml, llms.txt, schema.org JSON-LD, capabilities.txt (graded for conformance), OpenAPI, MCP, and A2A agent cards. Each signal carries points within one of four categories; the categories sum to an overall 0–100 score and an A–F grade. No private data, no login required.',
  },
  {
    q: 'Why weight capabilities.txt as only one signal?',
    a: 'Because agent-readiness is a property of the whole stack, not any single file. A site can be discoverable via llms.txt and schema.org, invocable via OpenAPI, and still have no way to prove what an agent did. Weighting one file heavily would make the score self-serving and less useful. capabilities.txt is one Discoverable signal among several.',
  },
  {
    q: 'What is the "Provable" category, and why does almost everyone score zero?',
    a: 'It asks whether you can prove, later and to someone skeptical, what an agent actually did on your site — and whether it was authorized. There is no widely-adopted standard for this yet, so nearly every site scores zero. It is the industry frontier, and the layer the Capability Host Protocol addresses.',
  },
  {
    q: 'How do emerging standards affect my score?',
    a: 'Stable, widely-supported signals (robots.txt, sitemap, llms.txt, schema.org, OpenAPI, capabilities.txt) carry the weight. Fast-moving ones (A2A agent cards, Web Bot Auth, MCP advertisement) count but are weighted lighter, so your score does not swing as those specifications evolve.',
  },
];

export default function RubricPage() {
  const ld = [
    {
      '@context': 'https://schema.org',
      '@type': 'TechArticle',
      headline: 'The Agent-Readiness Rubric',
      description: TLDR,
      datePublished: PUBLISHED,
      dateModified: PUBLISHED,
      author: { '@type': 'Organization', name: 'Project Auxo, Inc.', url: 'https://capabilityhostprotocol.com' },
      publisher: { '@type': 'Organization', name: 'capabilities.txt' },
      url: 'https://capabilitiestxt.org/rubric',
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
        <div className="mark">rubric</div>
        <h1 style={{ fontSize: 'clamp(28px,5vw,42px)' }}>The Agent-Readiness Rubric</h1>
        <p className="muted" style={{ fontSize: 13 }}>By Project Auxo · {PUBLISHED} · v1</p>
      </header>

      <div className="next">
        <p style={{ margin: 0 }}>
          <strong>TL;DR.</strong> {TLDR}
        </p>
      </div>

      <section>
        <h2>Why a rubric</h2>
        <p>
          The web is being visited by software acting on people&apos;s behalf, and there&apos;s no shared answer to a
          simple question: <strong>is this site ready for agents?</strong> Agent-readiness is measurable — from public
          signals a site already does or doesn&apos;t publish. This is the open methodology behind the{' '}
          <a href="/report">agent-readiness report card</a>; it&apos;s versioned, and we publish it so the score is
          auditable rather than a black box.
        </p>
      </section>

      {CATEGORIES.map((c) => (
        <section key={c.name}>
          <h2>
            {c.name} <span className="muted" style={{ textTransform: 'none', letterSpacing: 0 }}>· {c.weight} pts · {c.q}</span>
          </h2>
          <table>
            <tbody>
              <tr>
                <th>Signal</th>
                <th>What we check</th>
                <th style={{ width: 60 }}>Pts</th>
              </tr>
              {c.signals.map((s) => (
                <tr key={s[0]}>
                  <td className={c.name === 'Discoverable' && s[0] === 'capabilities.txt' ? 'accent' : undefined}>
                    <code>{s[0]}</code>
                  </td>
                  <td>{s[1]}</td>
                  <td>{s[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ))}

      <section>
        <h2>Scoring</h2>
        <p className="muted">
          Each signal earns points within its category; the four categories sum to a 0–100 score and an A–F grade
          (A ≥ 85, B ≥ 70, C ≥ 55, D ≥ 40, F below). Most of the web scores C–F today — agent-readiness is new, and the
          point of the grade is the prioritized list of fixes, not the letter. The methodology is versioned; this is v1.
        </p>
      </section>

      {FAQ.map((f) => (
        <section key={f.q}>
          <h2 style={{ textTransform: 'none', fontSize: 18, color: 'var(--ink)', letterSpacing: 0 }}>{f.q}</h2>
          <p className="muted">{f.a}</p>
        </section>
      ))}

      <section>
        <h2>Get your score</h2>
        <p>
          <a className="cta primary" href="/report">Run the report card</a>
          <a className="cta" href="/guides/agent-ready-api">Make your API agent-ready</a>
          <a className="cta" href="/how-agents-discover">How agents discover sites</a>
        </p>
      </section>
    </div>
  );
}
