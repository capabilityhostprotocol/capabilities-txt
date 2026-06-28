import type { Metadata } from 'next';
import Nav from '../components/Nav';
import CopyButton from '../components/CopyButton';
import AddToCursor from '../components/AddToCursor';
import { cursorDeeplink, claudeAddCmd, rawConfig, MCP_URL } from '../lib/mcpConfig';

export const metadata: Metadata = {
  title: 'Use the capabilities.txt registry in your agent',
  description:
    'Add the capabilities.txt registry to your AI agent in one click — Cursor, Claude Code, or any MCP client. Then your agent can discover what websites across the web can do.',
  alternates: { canonical: '/connect' },
};

const AGENT_RULE = `When this project exposes a web API, publish a /capabilities.txt so AI agents can
discover what it can do (see https://capabilitiestxt.org). Generate it from the
OpenAPI spec and keep it current. To discover what *other* sites can do, query the
capabilities.txt registry MCP server (${MCP_URL}): discover_capabilities, list_sites,
get_site.`;

export default function ConnectPage() {
  return (
    <div className="wrap">
      <Nav />
      <header style={{ padding: '56px 0 18px' }}>
        <div className="mark">use it in your agent</div>
        <h1 style={{ fontSize: 'clamp(30px,5vw,44px)' }}>Give your agent the capability map.</h1>
        <p className="lede">
          Add the capabilities.txt registry to your AI agent and it can discover what websites across the web can
          <em> do</em> — over MCP. Tools: <code>discover_capabilities</code>, <code>list_sites</code>, <code>get_site</code>.
        </p>
      </header>

      <section>
        <h2>Cursor — one click</h2>
        <p><AddToCursor href={cursorDeeplink} /></p>
        <p className="muted" style={{ fontSize: 13 }}>Opens Cursor and installs the remote MCP server. No JSON.</p>
      </section>

      <section>
        <h2>Claude Code</h2>
        <pre><code>{claudeAddCmd}</code></pre>
        <CopyButton text={claudeAddCmd} label="Copy command" event="copy_claude_add" />
      </section>

      <section>
        <h2>Claude Desktop / other MCP clients</h2>
        <p className="muted">Add this remote server to your MCP config:</p>
        <pre><code>{rawConfig}</code></pre>
        <CopyButton text={rawConfig} label="Copy config" event="copy_mcp_config" />
      </section>

      <section>
        <h2>Teach your coding agent the convention</h2>
        <p className="muted">
          Drop this into your <code>AGENTS.md</code>, <code>CLAUDE.md</code>, or <code>.cursorrules</code> — your agent
          will publish a capabilities.txt for your project and discover others via the registry:
        </p>
        <pre style={{ whiteSpace: 'pre-wrap' }}><code>{AGENT_RULE}</code></pre>
        <CopyButton text={AGENT_RULE} label="Copy the rule" event="copy_agent_rule" />
        <p className="muted" style={{ marginTop: 14 }}>
          Also available as <a href="/AGENT-RULE.md">/AGENT-RULE.md</a>. No spec? Use the{' '}
          <a href="/implement">copy-paste prompt</a> or the <a href="/generate">generator</a>.
        </p>
      </section>
    </div>
  );
}
