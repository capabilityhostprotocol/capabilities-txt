-- capabilities.txt registry schema (Phase 2).
-- Run once in the Neon SQL editor (or: psql "$DATABASE_URL" -f db/schema.sql).

create table if not exists sites (
  domain           text primary key,
  capabilities_url text not null,
  grade            text not null,
  score            integer not null default 0,
  cap_count        integer not null default 0,
  status           text not null default 'active',   -- active | dead
  first_seen       timestamptz not null default now(),
  last_checked     timestamptz not null default now()
);

create table if not exists capabilities (
  domain        text not null references sites(domain) on delete cascade,
  capability_id text not null,
  version       text not null default '',
  description   text not null default '',
  category      text not null default '',
  primary key (domain, capability_id)
);

-- Discovery: find which sites can do X (Phase 3 query surface).
create index if not exists idx_caps_id on capabilities (capability_id);
create index if not exists idx_caps_desc on capabilities using gin (to_tsvector('english', description));
create index if not exists idx_sites_status on sites (status);
