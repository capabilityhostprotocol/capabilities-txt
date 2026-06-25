# Registry database (Phase 2)

The directory + discovery features use a Postgres database (Neon). Until it's
connected, the app degrades gracefully: `/directory` shows a "connecting" notice,
`/api/register` returns 503, and everything else works.

## Provision Neon (one time, ~2 min)

**Dashboard (recommended):** Vercel → the `capabilities-txt` project → **Storage**
→ **Create Database** → **Neon** → connect. This auto-provisions the database and
injects `DATABASE_URL` (and friends) into the project's env vars.

**Or CLI:**

```bash
vercel link            # link this repo to the capabilities-txt project
vercel integration add neon
vercel env pull .env.local   # to develop locally against it
```

## Create the tables

Run [`schema.sql`](schema.sql) once — paste it into the **Neon SQL Editor**, or:

```bash
psql "$DATABASE_URL" -f db/schema.sql
```

## Cron (freshness)

`vercel.json` schedules `GET /api/cron/recheck` daily (re-checks listed sites,
marks dead ones). Set a **`CRON_SECRET`** env var in the project so the endpoint
requires Vercel's Bearer token. (Crons run in production only.)

## Then

Redeploy. `/directory` and the "Add to the public directory" button on a check
result go live. Listed sites are stored in `sites` + `capabilities` and re-checked
daily.

Schema: `sites(domain, capabilities_url, grade, score, cap_count, status, first_seen, last_checked)`
and `capabilities(domain, capability_id, version, description, category)`.
