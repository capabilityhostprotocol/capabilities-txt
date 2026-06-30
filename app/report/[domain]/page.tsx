import type { Metadata } from 'next';
import { after } from 'next/server';
import Nav from '../../components/Nav';
import { gradeAgentReadiness } from '../../lib/agentReadiness';
import { recordEvent } from '../../lib/growthDb';

export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ domain: string }> };

function cleanHost(d: string): string {
  return decodeURIComponent(d).trim().replace(/^https?:\/\//i, '').replace(/\/.*$/, '');
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { domain } = await params;
  const host = cleanHost(domain);
  return {
    title: `Is ${host} agent-ready? — Agent-Readiness Report`,
    description: `An agent-readiness report card for ${host}: how prepared it is for AI agents to discover, invoke, and trust it — scored across the agentic-web stack.`,
    alternates: { canonical: `/report/${host}` },
    // Don't index on-demand reports for arbitrary third-party domains (scaled-content
    // hygiene). Curated/claimed reports can opt back into indexing later.
    robots: { index: false, follow: true },
  };
}

const GRADE_COLOR: Record<string, string> = { A: '#34d399', B: '#28d9f2', C: '#fbbf24', D: '#fb923c', F: '#f87171' };
const STATUS_CLASS: Record<string, string> = { pass: 'ok', partial: 'warn', fail: 'err' };

export default async function ReportPage({ params }: Params) {
  const { domain } = await params;
  const host = cleanHost(domain);
  const report = await gradeAgentReadiness(host);
  const fetchedDate = report.fetchedAt.slice(0, 10);

  // First-party inbound signal: someone graded this domain. A self-grade is a warm lead.
  after(() =>
    recordEvent({ event: 'report_view', domain: host, path: `/report/${host}`, props: { grade: report.grade, score: report.score } }),
  );

  const ld = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: `Agent-readiness report for ${host}`,
    description: `Agent-readiness grade ${report.grade} (${report.score}/100) for ${host}, scored against the open Agent-Readiness Rubric.`,
    datePublished: fetchedDate,
    dateModified: fetchedDate,
    author: { '@type': 'Organization', name: 'capabilities.txt', url: 'https://capabilitiestxt.org' },
    url: `https://capabilitiestxt.org/report/${host}`,
  };

  return (
    <div className="wrap">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <Nav />
      <header style={{ padding: '56px 0 10px' }}>
        <div className="mark">agent-readiness report</div>
        <h1 style={{ fontSize: 'clamp(26px,5vw,40px)', wordBreak: 'break-word' }}>{host}</h1>
        <p className="muted" style={{ fontSize: 12.5 }}>
          Graded from {host}&apos;s public signals on {fetchedDate} · unofficial · not affiliated ·{' '}
          <a href="/rubric">how this is scored</a>
        </p>
      </header>

      {!report.ok ? (
        <section style={{ borderTop: 'none' }}>
          <div className="rec err">
            We couldn&apos;t reach <code>{host}</code> or read its public files. Check the domain and try again from{' '}
            <a href="/report">the report card</a>.
          </div>
        </section>
      ) : (
        <>
          <section style={{ borderTop: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
              <span className="grade">
                <span className="g" style={{ color: GRADE_COLOR[report.grade] }}>{report.grade}</span>
                <span className="muted" style={{ fontSize: 15, fontWeight: 400 }}>{report.score}/100</span>
              </span>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {report.categories.map((c) => (
                  <span key={c.category} className="pill" title={`${c.earned}/${c.max}`}>
                    {c.label}: {c.pct}%
                  </span>
                ))}
              </div>
            </div>
          </section>

          {report.topFixes.length > 0 && (
            <section>
              <h2>Top fixes</h2>
              {report.topFixes.map((f, i) => (
                <div key={i} className="rec warn">
                  <strong>{f.label}.</strong> {f.fix}
                </div>
              ))}
            </section>
          )}

          {report.categories.map((c) => (
            <section key={c.category}>
              <h2>
                {c.label}{' '}
                <span className="muted" style={{ textTransform: 'none', letterSpacing: 0 }}>· {c.pct}%</span>
              </h2>
              {c.signals.map((s) => (
                <div key={s.id} className={`rec ${STATUS_CLASS[s.status]}`}>
                  <strong>{s.label}</strong> — {s.detail}
                  {s.status !== 'pass' && s.fix ? <div className="muted" style={{ fontSize: 13, marginTop: 2 }}>{s.fix}</div> : null}
                </div>
              ))}
            </section>
          ))}

          <section>
            <h2>Improve your score</h2>
            <p className="muted">
              The fastest wins are usually a <code>capabilities.txt</code> and welcoming the AI crawlers. The{' '}
              <strong>Provable</strong> gap — proving what agents actually did — is the frontier the{' '}
              <a href="https://capabilityhostprotocol.com">Capability Host Protocol</a> addresses.
            </p>
            <p>
              <a className="cta primary" href="/generate">Generate your capabilities.txt</a>
              <a className="cta" href="/guides/agent-ready-api">The 10-minute guide</a>
              <a className="cta" href="/rubric">The rubric</a>
            </p>
          </section>
        </>
      )}
    </div>
  );
}
