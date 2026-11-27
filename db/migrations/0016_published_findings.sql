-- Staff edit findings in place. Founder reads use the last explicit publication.
create table published_findings (
  test_id uuid primary key references findings(test_id) on delete cascade,
  headline text not null,
  summary text not null,
  learnings jsonb not null,
  limits text not null,
  recommendation text not null,
  version integer not null,
  published_at timestamptz not null
);

insert into published_findings (test_id, headline, summary, learnings, limits, recommendation, version, published_at)
select test_id, headline, summary, learnings, limits, recommendation, version, published_at
from findings where published_at is not null;
