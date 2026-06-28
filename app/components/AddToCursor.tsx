'use client';
import { track } from '@vercel/analytics';

export default function AddToCursor({ href }: { href: string }) {
  return (
    <a className="cta primary" href={href} onClick={() => track('add_to_cursor')} style={{ margin: 0 }}>
      Add to Cursor →
    </a>
  );
}
