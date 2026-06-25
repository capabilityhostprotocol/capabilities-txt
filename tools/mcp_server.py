#!/usr/bin/env python3
"""mcp_server.py — an MCP server that lets any agent consume capabilities.txt.

This is the demand side: point an MCP client (Claude, Cursor, etc.) at this
server, and an agent can discover what any website can do — then hand off to
that site's invocation endpoint (its MCP server, HTTP API, …).

Run:
    pip install mcp
    python tools/mcp_server.py          # stdio transport

Register it with your MCP client as a stdio server running this file.
Tools:
    resolve_capabilities(domain)        -> all capabilities a site declares
    find_capability(domain, query)      -> capabilities matching a query

Apache-2.0.
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import resolve as _resolve  # noqa: E402

try:
    from mcp.server.fastmcp import FastMCP
except ImportError:
    sys.exit("This server needs the MCP SDK. Install it with:  pip install mcp")

mcp = FastMCP("capabilities-txt-resolver")


@mcp.tool()
def resolve_capabilities(domain: str) -> list[dict]:
    """Fetch and parse a website's capabilities.txt and return what it can do.

    Tries https://<domain>/capabilities.txt, then /.well-known/capabilities.json.
    Each result has: category, group, id, version, description. capabilities.txt
    is a discovery layer — to actually invoke a capability, use the site's own
    invocation endpoint (e.g. its MCP server or HTTP API).
    """
    return _resolve.resolve(domain)


@mcp.tool()
def find_capability(domain: str, query: str) -> list[dict]:
    """Find capabilities on a site whose id or description matches a query."""
    return _resolve.find(_resolve.resolve(domain), query)


if __name__ == "__main__":
    mcp.run()
