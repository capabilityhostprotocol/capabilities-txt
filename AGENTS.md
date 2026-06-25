# AGENTS.md

This repository defines **capabilities.txt** — an open convention for a website to
declare what it can do, so agents can discover it. The README *is* the spec; the
site is capabilitiestxt.org.

## Layout
- `README.md` — the specification.
- `index.html` — the standalone site (served at capabilitiestxt.org).
- `tools/` — `validate.py`, `from_openapi.py`, `resolve.py`, `mcp_server.py`.
- `examples/` — a real live example + illustrative templates across markets.
- `adopters.md` — the directory (PR your entry).

## Conventions
- Keep the spec small and adopt-in-an-afternoon (llms.txt-style).
- Tooling is stdlib-only where possible; the MCP server needs `pip install mcp`.
- "capabilities.txt" is a free convention — no trademark.
- License: CC BY 4.0 (spec/site) + Apache-2.0 (tools).

## Common tasks
    python tools/validate.py path/to/capabilities.txt
    python tools/from_openapi.py https://api.example.com/openapi.json > capabilities.txt
    python tools/resolve.py example.com --find ticket
