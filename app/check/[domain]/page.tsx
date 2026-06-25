import type { Metadata } from 'next';
import Nav from '../../components/Nav';
import ReportView from '../../components/ReportView';
import { fetchCapabilities } from '../../lib/fetchCapabilities';
import { analyze } from '../../lib/conformance';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ domain: string }> }): Promise<Metadata> {
  const { domain } = await params;
  const d = decodeURIComponent(domain);
  return {
    title: `${d} — capabilities.txt conformance`,
    description: `Live capabilities.txt conformance report for ${d}.`,
  };
}

export default async function CheckPage({ params }: { params: Promise<{ domain: string }> }) {
  const { domain } = await params;
  const decoded = decodeURIComponent(domain);

  let content: React.ReactNode;
  try {
    const { sourceUrl, text } = await fetchCapabilities(decoded);
    content = <ReportView report={analyze(text)} sourceUrl={sourceUrl} />;
  } catch (e) {
    content = (
      <p className="rec err" style={{ marginTop: 18 }}>
        {e instanceof Error ? e.message : 'Check failed.'} — <a href="/submit">try another</a>.
      </p>
    );
  }

  return (
    <div className="wrap">
      <Nav />
      <header style={{ padding: '56px 0 16px' }}>
        <div className="mark">conformance report</div>
        <h1 style={{ fontSize: 'clamp(26px,5vw,40px)', wordBreak: 'break-all' }}>{decoded}</h1>
        <p className="lede">A live conformance check of this host’s capabilities.txt.</p>
      </header>
      {content}
      <section style={{ marginTop: 44 }}>
        <p className="muted">
          <a href="/submit">Check another site</a> · <a href="/implement">Generate your own</a>
        </p>
      </section>
    </div>
  );
}
