import type { Metadata } from 'next';
import Nav from '../components/Nav';
import CopyButton from '../components/CopyButton';
import { AGENT_PROMPT } from '../lib/agentPrompt';

export const metadata: Metadata = {
  title: 'Implement capabilities.txt — a copy-paste prompt',
  description:
    'Add a capabilities.txt to your site in minutes: copy one prompt, hand it to your AI coding agent (Claude Code, Cursor, …) or a developer, and it writes your file from your real API.',
  alternates: { canonical: '/implement' },
};

export default function ImplementPage() {
  return (
    <div className="wrap">
      <Nav />
      <header style={{ padding: '56px 0 18px' }}>
        <div className="mark">implement · ~2 minutes</div>
        <h1 style={{ fontSize: 'clamp(30px,5vw,44px)' }}>Add capabilities.txt with one prompt.</h1>
        <p className="lede">
          Hand this to your AI coding agent (Claude Code, Cursor, Copilot…) or a developer. It inspects your API and
          writes your <code>capabilities.txt</code> + <code>/.well-known/capabilities.json</code> from your real
          capabilities — no manual authoring.
        </p>
      </header>

      <div style={{ margin: '6px 0 14px' }}>
        <CopyButton text={AGENT_PROMPT} label="Copy the prompt" />
      </div>
      <pre style={{ whiteSpace: 'pre-wrap' }}>
        <code>{AGENT_PROMPT}</code>
      </pre>

      <section>
        <h2>Then</h2>
        <p>
          Run it, place the two files at your web root, and <a href="/submit">check conformance</a> (you’ll get a grade,
          fixes, and a badge).
        </p>
        <p className="muted">
          Already have an OpenAPI spec? You can generate it directly instead — see{' '}
          <a href="https://github.com/capabilityhostprotocol/capabilities-txt/tree/main/tools"><code>tools/from_openapi.py</code></a>.
          One honest rule for the agent and for you: declare only capabilities your site genuinely has.
        </p>
      </section>
    </div>
  );
}
