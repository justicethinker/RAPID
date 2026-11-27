-- Founder workspace: a public startup profile, its published posts, and the
-- people who asked to hear from the founder. These are separate from research
-- tests and findings, which remain owned by the existing founder flow.

create table if not exists startups (
  id uuid primary key default gen_random_uuid(),
  founder_id uuid not null references people (id) on delete cascade,
  name text not null,
  slug text not null unique,
  description text not null,
  category text not null,
  stage text,
  website_url text,
  visibility text not null default 'draft'
    check (visibility in ('draft', 'published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint startups_name_length check (char_length(name) between 2 and 80),
  constraint startups_description_length check (char_length(description) between 20 and 500),
  constraint startups_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint startups_category_check
    check (category in ('consumer', 'marketplace', 'fintech', 'health', 'education', 'b2b', 'climate', 'other')),
  constraint startups_stage_check
    check (stage is null or stage in ('idea', 'building', 'prototype', 'beta', 'launched')),
  constraint startups_website_length check (website_url is null or char_length(website_url) <= 300)
);

-- Milestone A gives each founder one startup. The unique constraint makes the
-- ownership boundary explicit and can be relaxed when team membership arrives.
create unique index if not exists startups_founder_id_idx on startups (founder_id);

create index if not exists startups_public_idx
  on startups (visibility, created_at desc);

create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  startup_id uuid not null references startups (id) on delete cascade,
  author_id uuid not null references people (id) on delete cascade,
  kind text not null default 'showcase'
    check (kind in ('showcase', 'validation')),
  title text not null,
  body text not null,
  status text not null default 'draft'
    check (status in ('draft', 'published', 'archived')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint posts_title_length check (char_length(title) between 3 and 120),
  constraint posts_body_length check (char_length(body) between 20 and 4000),
  constraint posts_published_at_check
    check (status <> 'published' or published_at is not null)
);

create index if not exists posts_startup_created_idx
  on posts (startup_id, created_at desc);

create index if not exists posts_public_idx
  on posts (startup_id, status, published_at desc);

create table if not exists waitlist_entries (
  id uuid primary key default gen_random_uuid(),
  startup_id uuid not null references startups (id) on delete cascade,
  person_id uuid references people (id) on delete set null,
  email text not null,
  name text,
  consent boolean not null default false,
  source text,
  created_at timestamptz not null default now(),
  constraint waitlist_consent_check check (consent = true),
  constraint waitlist_email_length check (char_length(email) between 3 and 254),
  constraint waitlist_name_length check (name is null or char_length(name) <= 80),
  constraint waitlist_source_length check (source is null or char_length(source) <= 80)
);

-- Email is stored lower-case by the API. One address joins a given startup once.
create unique index if not exists waitlist_entries_startup_email_idx
  on waitlist_entries (startup_id, email);

create index if not exists waitlist_entries_startup_created_idx
  on waitlist_entries (startup_id, created_at desc);

drop trigger if exists startups_set_updated_at on startups;
create trigger startups_set_updated_at before update on startups
for each row execute function set_updated_at();

drop trigger if exists posts_set_updated_at on posts;
create trigger posts_set_updated_at before update on posts
for each row execute function set_updated_at();
