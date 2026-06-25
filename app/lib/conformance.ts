// Conformance engine for capabilities.txt — TS port of tools/validate.py + a
// grade and actionable recommendations. Keep the rules in sync with the CLI.

export interface Capability {
  category: string;
  group: string;
  id: string;
  version: string;
  description: string;
}

export interface Recommendation {
  level: 'ok' | 'warn' | 'err';
  text: string;
}

export interface Report {
  ok: boolean; // valid base (parseable as a capabilities.txt)
  grade: 'A' | 'B' | 'C' | 'F';
  score: number; // 0–100
  capabilities: Capability[];
  categories: number;
  errors: string[];
  recommendations: Recommendation[];
}

const CAP_RE = /^- \s*([A-Za-z0-9._:-]+)\s*(?:\(v([^)]+)\))?\s*(?:—|--|-)?\s*(.*)$/;

export function parse(text: string): Capability[] {
  const t = text.replace(/^﻿/, '').trimStart();
  if (t.startsWith('{')) {
    try {
      const data = JSON.parse(t);
      return (data.capabilities ?? []).map((c: Record<string, unknown>) => ({
        category: '',
        group: '',
        id: String(c.id ?? ''),
        version: String(c.version ?? ''),
        description: String(c.description ?? ''),
      }));
    } catch {
      return [];
    }
  }
  const caps: Capability[] = [];
  let category = '';
  let group = '';
  for (const line of text.split('\n')) {
    if (line.startsWith('## ')) category = line.slice(3).trim();
    else if (line.startsWith('### ')) group = line.slice(4).replace(/\s*\([^)]*\)\s*$/, '').trim();
    else {
      const m = CAP_RE.exec(line);
      if (m) caps.push({ category, group, id: m[1], version: m[2] ?? '', description: (m[3] ?? '').trim() });
    }
  }
  return caps;
}

export function analyze(text: string): Report {
  const lines = text.split('\n');
  const nonblank = lines.filter((l) => l.trim());
  const errors: string[] = [];
  const recs: Recommendation[] = [];

  const isJson = text.replace(/^﻿/, '').trimStart().startsWith('{');
  const headerOk = isJson || (nonblank.length > 0 && nonblank[0].trim() === '# capabilities.txt');
  const summaryPresent = isJson || lines.slice(0, 10).some((l) => l.trimStart().startsWith('>'));
  const categories = lines.filter((l) => l.startsWith('## ')).length;
  const caps = parse(text);

  if (!headerOk) errors.push('Line 1 must be "# capabilities.txt".');
  if (!isJson && categories === 0) errors.push('No category headings (## …) found.');
  if (caps.length === 0) errors.push('No capabilities found.');

  const structuredHinted = /\.well-known\/capabilities\.json/i.test(text);
  const head = lines.slice(0, 12).join(' ').toLowerCase();
  const invocationHinted = /(invocation|mcp|openapi|\bapi\b|endpoint|https?:\/\/)/i.test(head);
  const described = caps.filter((c) => c.description).length;
  const versioned = caps.filter((c) => c.version).length;
  const descCov = caps.length ? described / caps.length : 0;
  const verCov = caps.length ? versioned / caps.length : 0;

  const ok = errors.length === 0;

  let score = 0;
  if (ok) {
    score = 60;
    if (summaryPresent) score += 8;
    if (structuredHinted) score += 10;
    if (invocationHinted) score += 8;
    if (descCov >= 0.8) score += 8;
    if (verCov >= 0.5) score += 6;
  }
  const grade: Report['grade'] = !ok ? 'F' : score >= 85 ? 'A' : score >= 72 ? 'B' : 'C';

  for (const e of errors) recs.push({ level: 'err', text: e });
  if (ok) {
    recs.push({ level: 'ok', text: `Parsed ${caps.length} capabilities across ${categories} ${categories === 1 ? 'category' : 'categories'}.` });
    if (!summaryPresent) recs.push({ level: 'warn', text: 'Add a one-line `>` summary at the top — what the host is and offers.' });
    if (!structuredHinted) recs.push({ level: 'warn', text: 'Publish `/.well-known/capabilities.json` (the structured form) and link it in the summary.' });
    if (!invocationHinted) recs.push({ level: 'warn', text: 'Tell agents how to invoke — point to your MCP server, OpenAPI, or API endpoint.' });
    if (descCov < 0.8) recs.push({ level: 'warn', text: `Add one-line descriptions to every capability (${described}/${caps.length} have one).` });
    if (verCov < 0.5) recs.push({ level: 'warn', text: `Add \`(vX)\` versions so agents can pin behavior (${versioned}/${caps.length} have one).` });
  }

  return { ok, grade, score, capabilities: caps, categories, errors, recommendations: recs };
}
