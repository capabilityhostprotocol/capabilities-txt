import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';

const BASE = 'https://capabilitiestxt.org';

export const metadata: Metadata = {
  metadataBase: new URL(BASE),
  title: 'capabilities.txt — declare what your site can do',
  description:
    'A simple, open convention for a website to declare what it can do — the capabilities an agent can discover and invoke — at a well-known location. A discovery sibling to robots.txt and llms.txt, for the agentic web.',
  alternates: {
    canonical: '/',
    types: { 'text/markdown': 'https://github.com/capabilityhostprotocol/capabilities-txt/blob/main/README.md' },
  },
  openGraph: {
    title: 'capabilities.txt',
    description: 'Declare what your site can do, so agents can discover it. A discovery sibling to robots.txt and llms.txt.',
    type: 'website',
    url: BASE,
    images: ['/og.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'capabilities.txt — declare what your site can do',
    description: 'The open convention for agents to discover what a site can do. A sibling to robots.txt and llms.txt.',
    images: ['/og.png'],
  },
  icons: {
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='7' fill='%2305070a'/%3E%3Ctext x='16' y='22' font-size='18' text-anchor='middle' fill='%2328D9F2' font-family='monospace'%3E.t%3C/text%3E%3C/svg%3E",
  },
};

const JSON_LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${BASE}/#website`,
      url: `${BASE}/`,
      name: 'capabilities.txt',
      description: 'An open convention for a website to declare what it can do — the capabilities an agent can discover and invoke.',
    },
    {
      '@type': 'TechArticle',
      headline: 'capabilities.txt — declare what your site can do',
      description: 'A simple, open convention for a website to publish the capabilities an agent can discover and invoke, at a well-known location. A discovery sibling to robots.txt and llms.txt.',
      url: `${BASE}/`,
      image: `${BASE}/og.png`,
      author: { '@type': 'Organization', name: 'Project Auxo, Inc.', url: 'https://capabilityhostprotocol.com' },
      license: 'https://creativecommons.org/licenses/by/4.0/',
      keywords: ['capabilities.txt', 'agents', 'agentic web', 'discovery', 'llms.txt', 'MCP'],
    },
    {
      '@type': 'SoftwareSourceCode',
      name: 'capabilities-txt',
      codeRepository: 'https://github.com/capabilityhostprotocol/capabilities-txt',
      programmingLanguage: 'TypeScript',
      license: 'https://www.apache.org/licenses/LICENSE-2.0',
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
