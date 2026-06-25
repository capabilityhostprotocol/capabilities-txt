'use client';
import { useState } from 'react';

export default function RegisterButton({ url }: { url: string }) {
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [msg, setMsg] = useState('');

  async function go() {
    setState('loading');
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const d = await res.json();
      if (res.ok) {
        setState('done');
        setMsg('Listed in the directory ✓');
      } else {
        setState('error');
        setMsg(d.error || 'Could not list this site.');
      }
    } catch {
      setState('error');
      setMsg('Network error — try again.');
    }
  }

  if (state === 'done')
    return (
      <p className="rec ok">
        {msg} — <a href="/directory">see the directory</a>
      </p>
    );

  return (
    <>
      <button className="cta primary" onClick={go} disabled={state === 'loading'} style={{ margin: '6px 0' }}>
        {state === 'loading' ? 'Adding…' : 'Add to the public directory'}
      </button>
      {state === 'error' && <p className="rec warn">{msg}</p>}
    </>
  );
}
