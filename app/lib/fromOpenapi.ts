// Generate a capabilities.txt from an OpenAPI 3.x document — TS port of
// tools/from_openapi.py, used by the hosted /generate tool. Keep them in sync.

const HTTP_METHODS = ['get', 'put', 'post', 'delete', 'patch'] as const;

function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
}

function firstLine(s?: string): string {
  return s ? s.trim().split('\n')[0].split(/\s+/).join(' ') : '';
}

function capId(op: { operationId?: string }, method: string, path: string): string {
  if (op.operationId) return slug(op.operationId);
  const parts = path.split('/').filter((p) => p && !p.startsWith('{'));
  const base = parts.map(slug).join('.') || 'root';
  return `${base}.${method}`;
}

type OpenApiDoc = {
  info?: { title?: string; version?: string };
  servers?: { url?: string }[];
  paths?: Record<string, Record<string, { tags?: string[]; summary?: string; description?: string; operationId?: string }>>;
};

export function generateFromOpenApi(doc: OpenApiDoc): string {
  const info = doc.info ?? {};
  const title = info.title ?? 'this API';
  const version = String(info.version ?? '').trim();
  const base = doc.servers?.[0]?.url ?? '';

  const groups: Record<string, [string, string, string][]> = {};
  for (const [path, item] of Object.entries(doc.paths ?? {})) {
    if (!item || typeof item !== 'object') continue;
    for (const method of HTTP_METHODS) {
      const op = item[method];
      if (!op || typeof op !== 'object') continue;
      const tag = op.tags?.[0];
      const group = String(tag ?? (path.split('/')[1] || 'general'));
      const desc = firstLine(op.summary || op.description || `${method.toUpperCase()} ${path}`);
      (groups[group] ??= []).push([capId(op, method, path), version, desc]);
    }
  }

  const lines = ['# capabilities.txt', '', `> ${title} — capabilities generated from its OpenAPI description.`];
  if (base) lines.push(`> Invocation: ${base} (see the OpenAPI spec for request shapes).`);
  lines.push('');

  for (const [group, caps] of Object.entries(groups)) {
    const g = group.charAt(0).toUpperCase() + group.slice(1);
    lines.push(`## ${g}`, '', `### ${g} (${slug(group)})`, '');
    for (const [cid, ver, desc] of caps) {
      const v = ver ? ` (v${ver})` : '';
      const d = desc ? ` — ${desc}` : '';
      lines.push(`- ${cid}${v}${d}`);
    }
    lines.push('');
  }
  return lines.join('\n').replace(/\n+$/, '') + '\n';
}
