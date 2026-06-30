-- Growth pipeline funnel schema.
-- This is the queryable funnel/dashboard store. It is SEPARATE from the public
-- registry DB (db/schema.sql) — outreach data (contacts, drafts) must not live in the
-- public registry. The CHP evidence store remains the tamper-evident audit source of
-- truth (correlation_id per target); these tables are the materialized funnel for
-- dashboards (e.g. Metabase) and kill-gate metrics.
-- Run once against the Growth Neon DB: psql "$GROWTH_DATABASE_URL" -f db/growth.sql

-- A target = a domain we may reach out to (sourced from APIs.guru / adapters / by hand).
create table if not exists targets (
  domain         text primary key,
  source         text not null default 'manual',   -- apis_guru | adapter | manual
  category       text not null default '',
  grade          text,                              -- latest agent-readiness grade (A–F)
  score          integer,                           -- latest 0–100
  contact_name   text,
  contact_email  text,
  contact_handle text,                              -- social handle, if any
  status         text not null default 'new',       -- new|graded|queued|contacted|replied|published|suppressed
  notes          text not null default '',
  first_seen     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- One row per outreach attempt (a draft that may become a send), any channel.
create table if not exists outreach_attempts (
  id             text primary key,                  -- uuid
  domain         text not null references targets(domain) on delete cascade,
  channel        text not null,                     -- email | bluesky | mastodon | reddit | linkedin | x
  mode           text not null default 'auto',      -- auto (API send) | assisted (human posts)
  status         text not null default 'drafted',   -- drafted|approved|denied|sent|skipped|bounced
  subject        text not null default '',
  approved_by    text,                              -- who approved (Matrix user)
  correlation_id text,                              -- ties to the CHP evidence chain
  message_id     text,                              -- provider message id, if sent
  drafted_at     timestamptz not null default now(),
  sent_at        timestamptz
);

-- A reply to an attempt (the engagement signal).
create table if not exists replies (
  id             text primary key,                  -- uuid
  domain         text not null references targets(domain) on delete cascade,
  attempt_id     text references outreach_attempts(id) on delete set null,
  channel        text not null,
  sentiment      text not null default 'unknown',   -- positive|neutral|negative|unknown
  snippet        text not null default '',
  correlation_id text,
  received_at    timestamptz not null default now()
);

-- The conversion event: the target claimed / published a capabilities.txt.
create table if not exists claims (
  id             text primary key,                  -- uuid
  domain         text not null references targets(domain) on delete cascade,
  published_url  text,                              -- e.g. https://target.com/capabilities.txt
  verified       boolean not null default false,
  correlation_id text,
  claimed_at     timestamptz not null default now()
);

-- Do-not-contact list (opt-outs + bounces). Keyed by email OR domain.
create table if not exists suppression (
  key        text primary key,                      -- an email address or a domain
  kind       text not null default 'email',         -- email | domain
  reason     text not null default 'opt_out',       -- opt_out | bounce | manual
  added_at   timestamptz not null default now()
);

-- First-party analytics events (report views, generates, claim-intent, page views).
-- Doubles as the inbound-signal feed: a /report/<domain> view = a warm lead.
create table if not exists events (
  id       bigserial primary key,
  ts       timestamptz not null default now(),
  event    text not null,                         -- report_view | generate | register | claim_intent | ...
  domain   text,                                  -- subject domain (e.g. the graded domain)
  path     text,
  props    jsonb not null default '{}',
  session  text                                   -- anonymous session id
);

create index if not exists idx_events_event on events (event, ts);
create index if not exists idx_events_domain on events (domain) where domain is not null;
create index if not exists idx_targets_status on targets (status);
create index if not exists idx_attempts_domain on outreach_attempts (domain);
create index if not exists idx_attempts_status on outreach_attempts (status);
create index if not exists idx_attempts_channel on outreach_attempts (channel);
create index if not exists idx_replies_domain on replies (domain);
create index if not exists idx_claims_domain on claims (domain);
