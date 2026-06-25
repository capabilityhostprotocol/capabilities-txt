// Fetch a site's capabilities.txt (or the structured JSON form). Shared by the
// /api/check route and the /check/[domain] page. Size + timeout capped.

const MAX_BYTES = 200_000;
const TIMEOUT_MS = 10_000;

export async function fetchCapabilities(input: string): Promise<{ sourceUrl: string; text: string }> {
  let raw = input.trim();
  if (!/^https?:\/\//i.test(raw)) raw = 'https://' + raw;
  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    throw new Error('That doesn’t look like a valid URL or domain.');
  }
  if (u.protocol !== 'http:' && u.protocol !== 'https:') throw new Error('Only http(s) URLs are supported.');

  const candidates: string[] = [];
  if (/\/capabilities\.txt$/.test(u.pathname) || /capabilities\.json$/.test(u.pathname)) {
    candidates.push(u.toString());
  } else {
    candidates.push(`${u.origin}/capabilities.txt`);
    candidates.push(`${u.origin}/.well-known/capabilities.json`);
  }

  for (const c of candidates) {
    try {
      const res = await fetch(c, {
        headers: { 'User-Agent': 'capabilitiestxt.org-checker/0.1 (+https://capabilitiestxt.org)' },
        signal: AbortSignal.timeout(TIMEOUT_MS),
        redirect: 'follow',
      });
      if (res.ok) {
        const text = (await res.text()).slice(0, MAX_BYTES);
        if (text.trim()) return { sourceUrl: c, text };
      }
    } catch {
      // try next candidate
    }
  }
  throw new Error('No /capabilities.txt or /.well-known/capabilities.json found at that host.');
}
