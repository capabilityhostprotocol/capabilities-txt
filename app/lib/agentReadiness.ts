// Agent-Readiness checker — scores a domain across the agentic-web stack, not just
// capabilities.txt. Deterministic, presence-based v1: fetch well-known paths, parse
// robots AI-crawler rules, detect JSON-LD / OpenAPI / MCP / A2A. Reuses the
// capabilities.txt conformance engine for that one signal. Published rubric: /rubric.

import { analyze } from './conformance';

const TIMEOUT_MS = 6_000;
const MAX_BYTES = 300_000;

export type Category = 'discoverable' | 'invocable' | 'identifiable' | 'provable';
export type SignalStatus = 'pass' | 'partial' | 'fail';

export interface Signal {
  id: string;
  label: string;
  category: Category;
  status: SignalStatus;
  earned: number; // points earned
  max: number; // points possible
  detail: string; // what we found
  fix?: string; // how to improve, if not full
}

export interface CategoryScore {
  category: Category;
  label: string;
  earned: number;
  max: number;
  pct: number; // 0–100
  signals: Signal[];
}

export interface AgentReadinessReport {
  domain: string;
  fetchedAt: string; // ISO
  ok: boolean; // the host was reachable
  score: number; // 0–100 overall
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  categories: CategoryScore[];
  topFixes: { label: string; fix: string }[];
}

const CATEGORY_LABELS: Record<Category, string> = {
  discoverable: 'Discoverable',
  invocable: 'Invocable',
  identifiable: 'Identifiable & Trusted',
  provable: 'Provable',
};

const AI_CRAWLERS = [
  'GPTBot',
  'ClaudeBot',
  'anthropic-ai',
  'PerplexityBot',
  'CCBot',
  'Google-Extended',
  'OAI-SearchBot',
];

type Fetched = { ok: boolean; status: number; text: string } | null;

// Guard against SPA / catch-all servers that return 200 + HTML for any path,
// which would otherwise falsely "pass" llms.txt / capabilities.txt / etc.
function looksHtml(t: string): boolean {
  const head = t.trimStart().slice(0, 200).toLowerCase();
  return head.startsWith('<!doctype html') || head.startsWith('<html') || /<head[\s>]/.test(head);
}

async function fetchText(url: string): Promise<Fetched> {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'capabilitiestxt.org-grader/0.1 (+https://capabilitiestxt.org)' },
      signal: AbortSignal.timeout(TIMEOUT_MS),
      redirect: 'follow',
    });
    const text = res.ok ? (await res.text()).slice(0, MAX_BYTES) : '';
    return { ok: res.ok, status: res.status, text };
  } catch {
    return null;
  }
}

async function firstHit(urls: string[], looksRight: (t: string) => boolean): Promise<string | null> {
  for (const u of urls) {
    const r = await fetchText(u);
    if (r?.ok && r.text.trim() && looksRight(r.text)) return u;
  }
  return null;
}

