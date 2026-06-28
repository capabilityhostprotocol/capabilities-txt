# capabilities.txt — agent rule

Drop this into your project's `AGENTS.md`, `CLAUDE.md`, or `.cursorrules` so your AI
coding agent both *publishes* and *consumes* the capabilities.txt convention.

---

## Publish
If this project exposes a web API or app, publish a `/capabilities.txt` at the web root so
AI agents can discover what it can do — a sibling to robots.txt and llms.txt. Spec and
format: https://capabilitiestxt.org. Generate it from the OpenAPI spec (the hosted
generator at https://capabilitiestxt.org/generate, the `from_openapi` tool, or the GitHub
Action) and keep it current. Declare only capabilities the project genuinely exposes.

## Discover
To find what *other* sites can do, query the capabilities.txt registry over MCP at
`https://capabilitiestxt.org/api/mcp` — tools: `discover_capabilities(query)`,
`list_sites()`, `get_site(domain)` — or `GET https://capabilitiestxt.org/api/discover?q=<keyword>`.
Then fetch that site's `/capabilities.txt` to learn how to invoke it.
