-- Staff access is granted, never self-served. An existing admin invites an
-- address here; the invite is claimed the first time that address signs in.

create table if not exists staff_invites (
  email text primary key,
  invited_by uuid references people (id) on delete set null,
  created_at timestamptz not null default now(),
  accepted_at timestamptz
);

create unique index if not exists staff_invites_email_lower_idx
  on staff_invites (lower(email));
