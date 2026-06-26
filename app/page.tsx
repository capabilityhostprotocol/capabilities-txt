import Nav from './components/Nav';

// The landing content is preserved verbatim from the original static site.
const BODY = `
<header>
  <div class="mark">capabilities.txt</div>
  <h1>Declare what your site can <em>do</em>.</h1>
  <p class="lede">A simple, open convention for a website to publish the capabilities an agent can discover and invoke — at a well-known location.</p>
  <div style="margin-top:24px">
    <a class="cta primary" href="/implement">Implement it</a>
    <a class="cta" href="/submit">Check your file</a>
    <a class="cta" href="https://github.com/capabilityhostprotocol/capabilities-txt">GitHub</a>
    <a class="cta" href="/examples/capabilityhostprotocol.com.txt">See a live example</a>
  </div>
</header>

<section id="background">
  <h2>Background</h2>
  <p>The web taught machines to read in layers. <code>robots.txt</code> says what a crawler may access. <code>sitemap.xml</code> says what exists. <code>llms.txt</code> says what's worth reading. Each answers one narrow question for an automated reader.</p>
  <p>None of them answers the question agents now ask: <strong>what can this host actually <em>do</em>?</strong></p>
  <p class="muted">Agents have stopped only <em>reading</em> the web and started <em>acting</em> on it. An agent that lands on your site can summarize your docs — but it has no standard way to discover that you expose a "create support ticket" capability, "check inventory," or "start a return," and how to call them. Today that happens through bespoke, one-vendor-at-a-time integrations.</p>
</section>

<section id="proposal">
  <h2>The proposal</h2>
  <p><code>capabilities.txt</code> is the missing layer: a public, well-known file where a host declares the capabilities it offers, so any agent can discover what it can do. A host publishes one or both:</p>
  <h3><code>/capabilities.txt</code></h3>
  <p class="muted">Human- and agent-readable markdown: capabilities grouped by category, each with an id, version, and one-line description.</p>
  <h3><code>/.well-known/capabilities.json</code></h3>
  <p class="muted">The structured form: an array of capability references, each resolvable to a full descriptor.</p>
  <p>It's deliberately small. <code>llms.txt</code> worked because you could adopt it in an afternoon. <code>capabilities.txt</code> follows the same rule.</p>
</section>

<section id="format">
  <h2>Format</h2>
  <pre><code># capabilities.txt

&gt; One sentence: what this host is and the capabilities it offers.
&gt; Structured form: https://example.com/.well-known/capabilities.json

## Support

### Tickets (support.tickets)

- support.create_ticket (v1.2.0) — Open a support ticket
- support.get_status (v1.0.0) — Check a ticket's status

## Commerce

### Inventory (commerce.inventory)

- commerce.check_stock (v2.0.0) — Check availability for a SKU</code></pre>
  <p class="muted">Line 1 is <code># capabilities.txt</code>. A <code>&gt;</code> blockquote summarizes the host. <code>##</code> groups by category; <code>###</code> names a group; each capability is a list item with a stable id, optional <code>(v…)</code>, and a short description. It's just markdown — if a human can read it and an agent can parse it, it's valid.</p>
</section>

<section id="standards">
  <h2>Where it sits</h2>
  <table>
    <tr><th>File</th><th>Answers</th><th>For</th></tr>
    <tr><td><code>robots.txt</code></td><td>What may a crawler access?</td><td>Crawlers</td></tr>
    <tr><td><code>sitemap.xml</code></td><td>What pages exist?</td><td>Search engines</td></tr>
    <tr><td><code>llms.txt</code></td><td>What's worth reading?</td><td>LLMs reading</td></tr>
    <tr><td class="accent"><code>capabilities.txt</code></td><td class="accent">What can this host <em>do</em>?</td><td class="accent">Agents acting</td></tr>
  </table>
  <p class="muted">It's <strong>not</strong> a replacement for MCP or an API spec. MCP is a stateful connection-and-invocation protocol; OpenAPI describes an HTTP API. <code>capabilities.txt</code> is the layer <em>before</em> invocation — a static, public, crawlable advertisement an agent can read with no live connection, that points to your MCP server or API for the actual call. Discovery and invocation are different jobs; capabilities.txt does discovery and hands off invocation.</p>
  <p><a href="/compare">Full comparison: capabilities.txt vs llms.txt, mcp.json &amp; OpenAPI →</a></p>
</section>

<section id="example">
  <h2>Examples</h2>
  <p>A real, live <code>capabilities.txt</code> — the governed capability surface of the CHP adapter ecosystem:</p>
  <p><a href="/examples/capabilityhostprotocol.com.txt">capabilityhostprotocol.com/capabilities.txt</a> <span class="muted">— live</span></p>
  <p style="margin-top:22px">And how it looks across markets (illustrative templates you can lift):</p>
  <table>
    <tr><th>Market</th><th>Example</th><th>Capabilities like…</th></tr>
    <tr><td>E-commerce</td><td><a href="/examples/illustrative/shop.example.txt">shop.example</a></td><td>check stock, place order, start a return</td></tr>
    <tr><td>Customer support</td><td><a href="/examples/illustrative/support.example.txt">support.example</a></td><td>create ticket, search KB, escalate to a human</td></tr>
    <tr><td>Banking / fintech</td><td><a href="/examples/illustrative/bank.example.txt">bank.example</a></td><td>balance, initiate transfer (step-up), open dispute</td></tr>
    <tr><td>Healthcare</td><td><a href="/examples/illustrative/clinic.example.txt">clinic.example</a></td><td>book appointment, request records (consent), refill (clinician-gated)</td></tr>
    <tr><td>Developer platform</td><td><a href="/examples/illustrative/cloud.example.txt">cloud.example</a></td><td>deploy, fetch logs, scale (entitlement-gated)</td></tr>
  </table>
  <p class="muted">Notice the pattern: read-only capabilities are simple; the consequential ones (a transfer, a refill, a deploy) note who must approve and that the action is recorded. That hand-off — from "what you can do" to "may I, and can I prove it" — is where <a href="https://capabilityhostprotocol.com">CHP</a> picks up.</p>
</section>

<section id="adopt">
  <h2>Adopt it</h2>
  <p>Two near-zero-effort paths: <a href="/generate">generate it from your OpenAPI</a> in ten seconds, or <a href="/implement">copy a prompt</a> and hand it to your AI coding agent — it writes your <code>/capabilities.txt</code> from your real API. Then <a href="/submit">check it</a> for a grade and a badge, and it’s discoverable in the <a href="/directory">directory</a> + <a href="/map">map</a>.</p>
  <p class="muted">Prefer to do it by hand? 1. List the capabilities your site exposes. 2. Write them into <code>/capabilities.txt</code> using the format above. 3. Optionally publish <code>/.well-known/capabilities.json</code>. 4. <a href="/submit">check + list it</a>.</p>
  <p class="muted">From the command line instead:</p>
  <pre><code># generate from an OpenAPI description
python tools/from_openapi.py https://api.yoursite.com/openapi.json &gt; capabilities.txt

# validate any capabilities.txt
curl -s https://yoursite.com/capabilities.txt | python tools/validate.py -</code></pre>
</section>

<section id="agents">
  <h2>For agents (how to consume it)</h2>
  <p>capabilities.txt is only as useful as the agents that read it. The consumer flow is deliberately simple:</p>
  <ol style="color:#c7ccd1;padding-left:22px">
    <li><strong>Discover</strong> — fetch <code>https://host/capabilities.txt</code> (or <code>/.well-known/capabilities.json</code> for structure).</li>
    <li><strong>Choose</strong> — pick a capability by id and read its one-line description.</li>
    <li><strong>Invoke</strong> — call it via the host's invocation endpoint (an MCP server, an HTTP API, etc.) that the file points to. capabilities.txt does discovery; it hands off invocation.</li>
  </ol>
  <p class="muted">A capability that <em>does</em> something — a transfer, a refill, a deploy — should also tell a careful agent <em>whether it may</em> and <em>whether the action is recorded</em>. That governance layer is <a href="https://capabilityhostprotocol.com">CHP</a>; capabilities.txt is the public front door to it.</p>
</section>

<section id="next">
  <h2>Where this goes next</h2>
  <div class="next">
    <p style="margin-bottom:8px">Discovery is the first step. Once an agent knows <em>what</em> you can do, the next questions are <em>may I</em>, <em>what happened</em>, and <em>can I prove it</em> — invocation, governance, and evidence.</p>
    <p class="muted" style="margin:0">Those are defined by the <a href="https://capabilityhostprotocol.com">Capability Host Protocol</a>, an open protocol for which <code>capabilities.txt</code> is the natural public face. You can adopt <code>capabilities.txt</code> on its own; CHP is where it leads if you need the rest.</p>
  </div>
</section>

<section id="faq">
  <h2>FAQ</h2>
  <h3>Isn't this just MCP?</h3>
  <p class="muted">No — they're complementary. MCP is a stateful connection that <em>runs</em> tools. capabilities.txt is the static, crawlable layer <em>before</em> that: an agent (or a search engine) reads it with no connection, then uses MCP/your API to actually invoke. Discovery vs. invocation.</p>
  <h3>Isn't this just OpenAPI?</h3>
  <p class="muted">OpenAPI describes the shape of an HTTP API in detail. capabilities.txt is a one-screen, human-and-agent-readable advertisement of <em>what you can do</em> — published at a well-known path, framework-agnostic, and able to point at <em>any</em> invocation method (MCP, HTTP, gRPC). You can generate one <em>from</em> OpenAPI.</p>
  <h3>Isn't this just llms.txt for actions?</h3>
  <p class="muted">Essentially, yes — and that's the point. llms.txt says what's worth <em>reading</em>; capabilities.txt says what you can <em>do</em>. Same spirit, the next layer.</p>
  <h3>Isn't <code>llms.txt</code> + <code>mcp.json</code> already enough?</h3>
  <p class="muted">They cover different things, and both assume more than this does. <code>llms.txt</code> is for <em>reading</em>, not actions. An <code>mcp.json</code> advertises that you run an <em>MCP server</em> — which means (a) you have to run one, and (b) discovery is connection-first: a client connects to learn the tools. capabilities.txt is invocation-agnostic (it can point at an MCP server, a plain HTTP API, anything) and <em>static</em> — an agent or even a search engine reads it with no connection and no MCP client. Most sites have a REST API and no MCP server; capabilities.txt works for them too. They <em>compose</em>: capabilities.txt is the public catalog; <code>mcp.json</code> is one of the endpoints it hands off to.</p>
  <h3>Do I need CHP to use it?</h3>
  <p class="muted">No. capabilities.txt stands alone — publish one today, point it at whatever you already run. CHP is where it leads <em>if</em> you need governance, permissions, and provable evidence for the actions.</p>
  <h3>Won't this expose me to abuse?</h3>
  <p class="muted">It only advertises what you already expose; it grants nothing. Authentication, rate limits, and authorization stay on your invocation endpoint. Declaring a capability is not the same as leaving it open.</p>
  <h3>Isn't this just another file nobody needs?</h3>
  <p class="muted">It's deliberately minimal and complementary — it fills the one gap none of the others do (what a host can <em>do</em>) and hands off to whatever you already run rather than replacing it. The cost is an afternoon, or zero if you generate it from your OpenAPI. The result is fewer bespoke, per-vendor integrations, not more files to maintain.</p>
  <h3>Will agents actually use it?</h3>
  <p class="muted">Agentic and IDE tooling already fetches well-known files like llms.txt. capabilities.txt is the same cheap, agent-readable infrastructure — for action, not just reading. It's a proposal; adoption is the work, and your feedback shapes it.</p>
</section>

<footer>
  <p>A proposal with a working reference, not a finished standard — and it's better for your feedback. <a href="https://github.com/capabilityhostprotocol/capabilities-txt">Open an issue or PR</a>.</p>
  <p class="muted">Spec &amp; site text: CC BY 4.0 · tooling: Apache-2.0 · "capabilities.txt" is a free, open convention (no trademark). © 2026 Project Auxo, Inc. and contributors.</p>
</footer>
`;

export default function Home() {
  return (
    <div className="wrap">
      <Nav />
      <div dangerouslySetInnerHTML={{ __html: BODY }} />
    </div>
  );
}
