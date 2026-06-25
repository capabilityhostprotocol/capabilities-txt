import { createMcpHandler } from 'mcp-handler';
import { z } from 'zod';
import { discover, listSites, getSite } from '../../lib/registry';

// The registry as an MCP server: any agent can ask "who across the web can do X",
// then fetch that site's /capabilities.txt to learn how to invoke it.
const handler = createMcpHandler(
  (server) => {
    server.registerTool(
      'discover_capabilities',
      {
        title: 'Discover capabilities across the web',
        description:
          'Search the capabilities.txt registry for sites that can do something — by capability id, keyword, or category. Returns matching capabilities with the site that offers them and its conformance grade. To invoke, fetch that site\'s /capabilities.txt.',
        inputSchema: { query: z.string().describe('A capability id, verb, or keyword, e.g. "check_stock" or "refund"') },
      },
      async ({ query }) => {
        const results = await discover(query);
        return { content: [{ type: 'text' as const, text: JSON.stringify({ query, count: results.length, results }, null, 2) }] };
      },
    );

    server.registerTool(
      'list_sites',
      {
        title: 'List registry sites',
        description: 'List every site that publishes a conformant capabilities.txt, with its grade and capability count.',
        inputSchema: {},
      },
      async () => {
        const sites = await listSites();
        return { content: [{ type: 'text' as const, text: JSON.stringify(sites, null, 2) }] };
      },
    );

    server.registerTool(
      'get_site',
      {
        title: 'Get a site\'s capabilities',
        description: 'Get the full list of capabilities a site declares, by domain.',
        inputSchema: { domain: z.string().describe('A domain, e.g. example.com') },
      },
      async ({ domain }) => {
        const site = await getSite(domain.trim().replace(/^https?:\/\//, '').replace(/\/.*$/, ''));
        return {
          content: [{ type: 'text' as const, text: site ? JSON.stringify(site, null, 2) : `No site "${domain}" is listed in the registry.` }],
        };
      },
    );
  },
  { serverInfo: { name: 'capabilities-txt-registry', version: '0.1.0' } },
  { basePath: '/api', maxDuration: 60 },
);

export { handler as GET, handler as POST };
