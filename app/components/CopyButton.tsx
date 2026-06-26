'use client';
import { useState } from 'react';
import { track } from '@vercel/analytics';

export default function CopyButton({ text, label = 'Copy', event }: { text: string; label?: string; event?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      className="copybtn"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          if (event) track(event);
          setTimeout(() => setCopied(false), 1600);
        } catch {
          /* clipboard unavailable */
        }
      }}
    >
      {copied ? 'Copied ✓' : label}
    </button>
  );
}
