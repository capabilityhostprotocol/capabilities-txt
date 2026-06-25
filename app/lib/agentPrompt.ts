// The copy-paste prompt people hand to their AI coding agent (or a developer)
// to generate a conformant capabilities.txt for their site. Self-contained — no
// backticks so it stays a clean template literal. Reused on /implement + the README.

export const AGENT_PROMPT = `You are adding a "capabilities.txt" to this project — an open convention that lets AI agents discover what this site/app can do. Create two files, served at the web root:

  1. /capabilities.txt               (markdown)
  2. /.well-known/capabilities.json  (structured JSON)

FIND THE CAPABILITIES
Inspect this project for the consequential things a user (or their agent) can DO — actions and queries, not pages to read. Best sources, in order:
  - an OpenAPI/Swagger spec (each operation is a capability),
  - public API routes / controllers / RPC handlers,
  - the product's core features ("create ticket", "check inventory", "start return", "book appointment").
Skip internal/admin-only endpoints unless they are meant to be publicly invocable.

FORMAT — /capabilities.txt
Line 1 must be exactly:  # capabilities.txt
Then a ">" blockquote summary, then "##" category headings, "###" group headings, and one list item per capability, like this:

    # capabilities.txt

    > One sentence: what this host is and the capabilities it offers.
    > Structured form: https://YOURDOMAIN/.well-known/capabilities.json
    > Invocation: how to call these (your MCP server, REST API, or OpenAPI URL).

    ## Support

    ### Tickets (support.tickets)

    - support.create_ticket (v1.2.0) — Open a support ticket
    - support.get_status (v1.0.0) — Check a ticket's status

Each capability is: a stable dotted id, an optional (vX) version, and a short description. For any capability that DOES something consequential (a payment, a deletion, a deploy), note in its description whether it needs auth/approval and whether the action is recorded.

FORMAT — /.well-known/capabilities.json
A JSON object mirroring the same ids/versions/descriptions:

    {
      "version": "1",
      "capabilities": [
        { "id": "support.create_ticket", "version": "1.2.0", "description": "Open a support ticket" }
      ]
    }

RULES
  - Use REAL ids, versions, and descriptions from THIS project. Do NOT invent capabilities it does not have.
  - Serve both files at the web root (the public/ or static directory, or a route).
  - Validate the result at https://capabilitiestxt.org/submit
  - Reference spec: https://capabilitiestxt.org

Output both files and tell me exactly where to place them in this project.`;
