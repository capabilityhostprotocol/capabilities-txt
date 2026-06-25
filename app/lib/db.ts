// Registry persistence (Phase 2). Uses Neon's serverless driver — ideal for
// Vercel Functions. Degrades gracefully: with no DATABASE_URL the registry
// features are simply disabled, so the rest of the site keeps working.
import { neon, type NeonQueryFunction } from '@neondatabase/serverless';

const url = process.env.DATABASE_URL || process.env.POSTGRES_URL || '';

export const dbEnabled = Boolean(url);
export const sql: NeonQueryFunction<false, false> | null = url ? neon(url) : null;

export interface SiteRow {
  domain: string;
  capabilities_url: string;
  grade: string;
  score: number;
  cap_count: number;
  status: string;
  first_seen: string;
  last_checked: string;
}
