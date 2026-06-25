import { analyze } from '../../lib/conformance';
import { fetchCapabilities } from '../../lib/fetchCapabilities';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const COLORS: Record<string, string> = { A: '#34d399', B: '#28d9f2', C: '#fbbf24', F: '#f87171' };

export async function GET(req: Request) {
  const domain = new URL(req.url).searchParams.get('domain')?.trim() ?? '';
  let grade = '?';
  try {
    if (domain) grade = analyze((await fetchCapabilities(domain)).text).grade;
  } catch {
    grade = '–';
  }
  const color = COLORS[grade] ?? '#5b6168';

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="138" height="20" role="img" aria-label="capabilities.txt: ${grade}">
  <title>capabilities.txt: ${grade}</title>
  <rect rx="3" width="138" height="20" fill="#1d2228"/>
  <rect rx="3" x="108" width="30" height="20" fill="${color}"/>
  <rect x="108" width="6" height="20" fill="${color}"/>
  <g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="11">
    <text x="54" y="14">capabilities.txt</text>
    <text x="123" y="14" font-weight="700" fill="#05070a">${grade}</text>
  </g>
</svg>`;

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
