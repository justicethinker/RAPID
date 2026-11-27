-- RAPID accounts, tests and findings.
-- Statuses are text with checks so they can be extended without a type rewrite.
-- People are anonymised in place; rows that carry counts are never hard-deleted.

create table if not exists people (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text unique,
  email text not null,
  email_verified boolean not null default false,
  full_name text not null default '',
  phone text,
  state text not null default 'active' check (state in ('active', 'suppressed', 'deleted')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists people_email_lower_idx on people (lower(email));

create table if not exists tester_profiles (
  person_id uuid primary key references people (id) on delete restrict,
  submission_id text not null unique,
  country_code text,
  city text,
  age_band text,
  situation text,
  other_activities text[] not null default '{}',
  industry text,
  industry_other text,
  interests text[] not null default '{}',
  interests_other text,
  frustration text,
  whatsapp text,
  whatsapp_reminders boolean not null default false,
  hear_about text,
  application_status text not null default 'received'
    check (application_status in ('received', 'under_review', 'approved', 'waitlisted', 'declined', 'withdrawn')),
  applied_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references people (id) on delete set null,
  privacy_version text not null,
  schema_version text not null,
  source jsonb not null default '{}'::jsonb
);

create index if not exists tester_profiles_status_idx on tester_profiles (application_status);

create table if not exists founder_profiles (
  person_id uuid primary key references people (id) on delete restrict,
  whatsapp text,
  organisation text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists tests (
  id uuid primary key default gen_random_uuid(),
  founder_id uuid not null references people (id) on delete restrict,
  title text not null default '',
  question text not null,
  audience_code text,
  audience_description text,
  terms text not null default '',
  reward_note text,
  status text not null default 'requested'
    check (status in ('requested', 'scoping', 'recruiting', 'fielding', 'findings', 'published', 'closed', 'cancelled')),
  founder_decision text check (founder_decision in ('build', 'iterate', 'pivot')),
  decided_at timestamptz,
  created_at timestamptz not null default now(),
  published_at timestamptz,
  updated_at timestamptz not null default now()
);

create index if not exists tests_founder_idx on tests (founder_id, created_at desc);
create index if not exists tests_status_idx on tests (status);

create table if not exists invitations (
  id uuid primary key default gen_random_uuid(),
  test_id uuid not null references tests (id) on delete restrict,
  tester_id uuid not null references people (id) on delete restrict,
  status text not null default 'invited'
    check (status in ('invited', 'accepted', 'declined', 'withdrawn', 'completed', 'expired')),
  invited_by uuid references people (id) on delete set null,
  invited_at timestamptz not null default now(),
  responded_at timestamptz,
  completed_at timestamptz,
  reward_status text not null default 'not_applicable'
    check (reward_status in ('not_applicable', 'pending', 'sent')),
  reward_sent_at timestamptz,
  unique (test_id, tester_id)
);

create index if not exists invitations_test_idx on invitations (test_id);
create index if not exists invitations_tester_idx on invitations (tester_id, invited_at desc);

create table if not exists responses (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid not null unique references invitations (id) on delete restrict,
  outcome text not null check (outcome in ('tried', 'booked_call', 'collaborated', 'no_action')),
  note text not null check (char_length(note) between 20 and 1000),
  consent_to_quote boolean not null default false,
  answers jsonb not null default '{}'::jsonb,
  schema_version text not null,
  submitted_at timestamptz not null default now()
);

create table if not exists findings (
  id uuid primary key default gen_random_uuid(),
  test_id uuid not null unique references tests (id) on delete restrict,
  headline text not null default '',
  summary text not null default '',
  learnings jsonb not null default '[]'::jsonb,
  limits text not null default '',
  authored_by uuid references people (id) on delete set null,
  published_at timestamptz
);

create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  person_id uuid not null references people (id) on delete cascade,
  kind text not null check (kind in ('application_received', 'application_decision', 'invitation', 'findings_published', 'reward_sent')),
  title text not null,
  body text not null default '',
  href text,
  read_at timestamptz,
  email_sent_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists notifications_person_idx on notifications (person_id, created_at desc);

create table if not exists staff_members (
  person_id uuid primary key references people (id) on delete restrict,
  granted_by uuid references people (id) on delete set null,
  granted_at timestamptz not null default now()
);

create table if not exists email_log (
  id uuid primary key default gen_random_uuid(),
  person_id uuid references people (id) on delete set null,
  kind text not null,
  provider_id text,
  status text not null check (status in ('sent', 'failed')),
  error text,
  created_at timestamptz not null default now()
);

create index if not exists email_log_person_idx on email_log (person_id, created_at desc);

create table if not exists audit_events (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references people (id) on delete set null,
  action text not null,
  entity text not null,
  entity_id text,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists audit_events_entity_idx on audit_events (entity, entity_id);

create or replace function set_updated_at() returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists people_set_updated_at on people;
create trigger people_set_updated_at before update on people
for each row execute function set_updated_at();

drop trigger if exists tester_profiles_set_updated_at on tester_profiles;
create trigger tester_profiles_set_updated_at before update on tester_profiles
for each row execute function set_updated_at();

drop trigger if exists founder_profiles_set_updated_at on founder_profiles;
create trigger founder_profiles_set_updated_at before update on founder_profiles
for each row execute function set_updated_at();

drop trigger if exists tests_set_updated_at on tests;
create trigger tests_set_updated_at before update on tests
for each row execute function set_updated_at();
