-- Staff review notes, idempotent founder requests and API rate limiting.

alter table tester_profiles add column if not exists review_note text;

alter table tests add column if not exists submission_id text;
create unique index if not exists tests_submission_id_idx
  on tests (submission_id) where submission_id is not null;

create table if not exists rate_limits (
  bucket text not null,
  window_start timestamptz not null,
  hits integer not null default 0,
  primary key (bucket, window_start)
);

create index if not exists rate_limits_start_idx on rate_limits (window_start);
