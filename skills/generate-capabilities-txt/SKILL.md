---
name: generate-capabilities-txt
description: Generate a /capabilities.txt for a project so AI agents can discover what it can do — from its OpenAPI spec or codebase. Use when adding agent-discovery to a web API, SaaS, or app.
---

# Generate a capabilities.txt

capabilities.txt (https://capabilitiestxt.org) is an open convention: a `/capabilities.txt`
file at a site's root that declares what it can *do*, so AI agents can discover invocable
capabilities. Sibling to robots.txt and llms.txt; it points at your MCP server or API for
the actual call.

## Steps
1. **Find the capabilities.** Prefer an OpenAPI spec (each operation = a capability); else
   public API routes / RPC handlers / core product features. Skip internal/admin-only
   endpoints unless meant to be publicly invocable.
2. **Write `/capabilities.txt`:**

   ```
   # capabilities.txt

   > One sentence: what this host is and the capabilities it offers.
   > Structured form: https://DOMAIN/.well-known/capabilities.json
   > Invocation: your MCP server / REST API / OpenAPI URL.

   ## <Category>

   ### <Group name> (<group-id>)

   - <capability-id> (v<version>) — <one-line description>
   ```

   Each capability: a stable dotted id, optional `(vX)`, short description. For
   consequential actions (a payment, a deletion, a deploy), note auth/approval and whether
   the action is recorded.
3. **Optionally** write the structured `/.well-known/capabilities.json` (mirror the ids).
4. **Serve both at the web root** (public/ or static dir, or a route). Use REAL ids and
   descriptions from this project — never invent capabilities it doesn't have.
5. **Validate** at https://capabilitiestxt.org/submit (grade + a badge), then list it.

## Shortcut
If the project has an OpenAPI URL, you can generate the file in one step at
https://capabilitiestxt.org/generate (or `from_openapi`), then tidy the descriptions.