// Parse robots.txt into user-agent → directives. Returns how AI crawlers are treated.
function robotsVerdict(text: string): { aiBlocked: boolean; globalBlock: boolean } {
  const lines = text.split(/\r?\n/).map((l) => l.replace(/#.*$/, '').trim());
  let current: string[] = [];
  const groups: { agents: string[]; disallows: string[] }[] = [];
  let pendingAgents: string[] = [];
  let collecting = false;
  for (const line of lines) {
    const m = /^user-agent:\s*(.+)$/i.exec(line);
    if (m) {
      if (collecting) {
        // starting a fresh group after directives
        pendingAgents = [];
        collecting = false;
      }
      pendingAgents.push(m[1].trim());
      current = pendingAgents;
      continue;
    }
    const d = /^disallow:\s*(.*)$/i.exec(line);
    if (d) {
      collecting = true;
      const grp = groups.find((g) => g.agents === current);
      if (grp) grp.disallows.push(d[1].trim());
      else groups.push({ agents: current.slice(), disallows: [d[1].trim()] });
    }
  }
  const blocksRoot = (g: { disallows: string[] }) => g.disallows.some((x) => x === '/' );
  const globalBlock = groups.some((g) => g.agents.some((a) => a === '*') && blocksRoot(g));
  const aiBlocked =
    globalBlock ||
    groups.some((g) => g.agents.some((a) => AI_CRAWLERS.some((b) => a.toLowerCase() === b.toLowerCase())) && blocksRoot(g));
  return { aiBlocked, globalBlock };
}

export async function gradeAgentReadiness(input: string): Promise<AgentReadinessReport> {
  let host = input.trim().replace(/^https?:\/\//i, '').replace(/\/.*$/, '');
  const origin = `https://${host}`;
  const fetchedAt = new Date().toISOString();

  // Fire the independent fetches in parallel.
  const [robots, sitemap, llms, home, mcp1, mcp2, a2a1, a2a2] = await Promise.all([
    fetchText(`${origin}/robots.txt`),
    fetchText(`${origin}/sitemap.xml`),
    fetchText(`${origin}/llms.txt`),
    fetchText(`${origin}/`),
    fetchText(`${origin}/.well-known/mcp.json`),
    fetchText(`${origin}/mcp.json`),
    fetchText(`${origin}/.well-known/agent-card.json`),
    fetchText(`${origin}/.well-known/agent.json`),
  ]);

  const reachable = [robots, home, sitemap, llms].some((r) => r && (r.ok || r.status > 0));

  // capabilities.txt (reuse the conformance engine)
  let capSignal: Signal;
  {
    const capTry = await fetchText(`${origin}/capabilities.txt`);
    const capRes =
      capTry?.ok && capTry.text.trim() && !looksHtml(capTry.text)
        ? capTry
        : await fetchText(`${origin}/.well-known/capabilities.json`);
    if (capRes?.ok && capRes.text.trim() && !looksHtml(capRes.text)) {
      const rep = analyze(capRes.text);
      const earned = rep.ok ? Math.round(12 * (rep.score / 100)) : 4;
      capSignal = {
        id: 'capabilities_txt',
        label: 'capabilities.txt',
        category: 'discoverable',
        status: rep.ok && rep.grade <= 'B' ? 'pass' : rep.ok ? 'partial' : 'partial',
        earned,
        max: 12,
        detail: rep.ok ? `Present — grade ${rep.grade} (${rep.capabilities.length} capabilities)` : 'Present but not yet valid',
        fix: rep.ok ? undefined : 'Fix conformance so agents can parse your capabilities.',
      };
    } else {
      capSignal = {
        id: 'capabilities_txt',
        label: 'capabilities.txt',
        category: 'discoverable',
        status: 'fail',
        earned: 0,
        max: 12,
        detail: 'No /capabilities.txt found',
        fix: 'Declare what your site can do — generate one at /generate.',
      };
    }
  }

  // robots
  let robotsSignal: Signal;
  let aiCrawlerSignal: Signal;
  if (robots?.ok && robots.text.trim() && !looksHtml(robots.text)) {
    const v = robotsVerdict(robots.text);
    robotsSignal = {
      id: 'robots', label: 'robots.txt', category: 'discoverable', status: 'pass',
      earned: 5, max: 5, detail: 'Present',
    };
    aiCrawlerSignal = v.aiBlocked
      ? { id: 'ai_crawlers', label: 'AI crawlers allowed', category: 'discoverable', status: v.globalBlock ? 'fail' : 'partial', earned: v.globalBlock ? 0 : 4, max: 10, detail: v.globalBlock ? 'robots.txt blocks all crawlers from the root' : 'Some AI crawlers are disallowed', fix: 'Explicitly allow GPTBot, ClaudeBot, PerplexityBot, CCBot, Google-Extended.' }
      : { id: 'ai_crawlers', label: 'AI crawlers allowed', category: 'discoverable', status: 'pass', earned: 10, max: 10, detail: 'AI crawlers are not blocked' };
  } else {
    robotsSignal = { id: 'robots', label: 'robots.txt', category: 'discoverable', status: 'fail', earned: 0, max: 5, detail: 'No robots.txt found', fix: 'Add a robots.txt (and welcome the AI crawlers).' };
    aiCrawlerSignal = { id: 'ai_crawlers', label: 'AI crawlers allowed', category: 'discoverable', status: 'partial', earned: 6, max: 10, detail: 'No robots.txt — crawlers not blocked, but not explicitly welcomed', fix: 'Explicitly allow the AI crawlers in robots.txt.' };
  }

  const sitemapHit = (sitemap?.ok && sitemap.text.includes('<urlset')) || /sitemap:/i.test(robots?.text ?? '');
  const sitemapSignal: Signal = sitemapHit
    ? { id: 'sitemap', label: 'sitemap.xml', category: 'discoverable', status: 'pass', earned: 5, max: 5, detail: 'Present' }
    : { id: 'sitemap', label: 'sitemap.xml', category: 'discoverable', status: 'fail', earned: 0, max: 5, detail: 'No sitemap found', fix: 'Publish a sitemap.xml and reference it in robots.txt.' };

  const llmsHit = !!(llms?.ok && llms.text.trim() && !looksHtml(llms.text));
  const llmsSignal: Signal = llmsHit
    ? { id: 'llms', label: 'llms.txt', category: 'discoverable', status: 'pass', earned: 10, max: 10, detail: 'Present' }
    : { id: 'llms', label: 'llms.txt', category: 'discoverable', status: 'fail', earned: 0, max: 10, detail: 'No llms.txt found', fix: 'Add an llms.txt pointing agents at what to read.' };

  const jsonLd = !!(home?.ok && /application\/ld\+json/i.test(home.text));
  const jsonLdSignal: Signal = jsonLd
    ? { id: 'jsonld', label: 'schema.org JSON-LD', category: 'discoverable', status: 'pass', earned: 8, max: 8, detail: 'Structured data present on the homepage' }
    : { id: 'jsonld', label: 'schema.org JSON-LD', category: 'discoverable', status: 'fail', earned: 0, max: 8, detail: 'No JSON-LD detected on the homepage', fix: 'Emit schema.org JSON-LD (Organization, potentialAction).' };

  // Invocable — OpenAPI + MCP
  const openapiUrl = await firstHit(
    [`${origin}/openapi.json`, `${origin}/.well-known/openapi.json`, `${origin}/swagger.json`, `${origin}/api/openapi.json`, `${origin}/openapi.yaml`],
    (t) => /"openapi"|"swagger"|^openapi:/m.test(t),
  );
  const openapiSignal: Signal = openapiUrl
    ? { id: 'openapi', label: 'OpenAPI discoverable', category: 'invocable', status: 'pass', earned: 18, max: 18, detail: `Found at ${openapiUrl.replace(origin, '')}` }
    : { id: 'openapi', label: 'OpenAPI discoverable', category: 'invocable', status: 'fail', earned: 0, max: 18, detail: 'No OpenAPI document found at common paths', fix: 'Expose an OpenAPI description so agents (and our generator) can map your API.' };

  const mcpHit = (mcp1?.ok && mcp1.text.trimStart().startsWith('{')) || (mcp2?.ok && mcp2.text.trimStart().startsWith('{'));
  const mcpSignal: Signal = mcpHit
    ? { id: 'mcp', label: 'MCP server advertised', category: 'invocable', status: 'pass', earned: 12, max: 12, detail: 'mcp.json present' }
    : { id: 'mcp', label: 'MCP server advertised', category: 'invocable', status: 'fail', earned: 0, max: 12, detail: 'No mcp.json found', fix: 'Advertise an MCP server (optional) for live tool invocation.' };

  // Identifiable — A2A agent card
  const a2aHit = (a2a1?.ok && a2a1.text.trimStart().startsWith('{')) || (a2a2?.ok && a2a2.text.trimStart().startsWith('{'));
  const a2aSignal: Signal = a2aHit
    ? { id: 'a2a', label: 'A2A agent card', category: 'identifiable', status: 'pass', earned: 15, max: 15, detail: 'Agent card present at a well-known path' }
    : { id: 'a2a', label: 'A2A agent card', category: 'identifiable', status: 'fail', earned: 0, max: 15, detail: 'No /.well-known/agent-card.json found', fix: 'Publish an A2A agent card so agents recognize your identity.' };

  // Provable — the frontier signal (almost always 0 today → CHP)
  const provableSignal: Signal = {
    id: 'provable', label: 'Provable agent actions', category: 'provable', status: 'fail', earned: 0, max: 5,
    detail: 'No standard way to prove what agents did — the industry frontier',
    fix: 'For consequential actions, capture governed, replayable evidence — see capabilityhostprotocol.com.',
  };

  const allSignals = [
    robotsSignal, aiCrawlerSignal, sitemapSignal, llmsSignal, jsonLdSignal, capSignal,
    openapiSignal, mcpSignal, a2aSignal, provableSignal,
  ];

  const cats: Category[] = ['discoverable', 'invocable', 'identifiable', 'provable'];
  const categories: CategoryScore[] = cats.map((c) => {
    const sigs = allSignals.filter((s) => s.category === c);
    const earned = sigs.reduce((a, s) => a + s.earned, 0);
    const max = sigs.reduce((a, s) => a + s.max, 0);
    return { category: c, label: CATEGORY_LABELS[c], earned, max, pct: max ? Math.round((earned / max) * 100) : 0, signals: sigs };
  });

  const score = categories.reduce((a, c) => a + c.earned, 0);
  const grade: AgentReadinessReport['grade'] =
    score >= 85 ? 'A' : score >= 70 ? 'B' : score >= 55 ? 'C' : score >= 40 ? 'D' : 'F';

  const topFixes = allSignals
    .filter((s) => s.status !== 'pass' && s.fix)
    .sort((a, b) => (b.max - b.earned) - (a.max - a.earned))
    .slice(0, 4)
    .map((s) => ({ label: s.label, fix: s.fix! }));

  return { domain: host, fetchedAt, ok: reachable, score, grade, categories, topFixes };
}
