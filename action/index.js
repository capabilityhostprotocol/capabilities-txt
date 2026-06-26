// capabilities.txt GitHub Action — generate /capabilities.txt from an OpenAPI doc
// in CI, so it stays current with zero ongoing effort. Dependency-free (Node 20).
// Mirrors app/lib/fromOpenapi.ts + tools/from_openapi.py.
const fs = require('node:fs');
const path = require('node:path');

const HTTP_METHODS = ['get', 'put', 'post', 'delete', 'patch'];
const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
const firstLine = (s) => (s ? String(s).trim().split('\n')[0].split(/\s+/).join(' ') : '');

function capId(op, method, p) {
  if (op.operationId) return slug(op.operationId);
  const parts = p.split('/').filter((x) => x && !x.startsWith('{'));
  return (parts.map(slug).join('.') || 'root') + '.' + method;
}

function collect(doc) {
  const version = String((doc.info && doc.info.version) || '').trim();
  const groups = {};
  for (const [p, item] of Object.entries(doc.paths || {})) {
    if (!item || typeof item !== 'object') continue;
    for (const method of HTTP_METHODS) {
      const op = item[method];
      if (!op || typeof op !== 'object') continue;
      const group = String((op.tags && op.tags[0]) || p.split('/')[1] || 'general');
      const desc = firstLine(op.summary || op.description || `${method.toUpperCase()} ${p}`);
      (groups[group] = groups[group] || []).push({ id: capId(op, method, p), version, description: desc });
    }
  }
  return groups;
}

function generateTxt(doc) {
  const title = (doc.info && doc.info.title) || 'this API';
  const base = (doc.servers && doc.servers[0] && doc.servers[0].url) || '';
  const groups = collect(doc);
  const lines = ['# capabilities.txt', '', `> ${title} — capabilities generated from its OpenAPI description.`];
  if (base) lines.push(`> Invocation: ${base} (see the OpenAPI spec for request shapes).`);
  lines.push('');
  for (const [group, caps] of Object.entries(groups)) {
    const g = group.charAt(0).toUpperCase() + group.slice(1);
    lines.push(`## ${g}`, '', `### ${g} (${slug(group)})`, '');
    for (const c of caps) lines.push(`- ${c.id}${c.version ? ` (v${c.version})` : ''}${c.description ? ` — ${c.description}` : ''}`);
    lines.push('');
  }
  return lines.join('\n').replace(/\n+$/, '') + '\n';
}

function generateJson(doc) {
  const caps = Object.values(collect(doc)).flat().map((c) => ({ id: c.id, version: c.version || undefined, description: c.description || undefined }));
  return JSON.stringify({ version: '1', capabilities: caps }, null, 2) + '\n';
}

async function load(src) {
  if (/^https?:\/\//i.test(src)) {
    const res = await fetch(src, { headers: { 'User-Agent': 'capabilities-txt-action' } });
    if (!res.ok) throw new Error(`Could not fetch ${src} (HTTP ${res.status})`);
    return res.json();
  }
  return JSON.parse(fs.readFileSync(src, 'utf8'));
}

function setOutput(name, value) {
  if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, `${name}=${value}\n`);
}

(async () => {
  try {
    const openapi = process.env.INPUT_OPENAPI;
    const output = process.env.INPUT_OUTPUT || 'public/capabilities.txt';
    const structured = (process.env.INPUT_STRUCTURED || 'false').toLowerCase() === 'true';
    if (!openapi) throw new Error('Input "openapi" is required.');

    const doc = await load(openapi);
    if (!doc.paths) throw new Error('That document has no `paths` — is it an OpenAPI spec?');

    const txt = generateTxt(doc);
    fs.mkdirSync(path.dirname(output), { recursive: true });
    fs.writeFileSync(output, txt);
    const count = txt.split('\n').filter((l) => l.startsWith('- ')).length;
    console.log(`✓ Wrote ${output} (${count} capabilities)`);

    if (structured) {
      const jsonOut = path.join(path.dirname(output), '.well-known', 'capabilities.json');
      fs.mkdirSync(path.dirname(jsonOut), { recursive: true });
      fs.writeFileSync(jsonOut, generateJson(doc));
      console.log(`✓ Wrote ${jsonOut}`);
    }
    setOutput('capabilities', String(count));
  } catch (e) {
    console.error(`::error::${e && e.message ? e.message : e}`);
    process.exit(1);
  }
})();
