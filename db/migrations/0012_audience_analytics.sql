-- Organic audience analytics. Events are anonymous, first-party interactions
-- with a published startup or post. A random browser-held visitor key allows
-- one count per visitor per day without storing an IP address, account ID or
-- any free-text field. The source is a small allow-listed attribution label.
create table if not exists audience_events (
  id uuid primary key default gen_random_uuid(),
  startup_id uuid not null references startups (id) on delete cascade,
  post_id uuid references posts (id) on delete cascade,
  event_type text not null
    check (event_type in ('profile_view', 'post_impression', 'post_open')),
  visitor_key text not null
    check (
      char_length(visitor_key) between 8 and 80
      and visitor_key ~ '^[A-Za-z0-9_-]+$'
    ),
  source text not null default 'unknown'
    check (source in ('discover', 'external', 'direct', 'unknown', 'startup_page')),
  event_date date not null default current_date,
  created_at timestamptz not null default now(),
  constraint audience_events_post_shape
    check (
      (event_type = 'profile_view' and post_id is null)
      or (event_type in ('post_impression', 'post_open') and post_id is not null)
    )
);

-- Postgres treats NULLs as distinct in a unique constraint, so coalesce the
-- post target in the index to make profile views daily-deduplicated too.
create unique index if not exists audience_events_daily_unique
  on audience_events (
    event_type,
    startup_id,
    coalesce(post_id, '00000000-0000-0000-0000-000000000000'::uuid),
    visitor_key,
    event_date
  );

create index if not exists audience_events_startup_date_idx
  on audience_events (startup_id, event_date desc);

create index if not exists audience_events_post_date_idx
  on audience_events (post_id, event_date desc)
  where post_id is not null;
