#!/usr/bin/env python3
"""from_openapi.py — generate a capabilities.txt from an OpenAPI 3.x document.

Most sites already have an OpenAPI spec. This turns it into a capabilities.txt
with zero manual authoring — the cheapest path to adoption.

Usage:
    python tools/from_openapi.py path/to/openapi.json   > capabilities.txt
    python tools/from_openapi.py https://api.example.com/openapi.json > capabilities.txt
    curl -s https://api.example.com/openapi.json | python tools/from_openapi.py -

Each OpenAPI operation becomes a capability. Operations are grouped by their
first tag (or by path prefix if untagged). Apache-2.0.
"""
import json
import re
import sys
import urllib.request

HTTP_METHODS = ("get", "put", "post", "delete", "patch")


def load(src: str) -> dict:
    if src == "-":
        return json.load(sys.stdin)
    if src.startswith(("http://", "https://")):
        with urllib.request.urlopen(src, timeout=20) as r:  # noqa: S310
            return json.loads(r.read().decode("utf-8"))
    with open(src, encoding="utf-8") as f:
        return json.load(f)


def slug(s: str) -> str:
    return re.sub(r"[^a-z0-9]+", "_", s.lower()).strip("_")


def cap_id(op: dict, method: str, path: str) -> str:
    if op.get("operationId"):
        return slug(op["operationId"])
    # Derive from method + path, e.g. GET /pets/{id} -> pets.get
    parts = [p for p in path.split("/") if p and not p.startswith("{")]
    base = ".".join(slug(p) for p in parts) or "root"
    return f"{base}.{method}"


def first_line(s: str) -> str:
    return " ".join(s.strip().split("\n")[0].split()) if s else ""


def generate(doc: dict) -> str:
    info = doc.get("info", {})
    title = info.get("title", "this API")
    version = str(info.get("version", "")).strip()
    servers = doc.get("servers") or []
    base = servers[0].get("url", "") if servers else ""

    # group_id -> list of (cap_id, version, description)
    groups: dict[str, list[tuple[str, str, str]]] = {}
    for path, item in (doc.get("paths") or {}).items():
        if not isinstance(item, dict):
            continue
        for method in HTTP_METHODS:
            op = item.get(method)
            if not isinstance(op, dict):
                continue
            tag = (op.get("tags") or [None])[0]
            group = tag or (path.split("/")[1] if len(path.split("/")) > 1 else "general")
            desc = first_line(op.get("summary") or op.get("description") or f"{method.upper()} {path}")
            groups.setdefault(str(group), []).append((cap_id(op, method, path), version, desc))

    lines = ["# capabilities.txt", ""]
    summary = f"> {title} — capabilities generated from its OpenAPI description."
    lines.append(summary)
    if base:
        lines.append(f"> Invocation: {base} (see the OpenAPI spec for request shapes).")
    lines.append("")

    for group, caps in groups.items():
        lines.append(f"## {group.title()}")
        lines.append("")
        lines.append(f"### {group.title()} ({slug(group)})")
        lines.append("")
        for cid, ver, desc in caps:
            v = f" (v{ver})" if ver else ""
            d = f" — {desc}" if desc else ""
            lines.append(f"- {cid}{v}{d}")
        lines.append("")

    return "\n".join(lines).rstrip() + "\n"


def main() -> int:
    if len(sys.argv) != 2:
        print(__doc__)
        return 2
    doc = load(sys.argv[1])
    sys.stdout.write(generate(doc))
    return 0


if __name__ == "__main__":
    sys.exit(main())
