-- tester_profiles carries the shared set_updated_at trigger, so it needs the
-- column that trigger writes.
alter table tester_profiles
  add column if not exists updated_at timestamptz not null default now();
