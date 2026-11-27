-- Phase 6: discovery and audience.
--
-- The feed reads the existing published posts. This migration only adds the
-- audience relationships and moderation records around those canonical rows;
-- it does not copy posts into a second feed table.

create table if not exists startup_follows (
  person_id uuid not null references people (id) on delete cascade,
  startup_id uuid not null references startups (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (person_id, startup_id)
);

create index if not exists startup_follows_startup_created_idx
  on startup_follows (startup_id, created_at desc);

create table if not exists post_feedback (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references posts (id) on delete cascade,
  author_id uuid not null references people (id) on delete cascade,
  body text not null,
  status text not null default 'visible'
    check (status in ('visible', 'hidden')),
  created_at timestamptz not null default now(),
  hidden_at timestamptz,
  hidden_by uuid references people (id) on delete set null,
  constraint post_feedback_body_length
    check (char_length(body) between 10 and 1000)
);

create index if not exists post_feedback_post_created_idx
  on post_feedback (post_id, created_at desc);

create index if not exists post_feedback_author_created_idx
  on post_feedback (author_id, created_at desc);

-- Demo clicks are intentionally a separate, small event table. Phase 7 can
-- replace or extend it with the full analytics event stream without changing
-- the public startup record.
create table if not exists startup_demo_clicks (
  id uuid primary key default gen_random_uuid(),
  startup_id uuid not null references startups (id) on delete cascade,
  person_id uuid references people (id) on delete set null,
  source text not null default 'startup_page',
  created_at timestamptz not null default now(),
  constraint startup_demo_clicks_source_length
    check (char_length(source) between 1 and 80)
);

create index if not exists startup_demo_clicks_startup_created_idx
  on startup_demo_clicks (startup_id, created_at desc);

-- A report is a moderation case. The target is deliberately polymorphic because
-- posts and feedback live in different tables; the API validates the target
-- before inserting. One person can report a given item once.
create table if not exists content_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references people (id) on delete cascade,
  target_type text not null check (target_type in ('post', 'feedback')),
  target_id uuid not null,
  reason text not null,
  status text not null default 'open'
    check (status in ('open', 'resolved', 'dismissed')),
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  resolved_by uuid references people (id) on delete set null,
  resolution_note text,
  constraint content_reports_reason_length
    check (char_length(reason) between 10 and 500),
  unique (reporter_id, target_type, target_id)
);

create index if not exists content_reports_status_created_idx
  on content_reports (status, created_at desc);

create index if not exists content_reports_target_idx
  on content_reports (target_type, target_id);

-- Hiding a post is reversible and leaves the founder's draft/published/archived
-- lifecycle untouched. Public queries exclude rows with moderated_at set.
alter table posts
  add column if not exists moderated_at timestamptz,
  add column if not exists moderated_by uuid references people (id) on delete set null;

create index if not exists posts_moderated_idx
  on posts (moderated_at)
  where moderated_at is not null;
