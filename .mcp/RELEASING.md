# Publishing the capabilities.txt registry MCP server

`server.json` is the manifest for the **official MCP registry**
(`registry.modelcontextprotocol.io`). It points at the live remote registry MCP
server at `https://capabilitiestxt.org/api/mcp` (tools: `discover_capabilities`,
`list_sites`, `get_site`). Publishing it makes the registry discoverable to any
agent that browses the MCP registry — the demand side of the flywheel.

## Publish (founder; one GitHub device-login)

```bash
# 1. Get the publisher CLI
brew install mcp-publisher            # or a release from
                                      # github.com/modelcontextprotocol/registry

# 2. Authenticate (GitHub OIDC; verifies the capabilityhostprotocol org —
#    org membership must be public, as set during the CHP publish this session)
mcp-publisher login github

# 3. Validate + publish
mcp-publisher validate .mcp/server.json
mcp-publisher publish .mcp/server.json

# 4. Confirm at https://registry.modelcontextprotocol.io (search "capabilities.txt")
```

## Then — the directories (federate discovery)

Submit to mcp.so, Smithery, Glama, PulseMCP, and a PR to `punkpeye/awesome-mcp-servers`.
Values: name `io.github.capabilityhostprotocol/capabilities-txt-registry`, transport
streamable-http, URL `https://capabilitiestxt.org/api/mcp`, tools discover_capabilities
/ list_sites / get_site, repo + site as above. (Same playbook as the CHP MCP server —
see `chp-site/.mcp/RELEASING.md`.)
