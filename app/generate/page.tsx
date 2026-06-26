'use client';
import { useState } from 'react';
import { track } from '@vercel/analytics';
import Nav from '../components/Nav';
import CopyButton from '../components/CopyButton';

export default function GeneratePage() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<{ sourceUrl: string; capabilitiesTxt: string } | null>(null);

  async function gen(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Generation failed.');
        track('generate_failed');
      } else {
        setResult(data);
        track('generate');
      }
    } catch {
      setError('Network error — try again.');
    }
    setLoading(false);
  }

  return (
    <div className="wrap">
      <Nav />
      <header style={{ padding: '56px 0 18px' }}>
        <div className="mark">generate · 10 seconds</div>
        <h1 style={{ fontSize: 'clamp(30px,5vw,44px)' }}>Generate your capabilities.txt.</h1>
        <p className="lede">
          Already have an OpenAPI spec? Paste its URL (or your domain — we’ll look for <code>/openapi.json</code>) and
          get a conformant <code>capabilities.txt</code> instantly. No CLI, no manual authoring.
        </p>
      </header>

      <form className="field" onSubmit={gen}>
        <input
          type="text"
          inputMode="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://api.yoursite.com/openapi.json  ·  or  yoursite.com"
          aria-label="OpenAPI URL or domain"
        />
        <button className="cta primary" type="submit" disabled={loading} style={{ margin: 0 }}>
          {loading ? 'Generating…' : 'Generate'}
        </button>
      </form>

      {error && <p className="rec err">{error}</p>}

      {result && (
        <div>
          <h2>Your capabilities.txt</h2>
          <p className="muted" style={{ fontSize: 13 }}>
            Generated from <a href={result.sourceUrl}>{result.sourceUrl}</a> — review it, tidy the descriptions, then
            publish it.
          </p>
          <div style={{ margin: '6px 0 12px' }}>
            <CopyButton text={result.capabilitiesTxt} label="Copy the file" event="copy_file" />
          </div>
          <pre style={{ whiteSpace: 'pre-wrap', maxHeight: 420 }}>
            <code>{result.capabilitiesTxt}</code>
          </pre>
          <div className="next">
            <p style={{ margin: '0 0 8px' }}>
              <strong>Publish it:</strong> save this as <code>/capabilities.txt</code> at your site root (e.g. your
              <code> public/</code> or static directory).
            </p>
            <p className="muted" style={{ margin: 0 }}>
              Then <a href="/submit">check it for conformance</a> (you’ll get a grade, fixes, and a badge), and add it to
              the <a href="/directory">directory</a> so agents can discover it.
            </p>
          </div>
        </div>
      )}

      <section style={{ marginTop: 44 }}>
        <p className="muted">
          No OpenAPI spec? <a href="/implement">Copy a prompt</a> and your AI coding agent will write your
          capabilities.txt from your actual code instead.
        </p>
      </section>
    </div>
  );
}
