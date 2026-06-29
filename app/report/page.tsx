'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Nav from '../components/Nav';

export default function ReportIndexPage() {
  const router = useRouter();
  const [domain, setDomain] = useState('');

  function go(e: React.FormEvent) {
    e.preventDefault();
    const host = domain.trim().replace(/^https?:\/\//i, '').replace(/\/.*$/, '');
    if (host) router.push(`/report/${host}`);
  }

  return (
    <div className="wrap">
      <Nav />
      <header style={{ padding: '56px 0 14px' }}>
        <div className="mark">report card</div>
        <h1 style={{ fontSize: 'clamp(28px,5vw,42px)' }}>Is your site agent-ready?</h1>
        <p className="lede">
          Grade any website or API across the agentic-web stack — discovery, invocation, identity, and provability —
          from public signals. Scored against the open <a href="/rubric">Agent-Readiness Rubric</a>.
        </p>
      </header>

      <section style={{ borderTop: 'none' }}>
        <form className="field" onSubmit={go}>
          <input
            type="text"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="yoursite.com"
            aria-label="Domain to grade"
          />
          <button type="submit" className="cta primary" style={{ margin: 0 }}>
            Grade it
          </button>
        </form>
        <p className="muted" style={{ fontSize: 13 }}>
          We read only public, well-known files (robots.txt, sitemap.xml, llms.txt, schema.org, capabilities.txt,
          OpenAPI, MCP, A2A). No login, no private data.
        </p>
      </section>

      <section>
        <h2>Try an example</h2>
        <p>
          <a className="cta" href="/report/capabilityhostprotocol.com">capabilityhostprotocol.com</a>
          <a className="cta" href="/report/capabilitiestxt.org">capabilitiestxt.org</a>
        </p>
      </section>
    </div>
  );
}
