-- Phase 6: a validation post can point at one of the founder's tests. The post
-- remains the canonical public record; the test holds the participation rules.
-- Eligibility and the closing date are public context, not research findings.

alter table posts
  add column if not exists test_id uuid references tests (id) on delete set null;

alter table posts
  add column if not exists eligibility text;

alter table posts
  add column if not exists closes_at timestamptz;

alter table posts drop constraint if exists posts_eligibility_length;
alter table posts add constraint posts_eligibility_length
  check (eligibility is null or char_length(eligibility) <= 500);

create index if not exists posts_test_idx
  on posts (test_id)
  where test_id is not null;
