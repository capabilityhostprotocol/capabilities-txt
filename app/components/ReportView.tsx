import type { Report } from '../lib/conformance';
import CopyButton from './CopyButton';

function hostOf(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return '';
  }
}

export default function ReportView({ report, sourceUrl }: { report: Report; sourceUrl: string }) {
  const domain = hostOf(sourceUrl);
  const badgeMd = `[![capabilities.txt](https://capabilitiestxt.org/api/badge?domain=${domain})](https://capabilitiestxt.org/check/${domain})`;

  return (
    <div>
      <div style={{ display: 'flex', gap: 18, alignItems: 'center', flexWrap: 'wrap', margin: '8px 0 20px' }}>
        <span className="grade">
          <span className={`g g-${report.grade}`}>{report.grade}</span>
        </span>
        <div>
          <div style={{ fontSize: 15 }}>
            {report.ok ? `${report.capabilities.length} capabilities · ${report.categories} categories` : 'Not a valid capabilities.txt yet'}
          </div>
          <div className="muted" style={{ fontSize: 13, wordBreak: 'break-all' }}>
            <a href={sourceUrl}>{sourceUrl}</a>
          </div>
        </div>
      </div>

      <h2>Recommendations</h2>
      {report.recommendations.map((r, i) => (
        <p key={i} className={`rec ${r.level}`} style={{ margin: '8px 0' }}>
          {r.text}
        </p>
      ))}

      {report.capabilities.length > 0 && (
        <>
          <h2>Capabilities found</h2>
          <p>
            {report.capabilities.slice(0, 40).map((c) => (
              <span className="pill" key={c.id + c.category}>
                {c.id}
                {c.version ? ` v${c.version}` : ''}
              </span>
            ))}
            {report.capabilities.length > 40 && <span className="muted"> +{report.capabilities.length - 40} more</span>}
          </p>
        </>
      )}

      {report.ok && domain && (
        <>
          <h2>Show a badge</h2>
          <p className="muted">Add this to your README so others know you publish a conformant capabilities.txt:</p>
          <p>
            <img src={`/api/badge?domain=${domain}`} alt="capabilities.txt badge" />
          </p>
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
            <code>{badgeMd}</code>
          </pre>
          <CopyButton text={badgeMd} label="Copy badge markdown" />
        </>
      )}
    </div>
  );
}
