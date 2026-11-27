-- Milestone B connects a validation request to the founder's startup and
-- records the brief the team agrees before recruitment. The report itself gains
-- a suggested next step, separate from the founder's recorded decision.

alter table tests
  add column if not exists startup_id uuid references startups (id) on delete set null;

alter table tests
  add column if not exists method text
    check (method is null or char_length(method) <= 500);

alter table tests
  add column if not exists sample_target integer
    check (sample_target is null or sample_target between 1 and 1000);

alter table tests
  add column if not exists report_due_at timestamptz;

alter table findings
  add column if not exists recommendation text not null default ''
    check (char_length(recommendation) <= 1000);

-- Existing tests belong to founders who may now have a startup. This is a
-- backfill only; new requests set the relation explicitly when one exists.
update tests t
   set startup_id = s.id
  from startups s
 where s.founder_id = t.founder_id
   and t.startup_id is null;

create index if not exists tests_startup_idx on tests (startup_id, created_at desc);
