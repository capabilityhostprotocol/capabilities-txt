'use client';
import { useState } from 'react';
import { track } from '@vercel/analytics';
import Nav from '../components/Nav';
import ReportView from '../components/ReportView';
import type { Report } from '../lib/conformance';

type Result = Report & { sourceUrl: string };

export default function SubmitPage() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<Result | null>(null);

  async function check(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch('/api/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Check failed.');
        track('check_failed');
      } else {
        setResult(data as Result);
        track('check', { grade: (data as Result).grade });
      }
    } catch {
      setError('Network error — try again.');
    }
    setLoading(false);
  }

  return (
    <div className="wrap">
      <Nav />
      <header style={{ padding: '56px 0 20px' }}>
        <div className="mark">check · conformance</div>
        <h1 style={{ fontSize: 'clamp(30px,5vw,44px)' }}>Check your capabilities.txt</h1>
        <p className="lede">Paste your site or the file URL. We fetch it, check conformance, and show you exactly how to improve it — plus a badge.</p>
      </header>

      <form className="field" onSubmit={check}>
        <input
          type="text"
          inputMode="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="yoursite.com  ·  or  https://yoursite.com/capabilities.txt"
          aria-label="Your site or capabilities.txt URL"
        />
        <button className="cta primary" type="submit" disabled={loading} style={{ margin: 0 }}>
          {loading ? 'Checking…' : 'Check'}
        </button>
      </form>

      {error && <p className="rec err">{error}</p>}
      {result && <ReportView report={result} sourceUrl={result.sourceUrl} />}

      <section style={{ marginTop: 44 }}>
        <p className="muted">
          Don’t have one yet? <a href="/implement">Copy a prompt</a> and your AI coding agent will write it for you in minutes.
        </p>
      </section>
    </div>
  );
}
