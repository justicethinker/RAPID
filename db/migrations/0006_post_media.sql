-- Media is stored in Postgres so the existing deployment keeps its single
-- database dependency. Images are small (max 3 MB), immutable and served by
-- the API; replacing one writes a new asset and removes the old row.

create table if not exists media_assets (
  id uuid primary key default gen_random_uuid(),
  startup_id uuid not null references startups (id) on delete cascade,
  post_id uuid references posts (id) on delete cascade,
  purpose text not null
    check (purpose in ('logo', 'cover', 'post_image')),
  mime_type text not null
    check (mime_type in ('image/png', 'image/jpeg', 'image/webp')),
  byte_size integer not null
    check (byte_size > 0 and byte_size <= 3145728),
  bytes bytea not null,
  alt_text text,
  created_at timestamptz not null default now(),
  constraint media_assets_purpose_target_check check (
    (purpose in ('logo', 'cover') and post_id is null)
    or (purpose = 'post_image' and post_id is not null)
  ),
  constraint media_assets_alt_length check (alt_text is null or char_length(alt_text) <= 200)
);

-- A startup has at most one logo and one cover. A post has at most one image.
create unique index if not exists media_assets_startup_purpose_idx
  on media_assets (startup_id, purpose)
  where purpose in ('logo', 'cover');

create unique index if not exists media_assets_post_purpose_idx
  on media_assets (post_id, purpose)
  where post_id is not null;

create index if not exists media_assets_startup_idx
  on media_assets (startup_id, created_at desc);

create index if not exists media_assets_post_idx
  on media_assets (post_id, created_at desc);
