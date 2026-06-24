#!/usr/bin/env python3
"""validate.py — check a capabilities.txt against the format.

Usage:
    python tools/validate.py path/to/capabilities.txt
    python tools/validate.py https://example.com/capabilities.txt
    curl -s https://example.com/capabilities.txt | python tools/validate.py -

Exit code 0 = valid, 1 = problems found. Apache-2.0.
"""
import re
import sys
import urllib.request


def load(src: str) -> str:
    if src == "-":
        return sys.stdin.read()
    if src.startswith(("http://", "https://")):
        with urllib.request.urlopen(src, timeout=15) as r:  # noqa: S310
            return r.read().decode("utf-8")
    with open(src, encoding="utf-8") as f:
        return f.read()


def validate(text: str) -> tuple[list[str], list[str], int]:
    errors: list[str] = []
    warnings: list[str] = []
    lines = text.splitlines()
    nonblank = [ln for ln in lines if ln.strip()]

    if not nonblank or nonblank[0].strip() != "# capabilities.txt":
        errors.append('Line 1 must be "# capabilities.txt".')

    if not any(ln.lstrip().startswith(">") for ln in lines[:8]):
        warnings.append("No blockquote (>) summary near the top — add one sentence on what the host offers.")

    if not any(ln.startswith("## ") for ln in lines):
        errors.append("No category headings (##) found.")

    cap_re = re.compile(r"^- \s*([A-Za-z0-9._:-]+)\s*(\(v[^)]+\))?\s*(—|--|-)?")
    caps = 0
    for ln in lines:
        if ln.startswith("- "):
            caps += 1
            if not cap_re.match(ln):
                warnings.append(f"Capability line not in 'id (vX) — description' form: {ln.strip()[:60]}")
    if caps == 0:
        errors.append("No capability list items (- ...) found.")

    return errors, warnings, caps


def main() -> int:
    if len(sys.argv) != 2:
        print(__doc__)
        return 2
    text = load(sys.argv[1])
    errors, warnings, caps = validate(text)
    for w in warnings:
        print(f"warning: {w}")
    for e in errors:
        print(f"error:   {e}")
    if errors:
        print(f"\nINVALID — {len(errors)} error(s), {caps} capabilities parsed.")
        return 1
    print(f"\nVALID — {caps} capabilities, {len(warnings)} warning(s).")
    return 0


if __name__ == "__main__":
    sys.exit(main())
