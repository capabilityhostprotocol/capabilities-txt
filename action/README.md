# capabilities.txt — GitHub Action

Generate (and keep current) a `/capabilities.txt` from your OpenAPI spec on every
push — the zero-effort way to publish one, so AI agents can discover what your site
can do. See [capabilitiestxt.org](https://capabilitiestxt.org).

## Usage

```yaml
# .github/workflows/capabilities-txt.yml
name: capabilities.txt
on:
  push:
    branches: [main]
permissions:
  contents: write
jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: capabilityhostprotocol/capabilities-txt/action@main
        with:
          openapi: https://api.yoursite.com/openapi.json   # or a path like ./openapi.json
          output: public/capabilities.txt                  # served at /capabilities.txt
          structured: 'true'                                # also write /.well-known/capabilities.json
      - uses: stefanzweifel/git-auto-commit-action@v5
        with:
          commit_message: 'chore: refresh capabilities.txt'
```

## Inputs

| Input | Default | Description |
|---|---|---|
| `openapi` | (required) | Path or URL to your OpenAPI **JSON** document. |
| `output` | `public/capabilities.txt` | Where to write the file (serve it at your web root, i.e. `/capabilities.txt`). |
| `structured` | `false` | Also write the structured `/.well-known/capabilities.json` form. |

## Output

| Output | Description |
|---|---|
| `capabilities` | Number of capabilities generated. |

## Notes

- After it lands, **check it** at [capabilitiestxt.org/submit](https://capabilitiestxt.org/submit)
  for a grade + a badge, and **list it** so agents can discover it.
- Generated descriptions come from your OpenAPI `summary`/`description` — tidy them
  for the best grade. Declare only capabilities your API genuinely exposes.
- YAML specs aren't supported yet (convert to JSON, or open an issue).

Pin to `@main` for now. For a stable tag (`@v1`) + a Marketplace listing, this action
will move to its own repo — a follow-up.

Apache-2.0. Part of the [capabilities.txt](https://github.com/capabilityhostprotocol/capabilities-txt) project.
