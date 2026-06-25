#!/usr/bin/env python3
"""resolve.py — the consumer side: fetch and parse a site's capabilities.txt.

This is what an agent does with a capabilities.txt: discover what a host can do,
then hand off to invocation. Stdlib only; importable + a CLI.

Usage:
    python tools/resolve.py example.com
    python tools/resolve.py https://example.com --find ticket
    python tools/resolve.py example.com --json

Library:
    from resolve import resolve, find
    caps = resolve("example.com")          # list[Capability dicts]
    hits = find(caps, "refund")            # filter by id/description
"""
import json
import re
import sys
import urllib.request

CAP_RE = re.compile(r"^- \s*([A-Za-z0-9._:-]+)\s*(?:\(v([^)]+)\))?\s*(?:—|--|-)?\s*(.*)$")


def _base(domain: str) -> str:
    d = domain.strip().rstrip("/")
    if not d.startswith(("http://", "https://")):
        d = "https://" + d
    return d


def _get(url: str) -> tuple[int, str]:
    req = urllib.request.Request(url, headers={"User-Agent": "capabilities-txt-resolver/0.1"})
    try:
        with urllib.request.urlopen(req, timeout=15) as r:  # noqa: S310
            return r.status, r.read().decode("utf-8")
    except urllib.error.HTTPError as e:  # type: ignore[attr-defined]
        return e.code, ""
    except Exception:
        return 0, ""


def fetch(domain: str) -> tuple[str, str]:
    """Return (source_url, text). Tries /capabilities.txt, then the JSON form."""
    base = _base(domain)
    url = f"{base}/capabilities.txt"
    status, body = _get(url)
    if status == 200 and body.strip():
        return url, body
    # fall back to the structured form
    jurl = f"{base}/.well-known/capabilities.json"
    status, body = _get(jurl)
    if status == 200 and body.strip():
        return jurl, body
    raise LookupError(f"No capabilities.txt or .well-known/capabilities.json found at {base}")


def parse(text: str) -> list[dict]:
    """Parse the markdown capabilities.txt (or capabilities.json) into capabilities."""
    text = text.lstrip()
    if text.startswith("{"):
        data = json.loads(text)
        return [
            {"category": "", "group": "", "id": c.get("id", ""), "version": str(c.get("version", "")),
             "description": c.get("description", "")}
            for c in data.get("capabilities", [])
        ]
    caps: list[dict] = []
    category = group = ""
    for line in text.splitlines():
        if line.startswith("## "):
            category = line[3:].strip()
        elif line.startswith("### "):
            group = re.sub(r"\s*\([^)]*\)\s*$", "", line[4:]).strip()
        else:
            m = CAP_RE.match(line)
            if m:
                caps.append({"category": category, "group": group, "id": m.group(1),
                             "version": m.group(2) or "", "description": (m.group(3) or "").strip()})
    return caps


def resolve(domain: str) -> list[dict]:
    _, text = fetch(domain)
    return parse(text)


def find(caps: list[dict], query: str) -> list[dict]:
    q = query.lower()
    return [c for c in caps if q in c["id"].lower() or q in c["description"].lower()]


def main() -> int:
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    if not args:
        print(__doc__)
        return 2
    domain = args[0]
    as_json = "--json" in sys.argv
    query = None
    if "--find" in sys.argv:
        i = sys.argv.index("--find")
        query = sys.argv[i + 1] if i + 1 < len(sys.argv) else ""
    try:
        src, text = fetch(domain)
    except LookupError as e:
        print(f"error: {e}", file=sys.stderr)
        return 1
    caps = parse(text)
    if query:
        caps = find(caps, query)
    if as_json:
        print(json.dumps(caps, indent=2))
    else:
        print(f"# {len(caps)} capabilities from {src}\n")
        for c in caps:
            v = f" (v{c['version']})" if c["version"] else ""
            print(f"- {c['id']}{v} — {c['description']}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
