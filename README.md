# capabilities.txt

> A simple, open convention for a website to declare **what it can do** — the
> capabilities an agent can discover and invoke — at a well-known location.

The web taught machines to read in layers. `robots.txt` says what a crawler *may
access*. `sitemap.xml` says what *exists*. `llms.txt` says what's *worth reading*.
Each answers one narrow question for an automated reader.

None of them answers the question agents now ask: **what can this host actually
*do*?**

Agents have stopped only *reading* the web and started *acting* on it. An agent
that lands on your site can summarize your docs — but it has no standard way to
discover that you expose a "create support ticket" capability, a "check inventory"
capability, or "start a return," and how to call them. Today that happens through
bespoke, one-vendor-at-a-time integrations.

`capabilities.txt` is the missing layer: **a public, well-known file where a host
declares the capabilities it offers, so any agent can discover what it can do.**

It is deliberately small. `llms.txt` worked because you could adopt it in an
afternoon. `capabilities.txt` follows the same rule.

## The two forms

A host publishes one or both:

- **`/capabilities.txt`** — human- and agent-readable **markdown**: capabilities
  grouped by category, each with an id, version, and one-line description.
- **`/.well-known/capabilities.json`** — the **structured** form: an array of
  capability references, each resolvable to a full descriptor.

The markdown form is for discovery and reading. The JSON form is for machines that
want structure. Publishing the markdown form alone is a perfectly good start.

## Format (`/capabilities.txt`)

```markdown
# capabilities.txt

> One sentence: what this host is and what kind of capabilities it offers.
> Structured form: https://example.com/.well-known/capabilities.json

## <Category>

### <Group name> (<group-id>)

- <capability-id> (v<version>) — <one-line description>
- <capability-id> (v<version>) — <one-line description>
```

Rules, kept minimal:

1. **Line 1** is `# capabilities.txt`.
2. A **blockquote** (`>`) summary follows: one sentence on what the host offers,
   plus optional links (the JSON form, docs, an invocation endpoint).
3. **`##`** headings group capabilities by category (free-form, your choice).
4. **`###`** headings name a group, optionally with a stable `(group-id)`.
5. Each capability is a **list item**: a stable `capability-id`, an optional
   `(v<version>)`, and a short `— description`.
6. It's just markdown. If a human can read it and an agent can parse it, it's valid.

## Structured form (`/.well-known/capabilities.json`)

```json
{
  "version": "1",
  "capabilities": [
    {
      "id": "support.create_ticket",
      "version": "1.2.0",
      "description": "Open a support ticket",
      "descriptor": "https://example.com/.well-known/capabilities/support.create_ticket.json"
    }
  ]
}
```

Each entry is a reference; `descriptor` (optional) points to a full machine-readable
description of inputs, permissions, and how to invoke.

## Where it sits among the standards

| File | Answers | For |
|---|---|---|
| `robots.txt` | What may a crawler access? | Crawlers |
| `sitemap.xml` | What pages exist? | Search engines |
| `llms.txt` | What's worth reading? | LLMs reading |
| **`capabilities.txt`** | **What can this host *do*?** | **Agents acting** |

It is **not** a replacement for MCP or an API spec. The Model Context Protocol is a
stateful connection-and-invocation protocol; OpenAPI describes an HTTP API.
`capabilities.txt` is the layer *before* invocation — a static, public, crawlable
advertisement an agent (or a search engine) can read with no live connection, that
**points to** your MCP server, HTTP API, or other endpoint for the actual call.
Discovery and invocation are different jobs. capabilities.txt does discovery; it
hands off invocation.

## Adopt it

1. List the capabilities your site exposes (or could).
2. Write them into `/capabilities.txt` using the format above.
3. Optionally publish `/.well-known/capabilities.json`.
4. Add yourself to [`adopters.md`](adopters.md) with a pull request.

A working reference — a real, live `capabilities.txt` — is in
[`examples/`](examples/), and the validator in [`tools/`](tools/) checks your file.

## Where this goes next

Discovery is the first step. Once an agent knows *what* you can do, the next
questions are *may I*, *what happened*, and *can I prove it* — invocation,
governance, and evidence. Those are defined by the
[Capability Host Protocol (CHP)](https://capabilityhostprotocol.com), an open
protocol for which `capabilities.txt` is the natural public face. You can adopt
`capabilities.txt` on its own; CHP is where it leads if you need the rest.

## Status & license

This is a proposal with a working reference, not a finished standard — and it's
better for your feedback. Open an issue or PR.

- **Specification & site text** (`README.md`, `index.html`, `SPEC.md`): CC BY 4.0 — see
  [`LICENSE-DOCS`](LICENSE-DOCS).
- **Tooling** (`tools/`): Apache-2.0 — see [`LICENSE`](LICENSE).
- "capabilities.txt" is a free, open convention — use it freely. (No trademark.)

Copyright © 2026 Project Auxo, Inc. and contributors.
