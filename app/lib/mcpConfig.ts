// One-click install config for the capabilities.txt registry MCP server (remote,
// streamable-http). Server-only (uses Buffer for the Cursor deeplink base64).

export const MCP_NAME = 'capabilities-txt';
export const MCP_URL = 'https://capabilitiestxt.org/api/mcp';

// Cursor deeplink: cursor://anysphere.cursor-deeplink/mcp/install?name=…&config=<base64>
const cursorConfig = { url: MCP_URL };
export const cursorDeeplink = `cursor://anysphere.cursor-deeplink/mcp/install?name=${MCP_NAME}&config=${Buffer.from(
  JSON.stringify(cursorConfig),
).toString('base64')}`;

// Claude Code CLI
export const claudeAddCmd = `claude mcp add --transport http ${MCP_NAME} ${MCP_URL}`;

// Raw config for Claude Desktop / other clients (mcpServers block)
export const rawConfig = JSON.stringify({ mcpServers: { [MCP_NAME]: { url: MCP_URL } } }, null, 2);
